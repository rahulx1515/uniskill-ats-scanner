import re
from typing import Dict, Any, List, Tuple, Set, Optional
import numpy as np

# Try importing spacy and sentence_transformers
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

try:
    from sentence_transformers import SentenceTransformer
    # Initialize a lightweight transformer for fast local semantic similarity
    _transformer_model = None
except Exception:
    _transformer_model = None

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def get_sentence_model():
    global _transformer_model
    if _transformer_model is None:
        try:
            # Try loading cached all-MiniLM-L6-v2 locally
            _transformer_model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
        except Exception:
            try:
                _transformer_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                _transformer_model = False
    return _transformer_model if _transformer_model is not False else None

class NLPEngineService:
    # Context stop-words or false-positive indicators for common words
    FALSE_POSITIVE_PATTERNS = {
        "java": [r"\bjava\s+island\b", r"\bisland\s+of\s+java\b", r"\bcoffee\s+bean\b"],
        "python": [r"\bmonty\s+python\b", r"\bpython\s+snake\b"],
        "go": [r"\bgo\s+to\b", r"\bgo\s+ahead\b", r"\blet\s+go\b", r"\bgo\s+on\b"],
        "r": [r"\bmodel\s+r\b", r"\br\s*&\s*d\b"],  # Handle standalone R carefully
        "git": [r"\bgit\s+got\b"]
    }

    @staticmethod
    def normalize_text(text: str) -> str:
        """Lowercases text while preserving tech-specific terms like c++, c#, .net."""
        if not text:
            return ""
        return text.lower().strip()

    @staticmethod
    def extract_contact_info(text: str) -> Dict[str, Any]:
        """Extracts email, phone, LinkedIn, GitHub, and portfolio URLs."""
        # Email
        email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
        emails = re.findall(email_pattern, text)

        # Phone: matches various US/International phone formats
        phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
        phones = re.findall(phone_pattern, text)

        # LinkedIn
        linkedin_pattern = r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+"
        linkedin = re.findall(linkedin_pattern, text, re.IGNORECASE)

        # GitHub
        github_pattern = r"(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+"
        github = re.findall(github_pattern, text, re.IGNORECASE)

        return {
            "email": emails[0] if emails else None,
            "phone": phones[0] if phones else None,
            "linkedin": linkedin[0] if linkedin else None,
            "github": github[0] if github else None,
        }

    @staticmethod
    def analyze_formatting(raw_text: str, sections: Dict[str, str], total_pages: int) -> Dict[str, Any]:
        """
        Evaluates resume readability, presence of standard section headings,
        contact details, bullet points, and quantifiable achievements.
        """
        issues = []
        passes = []
        formatting_score = 100.0

        # 1. Contact Info check
        contacts = NLPEngineService.extract_contact_info(raw_text)
        if contacts["email"]:
            passes.append("Professional email address detected.")
        else:
            issues.append("No valid email address found in the resume header.")
            formatting_score -= 15.0

        if contacts["phone"]:
            passes.append("Contact phone number detected.")
        else:
            issues.append("No phone number detected in resume header.")
            formatting_score -= 10.0

        if contacts["linkedin"] or contacts["github"]:
            passes.append("Professional profile link (LinkedIn / GitHub) detected.")
        else:
            issues.append("No LinkedIn or GitHub profile link found.")
            formatting_score -= 5.0

        # 2. Section Headings check
        standard_sections = ["summary", "skills", "experience", "education", "projects"]
        sections_found = [s for s in standard_sections if sections.get(s) and len(sections[s].strip()) > 10]
        missing_sections = [s.capitalize() for s in standard_sections if s not in sections_found]

        if "skills" in sections_found:
            passes.append("Dedicated Skills section identified.")
        else:
            issues.append("Missing explicit 'Technical Skills' section.")
            formatting_score -= 15.0

        if "experience" in sections_found or "projects" in sections_found:
            passes.append("Experience or Projects section identified.")
        else:
            issues.append("Missing clear Work Experience or Projects section.")
            formatting_score -= 20.0

        if "education" in sections_found:
            passes.append("Education section identified.")
        else:
            issues.append("Missing explicit Education section.")
            formatting_score -= 10.0

        # 3. Length & word count check
        words = raw_text.split()
        word_count = len(words)
        if word_count < 150:
            issues.append(f"Resume text is very brief ({word_count} words). ATS parsers favor detailed descriptions.")
            formatting_score -= 15.0
        elif word_count > 1800:
            issues.append(f"Resume is unusually long ({word_count} words, {total_pages} pages). Aim for 1-2 focused pages.")
            formatting_score -= 5.0
        else:
            passes.append(f"Optimal resume word count ({word_count} words).")

        # 4. Quantifiable Metrics & Bullet Points
        metric_matches = re.findall(r"\b(?:\d+[%+]?|\$\d+(?:,\d+)?|\d+x|\d+\s*(?:ms|seconds|users|clients|percent|decrease|increase|growth))\b", raw_text, re.IGNORECASE)
        if len(metric_matches) >= 3:
            passes.append(f"Strong use of quantifiable metrics and achievements ({len(metric_matches)} metrics found).")
        else:
            issues.append("Few quantifiable metrics found. Include measurable numbers, percentages, or performance results.")
            formatting_score -= 10.0

        formatting_score = max(10.0, min(100.0, formatting_score))

        return {
            "score": round(formatting_score, 1),
            "sections_found": [s.capitalize() for s in sections_found],
            "missing_sections": missing_sections,
            "contact_info": contacts,
            "page_count": total_pages,
            "word_count": word_count,
            "issues": issues,
            "passes": passes
        }

    @staticmethod
    def match_skill(
        skill_name: str,
        synonyms: List[str],
        sections: Dict[str, str],
        raw_text: str
    ) -> Tuple[str, Optional[str], Optional[str], float]:
        """
        Checks for skill presence using exact, synonym, and context-aware matching.
        Returns (status, matched_term, context_snippet, confidence).
        Status is 'matched', 'partial', or 'missing'.
        """
        all_terms = [skill_name] + (synonyms or [])
        clean_raw = raw_text.lower()
        skills_section = (sections.get("skills") or "").lower()
        exp_section = (sections.get("experience") or "").lower()
        proj_section = (sections.get("projects") or "").lower()
        edu_section = (sections.get("education") or "").lower()

        # Build regex for term boundary
        for term in all_terms:
            clean_term = term.strip().lower()
            if not clean_term:
                continue

            # Check false positive patterns if applicable
            if clean_term in NLPEngineService.FALSE_POSITIVE_PATTERNS:
                fp_list = NLPEngineService.FALSE_POSITIVE_PATTERNS[clean_term]
                is_false_pos = False
                for fp in fp_list:
                    if re.search(fp, clean_raw):
                        is_false_pos = True
                        break
                if is_false_pos and clean_term not in skills_section:
                    continue

            # Special regex handling for terms with symbols like C++, C#, .NET
            if clean_term == "c++":
                pattern = r"(?:^|[\s,;:(/])c\+\+(?:$|[\s,;:)./])"
            elif clean_term == "c#":
                pattern = r"(?:^|[\s,;:(/])c#(?:$|[\s,;:)./])"
            elif clean_term == ".net" or clean_term == ".net core":
                pattern = r"(?:^|[\s,;:(/])\.net(?:\s*core)?(?:$|[\s,;:)./])"
            elif clean_term == "r":
                # Standalone R must be in skills section or explicit 'R programming' / 'R language'
                pattern = r"(?:^|[\s,;:(/])(?:r\s+programming|r\s+language|r\s+statistical)(?:$|[\s,;:)./])"
                if re.search(pattern, clean_raw):
                    return "matched", "R Programming", "Identified in technical context.", 1.0
                if re.search(r"(?:^|[\s,;:(/])r(?:$|[\s,;:)./])", skills_section):
                    return "matched", "R", "Found in Skills section.", 1.0
                continue
            else:
                escaped = re.escape(clean_term)
                pattern = rf"(?:^|[\s,;:(/]){escaped}(?:$|[\s,;:)./])"

            # Check Skills section first (highest confidence)
            if re.search(pattern, skills_section):
                snippet = NLPEngineService._extract_snippet(clean_term, sections.get("skills", ""))
                return "matched", term, snippet, 1.0

            # Check Experience / Projects
            if re.search(pattern, exp_section):
                snippet = NLPEngineService._extract_snippet(clean_term, sections.get("experience", ""))
                return "matched", term, snippet, 0.95

            if re.search(pattern, proj_section):
                snippet = NLPEngineService._extract_snippet(clean_term, sections.get("projects", ""))
                return "matched", term, snippet, 0.90

            # Check whole resume
            if re.search(pattern, clean_raw):
                snippet = NLPEngineService._extract_snippet(clean_term, raw_text)
                return "matched", term, snippet, 0.85

        # If not matched directly, check for partial / morphological similarity
        for term in all_terms:
            clean_term = term.strip().lower()
            # If term is multi-word (e.g., "Responsive Design" -> "Responsive" and "Design" nearby)
            words = clean_term.split()
            if len(words) >= 2:
                all_words_present = all(re.search(rf"\b{re.escape(w)}\b", clean_raw) for w in words)
                if all_words_present:
                    snippet = NLPEngineService._extract_snippet(words[0], raw_text)
                    return "partial", term, snippet, 0.70

        return "missing", None, None, 0.0

    @staticmethod
    def _extract_snippet(keyword: str, text: str, radius: int = 50) -> str:
        """Extracts context surrounding the matched keyword."""
        if not text:
            return ""
        pos = text.lower().find(keyword.lower())
        if pos == -1:
            return text[:100].strip()
        start = max(0, pos - radius)
        end = min(len(text), pos + len(keyword) + radius)
        snippet = text[start:end].replace("\n", " ").strip()
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
        return snippet

    @staticmethod
    def compute_semantic_similarity(resume_text: str, target_profile_text: str) -> float:
        """
        Computes cosine similarity between resume text and job profile / description.
        Uses SentenceTransformer dense embeddings if available, with TF-IDF fallback.
        """
        if not resume_text.strip() or not target_profile_text.strip():
            return 0.50

        # Try SentenceTransformers first
        model = get_sentence_model()
        if model:
            try:
                embeddings = model.encode([resume_text[:2000], target_profile_text[:2000]])
                emb1 = embeddings[0].reshape(1, -1)
                emb2 = embeddings[1].reshape(1, -1)
                sim = float(cosine_similarity(emb1, emb2)[0][0])
                # Normalize cosine range (-1..1 to 0..1, typically 0.2..0.85 for text)
                normalized = max(0.0, min(1.0, (sim + 0.1) / 0.95))
                return round(normalized, 3)
            except Exception:
                pass

        # TF-IDF Cosine Similarity Fallback
        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
            tfidf_matrix = vectorizer.fit_transform([resume_text, target_profile_text])
            sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
            # Scale TF-IDF similarity (TF-IDF between different document styles is usually 0.1-0.6)
            scaled = min(1.0, sim * 1.8)
            return round(scaled, 3)
        except Exception:
            return 0.60
