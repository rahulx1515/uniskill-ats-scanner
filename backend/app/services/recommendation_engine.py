from typing import List, Dict, Any, Tuple

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(
        overall_score: float,
        missing_required_skills: List[str],
        missing_preferred_skills: List[str],
        partial_skills: List[str],
        formatting_feedback: Dict[str, Any],
        has_metrics: bool,
        role_title: str
    ) -> Tuple[List[str], List[str]]:
        """
        Returns (strengths, recommendations).
        Provides strictly authentic, actionable suggestions without fabricating qualifications.
        """
        strengths = []
        recommendations = []

        # Strengths evaluation
        if overall_score >= 80:
            strengths.append(f"Outstanding ATS alignment for target role '{role_title}' with strong technical keyword density.")
        elif overall_score >= 65:
            strengths.append(f"Solid foundational skill match for '{role_title}', covering several primary required competencies.")

        passes = formatting_feedback.get("passes", [])
        for p in passes[:3]:
            strengths.append(p)

        if not missing_required_skills:
            strengths.append("100% match on core required technical skills for this job role.")
        elif len(missing_required_skills) <= 2:
            strengths.append("Demonstrated high coverage of mandatory role skills.")

        # Recommendations evaluation
        # 1. Missing Required Skills
        if missing_required_skills:
            top_missing = missing_required_skills[:4]
            recommendations.append(
                f"Highlight your experience with core required technologies ({', '.join(top_missing)}) if you have utilized them in your coursework, personal projects, or internships."
            )

        # 2. Missing Preferred Skills
        if missing_preferred_skills:
            top_pref = missing_preferred_skills[:3]
            recommendations.append(
                f"Consider gaining familiarity with or showcasing preferred tools ({', '.join(top_pref)}) to stand out against competing candidates."
            )

        # 3. Partially Matched Skills
        if partial_skills:
            recommendations.append(
                f"Clarify partially matched competencies ({', '.join(partial_skills[:3])}) by explicitly using their standard industry terminology in your skills or experience sections."
            )

        # 4. Formatting & Section Recommendations
        missing_sections = formatting_feedback.get("missing_sections", [])
        if missing_sections:
            recommendations.append(
                f"Add clear, standard section headings for: {', '.join(missing_sections)}. ATS parsers rely on recognized headers to categorize candidate data."
            )

        # 5. Quantifiable Achievements
        if not has_metrics or len(formatting_feedback.get("passes", [])) < 3:
            recommendations.append(
                "Enhance project and work bullet points using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Example: 'Reduced query latency by 35% by implementing Redis caching'."
            )

        # 6. Contact Information
        contact_info = formatting_feedback.get("contact_info", {})
        if not contact_info.get("linkedin"):
            recommendations.append("Include your customized LinkedIn profile URL in the resume header to facilitate recruiter background checks.")
        if not contact_info.get("github") and "Developer" in role_title or "Engineer" in role_title:
            recommendations.append("Add a link to your active GitHub profile or technical portfolio demonstrating functional code repositories.")

        # Ensure at least 3 actionable recommendations and 2 strengths
        if not strengths:
            strengths.append("Clear resume presentation with parseable text elements.")
            strengths.append("Appropriate baseline document structure for applicant tracking systems.")

        if len(recommendations) < 3:
            recommendations.append("Regularly tailor your resume keywords for each specific job posting to align with ATS filters.")

        return strengths, recommendations


