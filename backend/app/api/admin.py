from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin_user, get_password_hash
from app.models.user import User
from app.schemas.user import UserRead, UserCreate
from app.models.job_role import JobRole, Skill, JobRoleSkill, ATSKeyword, ScoringWeightConfig
from app.schemas.job_role import (
    JobRoleRead,
    JobRoleCreate,
    JobRoleUpdate,
    JobRoleWithSkillsRead,
    SkillRead,
    SkillCreate,
    ATSKeywordRead,
    ATSKeywordCreate,
    ATSKeywordUpdate,
    ScoringWeightConfigRead,
    ScoringWeightConfigUpdate
)
from app.seed.seed_data import normalize_string

router = APIRouter(prefix="/ats/admin", tags=["ATS Admin Keyword & Role Management"])

# --- Job Roles Management ---

@router.post("/job-roles", response_model=JobRoleRead, status_code=status.HTTP_201_CREATED)
def create_job_role(
    role_in: JobRoleCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(JobRole).filter(JobRole.title == role_in.title).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job role with this title already exists.")

    role = JobRole(
        title=role_in.title,
        description=role_in.description,
        category=role_in.category,
        is_active=role_in.is_active
    )
    db.add(role)
    db.commit()
    db.refresh(role)

    # Attach required skills
    for s_name in role_in.required_skill_names:
        skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
        if not skill:
            skill = Skill(name=s_name, category="General", normalized_name=normalize_string(s_name), synonyms=[])
            db.add(skill)
            db.flush()
        db.add(JobRoleSkill(job_role_id=role.id, skill_id=skill.id, importance="Required", weight=1.5, relevance=1.0))

    # Attach preferred skills
    for s_name in role_in.preferred_skill_names:
        skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
        if not skill:
            skill = Skill(name=s_name, category="General", normalized_name=normalize_string(s_name), synonyms=[])
            db.add(skill)
            db.flush()
        db.add(JobRoleSkill(job_role_id=role.id, skill_id=skill.id, importance="Preferred", weight=1.0, relevance=0.8))

    db.commit()
    db.refresh(role)
    return role

@router.put("/job-roles/{job_role_id}", response_model=JobRoleRead)
def update_job_role(
    job_role_id: int,
    role_in: JobRoleUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    role = db.query(JobRole).filter(JobRole.id == job_role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job role not found.")

    if role_in.title is not None:
        role.title = role_in.title
    if role_in.description is not None:
        role.description = role_in.description
    if role_in.category is not None:
        role.category = role_in.category
    if role_in.is_active is not None:
        role.is_active = role_in.is_active

    # Update skills if provided
    if role_in.required_skill_names is not None or role_in.preferred_skill_names is not None:
        db.query(JobRoleSkill).filter(JobRoleSkill.job_role_id == role.id).delete()

        if role_in.required_skill_names:
            for s_name in role_in.required_skill_names:
                skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
                if not skill:
                    skill = Skill(name=s_name, category="General", normalized_name=normalize_string(s_name), synonyms=[])
                    db.add(skill)
                    db.flush()
                db.add(JobRoleSkill(job_role_id=role.id, skill_id=skill.id, importance="Required", weight=1.5, relevance=1.0))

        if role_in.preferred_skill_names:
            for s_name in role_in.preferred_skill_names:
                skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
                if not skill:
                    skill = Skill(name=s_name, category="General", normalized_name=normalize_string(s_name), synonyms=[])
                    db.add(skill)
                    db.flush()
                db.add(JobRoleSkill(job_role_id=role.id, skill_id=skill.id, importance="Preferred", weight=1.0, relevance=0.8))

    db.commit()
    db.refresh(role)
    return role

@router.delete("/job-roles/{job_role_id}")
def delete_job_role(
    job_role_id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    role = db.query(JobRole).filter(JobRole.id == job_role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job role not found.")
    db.delete(role)
    db.commit()
    return {"message": f"Job role '{role.title}' deleted successfully."}

# --- Skills Management ---

@router.post("/skills", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Skill).filter(Skill.name.ilike(skill_in.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Skill already exists.")

    skill = Skill(
        name=skill_in.name,
        category=skill_in.category,
        normalized_name=normalize_string(skill_in.name),
        synonyms=skill_in.synonyms
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    # Automatically add primary keyword
    db.add(ATSKeyword(
        keyword=skill.name,
        normalized_keyword=skill.normalized_name,
        category=skill.category,
        synonyms=skill.synonyms,
        skill_id=skill.id
    ))
    db.commit()
    return skill

# --- Keywords Management ---

@router.post("/keywords", response_model=ATSKeywordRead, status_code=status.HTTP_201_CREATED)
def create_keyword(
    kw_in: ATSKeywordCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(ATSKeyword).filter(ATSKeyword.keyword.ilike(kw_in.keyword)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Keyword already exists.")

    kw = ATSKeyword(
        keyword=kw_in.keyword,
        normalized_keyword=normalize_string(kw_in.keyword),
        category=kw_in.category,
        synonyms=kw_in.synonyms,
        skill_id=kw_in.skill_id
    )
    db.add(kw)
    db.commit()
    db.refresh(kw)
    return kw

@router.put("/keywords/{keyword_id}", response_model=ATSKeywordRead)
def update_keyword(
    keyword_id: int,
    kw_in: ATSKeywordUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    kw = db.query(ATSKeyword).filter(ATSKeyword.id == keyword_id).first()
    if not kw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Keyword not found.")

    if kw_in.keyword is not None:
        kw.keyword = kw_in.keyword
        kw.normalized_keyword = normalize_string(kw_in.keyword)
    if kw_in.category is not None:
        kw.category = kw_in.category
    if kw_in.synonyms is not None:
        kw.synonyms = kw_in.synonyms
    if kw_in.skill_id is not None:
        kw.skill_id = kw_in.skill_id

    db.commit()
    db.refresh(kw)
    return kw

@router.delete("/keywords/{keyword_id}")
def delete_keyword(
    keyword_id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    kw = db.query(ATSKeyword).filter(ATSKeyword.id == keyword_id).first()
    if not kw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Keyword not found.")
    db.delete(kw)
    db.commit()
    return {"message": f"Keyword '{kw.keyword}' deleted successfully."}

# --- Scoring Weights Configuration ---

@router.get("/scoring-weights", response_model=ScoringWeightConfigRead)
def get_scoring_weights(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    config = db.query(ScoringWeightConfig).filter(ScoringWeightConfig.is_active == True).first()
    if not config:
        config = ScoringWeightConfig(version="v1.0.0")
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/scoring-weights", response_model=ScoringWeightConfigRead)
def update_scoring_weights(
    weights_in: ScoringWeightConfigUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    config = db.query(ScoringWeightConfig).filter(ScoringWeightConfig.is_active == True).first()
    if not config:
        config = ScoringWeightConfig(version="v1.0.0")
        db.add(config)

    req = weights_in.required_skills_weight if weights_in.required_skills_weight is not None else config.required_skills_weight
    pref = weights_in.preferred_skills_weight if weights_in.preferred_skills_weight is not None else config.preferred_skills_weight
    kw = weights_in.keyword_relevance_weight if weights_in.keyword_relevance_weight is not None else config.keyword_relevance_weight
    exp = weights_in.experience_relevance_weight if weights_in.experience_relevance_weight is not None else config.experience_relevance_weight
    edu = weights_in.education_relevance_weight if weights_in.education_relevance_weight is not None else config.education_relevance_weight
    proj = weights_in.project_relevance_weight if weights_in.project_relevance_weight is not None else config.project_relevance_weight
    fmt = weights_in.formatting_weight if weights_in.formatting_weight is not None else config.formatting_weight

    total = req + pref + kw + exp + edu + proj + fmt
    if round(total, 2) != 1.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sum of category weights must equal 1.0 (Current sum: {total:.2f})."
        )

    config.required_skills_weight = req
    config.preferred_skills_weight = pref
    config.keyword_relevance_weight = kw
    config.experience_relevance_weight = exp
    config.education_relevance_weight = edu
    config.project_relevance_weight = proj
    config.formatting_weight = fmt

    db.commit()
    db.refresh(config)
    return config


# --- Admin & User Management ---

@router.get("/users", response_model=List[UserRead])
def get_users(
    role: Optional[str] = None,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Retrieve all users or filter by role ('admin' or 'student'). Admin only."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin can create new admins or students with full control."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    target_role = user_in.role if user_in.role in ["student", "admin"] else "admin"

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=target_role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin can delete another user or admin. Self-deletion is prevented."""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(target_user)
    db.commit()
    return {"message": f"User '{target_user.email}' deleted successfully."}


