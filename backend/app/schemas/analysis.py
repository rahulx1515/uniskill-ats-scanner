from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    is_scanned: bool
    text_length: int
    sections_detected: List[str]
    message: str

class ResumeRead(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    is_scanned: bool
    created_at: datetime
    sections: List[str] = []

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    resume_id: str
    job_role_id: int
    custom_jd: Optional[str] = None

class SkillMatchItem(BaseModel):
    skill_name: str
    category: str
    importance: str
    status: str  # 'matched', 'missing', 'partial'
    matched_term: Optional[str] = None
    context_snippet: Optional[str] = None
    confidence_score: float = 1.0

class CategoryScores(BaseModel):
    required_skills: float
    preferred_skills: float
    keyword_relevance: float
    experience_relevance: float
    education_relevance: float
    project_relevance: float
    formatting: float

class KeywordMetrics(BaseModel):
    total_role_keywords: int
    matched_keywords_count: int
    coverage_percentage: float
    matched_keywords: List[str]
    missing_keywords: List[str]

class FormattingFeedback(BaseModel):
    score: float
    sections_found: List[str]
    missing_sections: List[str]
    contact_info: Dict[str, Any]
    page_count: int
    word_count: int
    issues: List[str]
    passes: List[str]

class ATSAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    resume_filename: str
    job_role_id: Optional[int]
    job_role_title: str
    custom_jd_applied: bool
    overall_score: float
    scoring_version: str
    category_scores: CategoryScores
    weights: Dict[str, float]
    skill_matches: Dict[str, List[SkillMatchItem]]
    keyword_metrics: KeywordMetrics
    formatting_feedback: FormattingFeedback
    experience_analysis: Dict[str, Any]
    education_analysis: Dict[str, Any]
    project_analysis: Dict[str, Any]
    strengths: List[str]
    recommendations: List[str]
    disclaimer: str
    report_download_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisHistoryItem(BaseModel):
    id: str
    resume_id: str
    resume_filename: str
    job_role_title: str
    overall_score: float
    created_at: datetime
    category_scores: CategoryScores
    custom_jd_applied: bool

class CompareAnalysesResponse(BaseModel):
    analysis_1: ATSAnalysisResponse
    analysis_2: ATSAnalysisResponse
    score_difference: float
    category_differences: Dict[str, float]
    newly_matched_skills: List[str]
    still_missing_skills: List[str]

