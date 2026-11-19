import re
from typing import Dict, Any, List, Set
from sqlalchemy.orm import Session
from app.models.job_role import Skill, ATSKeyword

class JDExtractorService:
    @staticmethod
    def extract_from_jd(jd_text: str, db: Session) -> Dict[str, Any]:
        """
        Parses custom pasted job description to extract required skills, preferred skills,
        experience requirements, education requirements, and responsibilities.
        """
        if not jd_text or not jd_text.strip():
            return {
                "has_jd": False,
                "required_skills": [],
                "preferred_skills": [],
                "experience_years": None,
                "experience_text": None,
                "education_level": None,
                "responsibilities": [],
                "extracted_keywords": []
            }

        text_lower = jd_text.lower()

        # 1. Experience Requirements Extraction (e.g. "3+ years", "5-7 years of experience")
        exp_patterns = [
            r"(\d{1,2}\s*(?:-\s*\d{1,2}|\+)?\s*(?:years|yrs)\s+(?:of\s+)?(?:experience|exp|relevant\s+experience))",
            r"((?:minimum|at\s+least)\s+\d{1,2}\s*(?:years|yrs))"
        ]
        experience_text = None
        experience_years = 0
        for pattern in exp_patterns:
            match = re.search(pattern, jd_text, re.IGNORECASE)
            if match:
                experience_text = match.group(1).strip()
                # Parse numeric years
                num_match = re.search(r"\d+", experience_text)
                if num_match:
                    experience_years = int(num_match.group(0))
                break

        # 2. Education Requirements Extraction
        edu_patterns = [
            (r"\b(ph\.?d|doctorate)\b", "Doctorate / Ph.D."),
            (r"\b(master'?s|ms|m\.s\.|mtech|m\.tech|mba)\b", "Master's Degree"),
            (r"\b(bachelor'?s|bs|b\.s\.|btech|b\.tech|be|b\.e\.|undergraduate)\b", "Bachelor's Degree"),
            (r"\b(associate'?s|diploma)\b", "Associate's / Diploma")
        ]
        education_level = None
        for pattern, degree in edu_patterns:
            if re.search(pattern, jd_text, re.IGNORECASE):
                education_level = degree
                break

        # 3. Responsibilities Extraction (e.g., lines starting with bullet points, 'Responsibility', 'You will', etc.)
        responsibilities = []
        for line in jd_text.split("\n"):
            clean_l = line.strip(" -*•\t")
            if (len(clean_l) > 20 and 
                any(clean_l.lower().startswith(prefix) for prefix in [
                    "design", "build", "develop", "maintain", "collaborate", "lead", "architect",
                    "implement", "optimize", "test", "create", "participate", "work with", "responsible for"
                ])):
                responsibilities.append(clean_l)
            if len(responsibilities) >= 6:
                break

        # 4. Extract known skills from DB matched in JD
        all_db_skills = db.query(Skill).all()
        matched_required_skills = []
        matched_preferred_skills = []
        extracted_keywords = []

        # Segment JD into sections if present (e.g. Requirements vs Nice to Have)
        req_segment = ""
        pref_segment = ""
        
        req_headers = r"(?:requirements|qualifications|what\s+you'?ll\s+need|must\s+have|required\s+skills)"
        pref_headers = r"(?:preferred|nice\s+to\s+have|bonus|plus|desirable|good\s+to\s+have)"

        parts = re.split(f"({req_headers}|{pref_headers})", jd_text, flags=re.IGNORECASE)
        current_type = "req"
        for part in parts:
            p_low = part.lower()
            if re.match(req_headers, p_low):
                current_type = "req"
            elif re.match(pref_headers, p_low):
                current_type = "pref"
            else:
                if current_type == "req":
                    req_segment += " " + part
                else:
                    pref_segment += " " + part

        if not req_segment and not pref_segment:
            req_segment = jd_text

        req_segment_low = req_segment.lower()
        pref_segment_low = pref_segment.lower()

        for skill in all_db_skills:
            all_names = [skill.name] + (skill.synonyms or [])
            matched = False
            for n in all_names:
                n_esc = re.escape(n.lower())
                # Symbol handling
                if n.lower() == "c++":
                    pattern = r"(?:^|[\s,;:(/])c\+\+(?:$|[\s,;:)./])"
                elif n.lower() == "c#":
                    pattern = r"(?:^|[\s,;:(/])c#(?:$|[\s,;:)./])"
                elif n.lower() == "r":
                    pattern = r"(?:^|[\s,;:(/])(?:r\s+programming|r\s+language)(?:$|[\s,;:)./])"
                else:
                    pattern = rf"(?:^|[\s,;:(/]){n_esc}(?:$|[\s,;:)./])"

                if re.search(pattern, pref_segment_low):
                    matched_preferred_skills.append(skill)
                    extracted_keywords.append(skill.name)
                    matched = True
                    break
                elif re.search(pattern, req_segment_low):
                    matched_required_skills.append(skill)
                    extracted_keywords.append(skill.name)
                    matched = True
                    break

        return {
            "has_jd": True,
            "required_skills": matched_required_skills,
            "preferred_skills": matched_preferred_skills,
            "experience_years": experience_years,
            "experience_text": experience_text,
            "education_level": education_level,
            "responsibilities": responsibilities,
            "extracted_keywords": list(set(extracted_keywords))
        }

