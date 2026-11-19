import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.job_role import JobRole, ScoringWeightConfig, JobRoleSkill, Skill, ATSKeyword
from app.services.nlp_engine import NLPEngineService
from app.services.jd_extractor import JDExtractorService
from app.services.recommendation_engine import RecommendationEngine

class ScoringEngineService:
    @staticmethod
    def get_active_weights(db: Session) -> ScoringWeightConfig:
        config = db.query(ScoringWeightConfig).filter(ScoringWeightConfig.is_active == True).first()
        if not config:
            config = ScoringWeightConfig(
                version="v1.0.0",
                required_skills_weight=0.30,
                preferred_skills_weight=0.10,
                keyword_relevance_weight=0.20,
                experience_relevance_weight=0.15,
                education_relevance_weight=0.10,
                project_relevance_weight=0.10,
                formatting_weight=0.05,
                is_active=True
            )
        return config

    @staticmethod
    def calculate_ats_score(
        db: Session,
        job_role: JobRole,
        raw_text: str,
        sections: Dict[str, str],
        total_pages: int,
        custom_jd: str = None
    ) -> Dict[str, Any]:
        """
        Executes deterministic 100-point ATS analysis.
        """
        weights = ScoringEngineService.get_active_weights(db)

        # 1. Gather Role Skills from Centralized DB
        role_skills = db.query(JobRoleSkill).filter(JobRoleSkill.job_role_id == job_role.id).all()
        required_role_skills = [rs for rs in role_skills if rs.importance == "Required"]
        preferred_role_skills = [rs for rs in role_skills if rs.importance == "Preferred"]

        # Parse custom JD if provided
        jd_data = JDExtractorService.extract_from_jd(custom_jd, db) if custom_jd else {"has_jd": False}

        # Build skill match evaluation list
        # We merge role skills with any JD extracted skills without duplicates
        skills_to_evaluate = {}
        for rs in required_role_skills:
            skill = db.query(Skill).filter(Skill.id == rs.skill_id).first()
            if skill:
                skills_to_evaluate[skill.name] = {
                    "skill": skill,
                    "importance": "Required",
                    "weight": rs.weight,
                    "relevance": rs.relevance,
                    "source": "role"
                }

        for rs in preferred_role_skills:
            skill = db.query(Skill).filter(Skill.id == rs.skill_id).first()
            if skill and skill.name not in skills_to_evaluate:
                skills_to_evaluate[skill.name] = {
                    "skill": skill,
                    "importance": "Preferred",
                    "weight": rs.weight,
                    "relevance": rs.relevance,
                    "source": "role"
                }

        # Merge JD skills
        if jd_data.get("has_jd"):
            for s in jd_data.get("required_skills", []):
                if s.name not in skills_to_evaluate:
                    skills_to_evaluate[s.name] = {
                        "skill": s,
                        "importance": "Required",
                        "weight": 1.2,
                        "relevance": 1.0,
                        "source": "job_description"
                    }
            for s in jd_data.get("preferred_skills", []):
                if s.name not in skills_to_evaluate:
                    skills_to_evaluate[s.name] = {
                        "skill": s,
                        "importance": "Preferred",
                        "weight": 1.0,
                        "relevance": 0.8,
                        "source": "job_description"
                    }

        # 2. Perform Match on Each Skill
        required_matched = []
        required_missing = []
        preferred_matched = []
        preferred_missing = []
        partial_matched = []
        all_match_results = []

        total_req_points = 0.0
        earned_req_points = 0.0

        total_pref_points = 0.0
        earned_pref_points = 0.0

        for skill_name, data in skills_to_evaluate.items():
            skill_obj = data["skill"]
            importance = data["importance"]
            status, matched_term, snippet, confidence = NLPEngineService.match_skill(
                skill_name=skill_name,
                synonyms=skill_obj.synonyms,
                sections=sections,
                raw_text=raw_text
            )

            result_item = {
                "skill_name": skill_name,
                "category": skill_obj.category,
                "importance": importance,
                "status": status,
                "matched_term": matched_term,
                "context_snippet": snippet,
                "confidence_score": confidence,
                "source": data["source"]
            }
            all_match_results.append(result_item)

            if importance == "Required":
                total_req_points += data["weight"]
                if status == "matched":
                    earned_req_points += data["weight"] * confidence
                    required_matched.append(result_item)
                elif status == "partial":
                    earned_req_points += data["weight"] * 0.5 * confidence
                    partial_matched.append(result_item)
                else:
                    required_missing.append(result_item)
            else:
                total_pref_points += data["weight"]
                if status == "matched":
                    earned_pref_points += data["weight"] * confidence
                    preferred_matched.append(result_item)
                elif status == "partial":
                    earned_pref_points += data["weight"] * 0.5 * confidence
                    partial_matched.append(result_item)
                else:
                    preferred_missing.append(result_item)

        # Calculate Normalized Required & Preferred Scores [0..1]
        req_score_norm = (earned_req_points / total_req_points) if total_req_points > 0 else 1.0
        pref_score_norm = (earned_pref_points / total_pref_points) if total_pref_points > 0 else 0.85
        req_score_norm = min(1.0, max(0.0, req_score_norm))
        pref_score_norm = min(1.0, max(0.0, pref_score_norm))

        # 3. Keyword Relevance Score [0..1]
        # Query total ATS keywords associated with these skills
        matched_kw_set = set()
        for m in required_matched + preferred_matched + partial_matched:
            matched_kw_set.add(m["skill_name"].lower())
            if m.get("matched_term"):
                matched_kw_set.add(m["matched_term"].lower())

        total_keywords_count = max(len(skills_to_evaluate), 1)
        matched_keywords_count = len(required_matched) + len(preferred_matched)
        keyword_coverage = min(1.0, matched_keywords_count / total_keywords_count)
        keyword_score_norm = keyword_coverage

        # 4. Experience Relevance Score [0..1]
        exp_text = sections.get("experience", "")
        if not exp_text and sections.get("projects"):
            exp_text = sections.get("projects", "")

        role_target_summary = f"{job_role.title}: {job_role.description} Key skills: {', '.join(skills_to_evaluate.keys())}"
        exp_semantic_sim = NLPEngineService.compute_semantic_similarity(exp_text, role_target_summary)
        
        # Check years of experience if mentioned
        years_exp_found = 0
        exp_year_matches = re.findall(r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience", raw_text, re.IGNORECASE)
        if exp_year_matches:
            years_exp_found = max([int(y) for y in exp_year_matches if int(y) < 40], default=0)

        # Baseline experience score combination
        if exp_text.strip():
            exp_score_norm = min(1.0, exp_semantic_sim * 0.7 + (0.3 if years_exp_found >= 1 or len(exp_text.split()) > 80 else 0.15))
        else:
            exp_score_norm = 0.40  # Entry level / no separate experience section

        # 5. Education Relevance Score [0..1]
        edu_text = sections.get("education", "") + " " + raw_text
        edu_score_norm = 0.50  # Baseline
        if re.search(r"\b(computer\s+science|information\s+technology|software\s+engineering|data\s+science|electrical|electronics|mathematics|statistics)\b", edu_text, re.IGNORECASE):
            edu_score_norm += 0.30
        if re.search(r"\b(bachelor|b\.?tech|b\.?e\.?|b\.?s\.?|master|m\.?tech|m\.?s\.?|ph\.?d)\b", edu_text, re.IGNORECASE):
            edu_score_norm += 0.20
        edu_score_norm = min(1.0, edu_score_norm)

        # 6. Project Relevance Score [0..1]
        proj_text = sections.get("projects", "")
        if proj_text.strip():
            proj_semantic_sim = NLPEngineService.compute_semantic_similarity(proj_text, role_target_summary)
            proj_score_norm = min(1.0, proj_semantic_sim * 0.8 + 0.2)
        else:
            proj_score_norm = 0.50

        # 7. Formatting Analysis & Score [0..1]
        formatting_results = NLPEngineService.analyze_formatting(raw_text, sections, total_pages)
        formatting_score_norm = formatting_results["score"] / 100.0

        # 8. Compute Weighted Total 100-Point Score
        overall_score = (
            weights.required_skills_weight * req_score_norm +
            weights.preferred_skills_weight * pref_score_norm +
            weights.keyword_relevance_weight * keyword_score_norm +
            weights.experience_relevance_weight * exp_score_norm +
            weights.education_relevance_weight * edu_score_norm +
            weights.project_relevance_weight * proj_score_norm +
            weights.formatting_weight * formatting_score_norm
        ) * 100.0

        overall_score = round(min(100.0, max(10.0, overall_score)), 1)

        # 9. Generate Actionable Recommendations & Strengths
        strengths, recommendations = RecommendationEngine.generate_recommendations(
            overall_score=overall_score,
            missing_required_skills=[m["skill_name"] for m in required_missing],
            missing_preferred_skills=[m["skill_name"] for m in preferred_missing],
            partial_skills=[m["skill_name"] for m in partial_matched],
            formatting_feedback=formatting_results,
            has_metrics=len(formatting_results.get("passes", [])) >= 2,
            role_title=job_role.title
        )

        return {
            "overall_score": overall_score,
            "scoring_version": weights.version,
            "weights": {
                "required_skills": weights.required_skills_weight,
                "preferred_skills": weights.preferred_skills_weight,
                "keyword_relevance": weights.keyword_relevance_weight,
                "experience_relevance": weights.experience_relevance_weight,
                "education_relevance": weights.education_relevance_weight,
                "project_relevance": weights.project_relevance_weight,
                "formatting": weights.formatting_weight
            },
            "category_scores": {
                "required_skills": round(req_score_norm, 2),
                "preferred_skills": round(pref_score_norm, 2),
                "keyword_relevance": round(keyword_score_norm, 2),
                "experience_relevance": round(exp_score_norm, 2),
                "education_relevance": round(edu_score_norm, 2),
                "project_relevance": round(proj_score_norm, 2),
                "formatting": round(formatting_score_norm, 2)
            },
            "skill_matches": {
                "required_matched": required_matched,
                "required_missing": required_missing,
                "preferred_matched": preferred_matched,
                "preferred_missing": preferred_missing,
                "partial_matched": partial_matched
            },
            "keyword_metrics": {
                "total_role_keywords": total_keywords_count,
                "matched_keywords_count": matched_keywords_count,
                "coverage_percentage": round(keyword_coverage * 100.0, 1),
                "matched_keywords": [m["skill_name"] for m in required_matched + preferred_matched],
                "missing_keywords": [m["skill_name"] for m in required_missing + preferred_missing]
            },
            "formatting_feedback": formatting_results,
            "experience_analysis": {
                "years_found": years_exp_found,
                "relevance_score": round(exp_score_norm * 100.0, 1),
                "semantic_similarity": round(exp_semantic_sim * 100.0, 1),
                "has_experience_section": bool(sections.get("experience"))
            },
            "education_analysis": {
                "relevance_score": round(edu_score_norm * 100.0, 1),
                "has_education_section": bool(sections.get("education"))
            },
            "project_analysis": {
                "relevance_score": round(proj_score_norm * 100.0, 1),
                "has_projects_section": bool(sections.get("projects"))
            },
            "strengths": strengths,
            "recommendations": recommendations,
            "custom_jd_applied": jd_data.get("has_jd", False),
            "jd_extracted_data": jd_data
        }

