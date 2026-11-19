from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ATSKeywordBase(BaseModel):
    keyword: str
    category: str
    synonyms: List[str] = []
    skill_id: Optional[int] = None

class ATSKeywordCreate(ATSKeywordBase):
    pass

class ATSKeywordUpdate(BaseModel):
    keyword: Optional[str] = None
    category: Optional[str] = None
    synonyms: Optional[List[str]] = None
    skill_id: Optional[int] = None

class ATSKeywordRead(ATSKeywordBase):
    id: int
    normalized_keyword: str

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: str
    synonyms: List[str] = []

class SkillCreate(SkillBase):
    pass

class SkillRead(SkillBase):
    id: int
    normalized_name: str
    created_at: datetime
    keywords: List[ATSKeywordRead] = []

    class Config:
        from_attributes = True

class JobRoleSkillRead(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    importance: str
    weight: float
    relevance: float
    synonyms: List[str] = []

class JobRoleBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Software Engineering"
    is_active: bool = True

class JobRoleCreate(JobRoleBase):
    required_skill_names: List[str] = []
    preferred_skill_names: List[str] = []

class JobRoleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    required_skill_names: Optional[List[str]] = None
    preferred_skill_names: Optional[List[str]] = None

class JobRoleRead(JobRoleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobRoleWithSkillsRead(JobRoleRead):
    skills: List[JobRoleSkillRead] = []

class ScoringWeightConfigRead(BaseModel):
    id: int
    version: str
    required_skills_weight: float
    preferred_skills_weight: float
    keyword_relevance_weight: float
    experience_relevance_weight: float
    education_relevance_weight: float
    project_relevance_weight: float
    formatting_weight: float
    is_active: bool

    class Config:
        from_attributes = True

class ScoringWeightConfigUpdate(BaseModel):
    required_skills_weight: Optional[float] = None
    preferred_skills_weight: Optional[float] = None
    keyword_relevance_weight: Optional[float] = None
    experience_relevance_weight: Optional[float] = None
    education_relevance_weight: Optional[float] = None
    project_relevance_weight: Optional[float] = None
    formatting_weight: Optional[float] = None

