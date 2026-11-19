import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # 'pdf' or 'docx'
    file_size = Column(Integer, nullable=False)     # in bytes
    raw_text = Column(Text, nullable=True)
    extracted_sections = Column(JSON, default=dict, nullable=False)  # { "summary": "...", "skills": "...", "experience": "...", "education": "...", "projects": "..." }
    is_scanned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analyses = relationship("ATSAnalysis", back_populates="resume", cascade="all, delete-orphan")

class ATSAnalysis(Base):
    __tablename__ = "ats_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    custom_jd = Column(Text, nullable=True)
    overall_score = Column(Float, nullable=False)  # 0 to 100
    scoring_version = Column(String(50), default="v1.0.0", nullable=False)
    
    # Detailed category breakdown scores (each 0.0 - 1.0 or 0-100)
    category_scores = Column(JSON, default=dict, nullable=False)
    # { "required_skills": 0.85, "preferred_skills": 0.70, "keyword_relevance": 0.80, "experience_relevance": 0.75, "education_relevance": 0.90, "project_relevance": 0.80, "formatting": 0.95 }

    # Detailed keyword and skill matches
    skill_matches = Column(JSON, default=dict, nullable=False)
    # { "required_matched": [...], "required_missing": [...], "preferred_matched": [...], "preferred_missing": [...], "partial_matched": [...] }

    # Keyword coverage metrics
    keyword_metrics = Column(JSON, default=dict, nullable=False)
    # { "total_role_keywords": 25, "matched_keywords_count": 19, "coverage_percentage": 76.0, "matched_keywords": [...], "missing_keywords": [...] }

    # Detailed formatting breakdown
    formatting_feedback = Column(JSON, default=dict, nullable=False)
    # { "score": 95, "sections_found": [...], "contact_info": {...}, "length_check": {...}, "issues": [...] }

    # Extracted Experience & Education analysis
    experience_analysis = Column(JSON, default=dict, nullable=False)
    education_analysis = Column(JSON, default=dict, nullable=False)
    project_analysis = Column(JSON, default=dict, nullable=False)

    # Narrative feedback
    strengths = Column(JSON, default=list, nullable=False)
    recommendations = Column(JSON, default=list, nullable=False)

    pdf_report_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job_role = relationship("JobRole", back_populates="analyses")
    detailed_matches = relationship("SkillMatchResult", back_populates="analysis", cascade="all, delete-orphan")

class SkillMatchResult(Base):
    __tablename__ = "skill_match_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(36), ForeignKey("ats_analyses.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    importance = Column(String(20), nullable=False)  # 'Required' or 'Preferred'
    status = Column(String(20), nullable=False)      # 'matched', 'missing', 'partial'
    matched_term = Column(String(100), nullable=True)
    context_snippet = Column(Text, nullable=True)
    confidence_score = Column(Float, default=1.0, nullable=False)

    # Relationships
    analysis = relationship("ATSAnalysis", back_populates="detailed_matches")

