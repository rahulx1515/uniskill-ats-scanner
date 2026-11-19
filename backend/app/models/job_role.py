from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, default="Software Engineering")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    role_skills = relationship("JobRoleSkill", back_populates="job_role", cascade="all, delete-orphan")
    analyses = relationship("ATSAnalysis", back_populates="job_role")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)  # Programming Language, Framework, Database, Cloud, DevOps, AI/ML, CS Fundamentals, Soft Skills, Tools
    normalized_name = Column(String(100), index=True, nullable=False)
    synonyms = Column(JSON, default=list, nullable=False)  # e.g., ["JS", "JavaScript ES6", "ECMAScript"]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    role_skills = relationship("JobRoleSkill", back_populates="skill", cascade="all, delete-orphan")
    keywords = relationship("ATSKeyword", back_populates="skill", cascade="all, delete-orphan")

class JobRoleSkill(Base):
    __tablename__ = "job_role_skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    importance = Column(String(20), default="Required", nullable=False)  # 'Required' or 'Preferred'
    weight = Column(Float, default=1.0, nullable=False)
    relevance = Column(Float, default=1.0, nullable=False)

    # Relationships
    job_role = relationship("JobRole", back_populates="role_skills")
    skill = relationship("Skill", back_populates="role_skills")

class ATSKeyword(Base):
    __tablename__ = "ats_keywords"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    keyword = Column(String(100), unique=True, index=True, nullable=False)
    normalized_keyword = Column(String(100), index=True, nullable=False)
    category = Column(String(100), nullable=False)
    synonyms = Column(JSON, default=list, nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    skill = relationship("Skill", back_populates="keywords")

class ScoringWeightConfig(Base):
    __tablename__ = "scoring_weight_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(String(50), unique=True, nullable=False, default="v1.0.0")
    required_skills_weight = Column(Float, default=0.30, nullable=False)
    preferred_skills_weight = Column(Float, default=0.10, nullable=False)
    keyword_relevance_weight = Column(Float, default=0.20, nullable=False)
    experience_relevance_weight = Column(Float, default=0.15, nullable=False)
    education_relevance_weight = Column(Float, default=0.10, nullable=False)
    project_relevance_weight = Column(Float, default=0.10, nullable=False)
    formatting_weight = Column(Float, default=0.05, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

