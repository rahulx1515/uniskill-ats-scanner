import os
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_flexible, get_current_admin_user
from app.models.user import User
from app.models.job_role import JobRole, Skill, JobRoleSkill, ATSKeyword, ScoringWeightConfig
from app.models.resume_analysis import Resume, ATSAnalysis, SkillMatchResult
from app.schemas.job_role import JobRoleRead, JobRoleWithSkillsRead, JobRoleSkillRead, ATSKeywordRead
from app.schemas.analysis import (
    ResumeUploadResponse,
    AnalyzeRequest,
    ATSAnalysisResponse,
    AnalysisHistoryItem,
    CompareAnalysesResponse
)
from app.services.parser import ResumeParserService, ResumeParserError
from app.services.scoring_engine import ScoringEngineService
from app.services.report_generator import ReportGeneratorService

router = APIRouter(prefix="/ats", tags=["ATS Resume Scanner"])

@router.get("/job-roles", response_model=List[JobRoleRead])
def get_job_roles(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(JobRole).filter(JobRole.is_active == True)
    if search:
        query = query.filter(JobRole.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(JobRole.category == category)
    return query.order_by(JobRole.title.asc()).all()

@router.get("/job-roles/{job_role_id}/skills", response_model=JobRoleWithSkillsRead)
def get_job_role_skills(job_role_id: int, db: Session = Depends(get_db)):
    role = db.query(JobRole).filter(JobRole.id == job_role_id, JobRole.is_active == True).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job role not found.")

    role_skills = db.query(JobRoleSkill).filter(JobRoleSkill.job_role_id == role.id).all()
    skills_data = []
    for rs in role_skills:
        skill = db.query(Skill).filter(Skill.id == rs.skill_id).first()
        if skill:
            skills_data.append(JobRoleSkillRead(
                skill_id=skill.id,
                skill_name=skill.name,
                category=skill.category,
                importance=rs.importance,
                weight=rs.weight,
                relevance=rs.relevance,
                synonyms=skill.synonyms or []
            ))

    return JobRoleWithSkillsRead(
        id=role.id,
        title=role.title,
        description=role.description,
        category=role.category,
        is_active=role.is_active,
        created_at=role.created_at,
        updated_at=role.updated_at,
        skills=skills_data
    )

@router.get("/keywords", response_model=List[ATSKeywordRead])
def get_keywords(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(ATSKeyword)
    if search:
        query = query.filter(ATSKeyword.keyword.ilike(f"%{search}%"))
    if category:
        query = query.filter(ATSKeyword.category == category)
    return query.limit(limit).all()

@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate & Save securely
    filename, file_path, file_size = await ResumeParserService.save_uploaded_file(file, current_user.id)
    ext = os.path.splitext(filename)[1].lower()

    # 2. Parse text and detect scanned/corrupt
    try:
        parsed_data = ResumeParserService.parse_file(file_path, ext)
    except ResumeParserError as e:
        # Clean up temp file on failure
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

    if parsed_data["is_scanned"]:
        # Warn user about scanned image-based PDF
        is_scanned = True
        msg = "Warning: Scanned or image-based document detected with minimal selectable text. OCR is recommended for full accuracy."
    else:
        is_scanned = False
        msg = "Resume successfully parsed and indexed."

    # 3. Store record in DB
    resume = Resume(
        user_id=current_user.id,
        filename=filename,
        file_path=str(file_path),
        file_type="pdf" if ext == ".pdf" else "docx",
        file_size=file_size,
        raw_text=parsed_data["raw_text"],
        extracted_sections=parsed_data["sections"],
        is_scanned=is_scanned
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    sections_found = [k.capitalize() for k, v in parsed_data["sections"].items() if v and len(v.strip()) > 5]

    return ResumeUploadResponse(
        id=resume.id,
        filename=resume.filename,
        file_type=resume.file_type,
        file_size=resume.file_size,
        is_scanned=resume.is_scanned,
        text_length=parsed_data["text_length"],
        sections_detected=sections_found,
        message=msg
    )

@router.post("/analyze", response_model=ATSAnalysisResponse)
def analyze_resume(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch resume and verify ownership
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    if resume.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this resume.")

    # 2. Fetch Job Role
    job_role = db.query(JobRole).filter(JobRole.id == request.job_role_id, JobRole.is_active == True).first()
    if not job_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target job role not found.")

    # 3. Execute Deterministic Scoring Engine
    results = ScoringEngineService.calculate_ats_score(
        db=db,
        job_role=job_role,
        raw_text=resume.raw_text or "",
        sections=resume.extracted_sections or {},
        total_pages=1,
        custom_jd=request.custom_jd
    )

    # 4. Persist ATS Analysis Record
    analysis = ATSAnalysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_role_id=job_role.id,
        custom_jd=request.custom_jd,
        overall_score=results["overall_score"],
        scoring_version=results["scoring_version"],
        category_scores=results["category_scores"],
        skill_matches=results["skill_matches"],
        keyword_metrics=results["keyword_metrics"],
        formatting_feedback=results["formatting_feedback"],
        experience_analysis=results["experience_analysis"],
        education_analysis=results["education_analysis"],
        project_analysis=results["project_analysis"],
        strengths=results["strengths"],
        recommendations=results["recommendations"]
    )
    db.add(analysis)
    db.flush()

    # 5. Persist Individual Skill Matches for Auditability
    for cat in ["required_matched", "required_missing", "preferred_matched", "preferred_missing", "partial_matched"]:
        for item in results["skill_matches"].get(cat, []):
            db.add(SkillMatchResult(
                analysis_id=analysis.id,
                skill_name=item["skill_name"],
                importance=item["importance"],
                status=item["status"],
                matched_term=item.get("matched_term"),
                context_snippet=item.get("context_snippet"),
                confidence_score=item.get("confidence_score", 1.0)
            ))

    # 6. Generate High-Fidelity PDF Report
    try:
        report_path = ReportGeneratorService.generate_pdf_report(
            analysis_id=analysis.id,
            candidate_name=current_user.full_name,
            candidate_email=current_user.email,
            target_role=job_role.title,
            analysis_data=results
        )
        analysis.pdf_report_path = str(report_path)
    except Exception as e:
        # Log and continue if PDF generation encountered issue
        print(f"PDF generation error: {e}")

    db.commit()
    db.refresh(analysis)

    return _format_analysis_response(analysis, resume, job_role, results["weights"])

@router.get("/analysis/{analysis_id}", response_model=ATSAnalysisResponse)
def get_analysis_by_id(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(ATSAnalysis).filter(ATSAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found.")
    if analysis.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this analysis.")

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    job_role = db.query(JobRole).filter(JobRole.id == analysis.job_role_id).first()
    weights = ScoringEngineService.get_active_weights(db)
    weights_dict = {
        "required_skills": weights.required_skills_weight,
        "preferred_skills": weights.preferred_skills_weight,
        "keyword_relevance": weights.keyword_relevance_weight,
        "experience_relevance": weights.experience_relevance_weight,
        "education_relevance": weights.education_relevance_weight,
        "project_relevance": weights.project_relevance_weight,
        "formatting": weights.formatting_weight
    }

    return _format_analysis_response(analysis, resume, job_role, weights_dict)

@router.get("/analysis/{analysis_id}/report")
def download_analysis_report(
    analysis_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    analysis = db.query(ATSAnalysis).filter(ATSAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found.")
    if analysis.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this report.")

    if not analysis.pdf_report_path or not Path(analysis.pdf_report_path).exists():
        # Regenerate on demand
        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        job_role = db.query(JobRole).filter(JobRole.id == analysis.job_role_id).first()
        weights = ScoringEngineService.get_active_weights(db)

        analysis_data = {
            "overall_score": analysis.overall_score,
            "category_scores": analysis.category_scores,
            "weights": {
                "required_skills": weights.required_skills_weight,
                "preferred_skills": weights.preferred_skills_weight,
                "keyword_relevance": weights.keyword_relevance_weight,
                "experience_relevance": weights.experience_relevance_weight,
                "education_relevance": weights.education_relevance_weight,
                "project_relevance": weights.project_relevance_weight,
                "formatting": weights.formatting_weight
            },
            "skill_matches": analysis.skill_matches,
            "keyword_metrics": analysis.keyword_metrics,
            "formatting_feedback": analysis.formatting_feedback,
            "recommendations": analysis.recommendations,
            "strengths": analysis.strengths
        }
        report_path = ReportGeneratorService.generate_pdf_report(
            analysis_id=analysis.id,
            candidate_name=current_user.full_name,
            candidate_email=current_user.email,
            target_role=job_role.title if job_role else "Target Role",
            analysis_data=analysis_data
        )
        analysis.pdf_report_path = str(report_path)
        db.commit()

    return FileResponse(
        path=analysis.pdf_report_path,
        media_type="application/pdf",
        filename=f"UniSkill_ATS_Report_{analysis.id[:8].upper()}.pdf"
    )

@router.get("/history", response_model=List[AnalysisHistoryItem])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(ATSAnalysis).filter(ATSAnalysis.user_id == current_user.id).order_by(ATSAnalysis.created_at.desc()).all()
    history = []
    for a in analyses:
        resume = db.query(Resume).filter(Resume.id == a.resume_id).first()
        job_role = db.query(JobRole).filter(JobRole.id == a.job_role_id).first()
        history.append(AnalysisHistoryItem(
            id=a.id,
            resume_id=a.resume_id,
            resume_filename=resume.filename if resume else "Unknown Resume",
            job_role_title=job_role.title if job_role else "Custom Role",
            overall_score=a.overall_score,
            created_at=a.created_at,
            category_scores=a.category_scores,
            custom_jd_applied=bool(a.custom_jd)
        ))
    return history

@router.get("/compare", response_model=CompareAnalysesResponse)
def compare_analyses(
    id1: str = Query(..., description="First analysis ID"),
    id2: str = Query(..., description="Second analysis ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a1 = db.query(ATSAnalysis).filter(ATSAnalysis.id == id1).first()
    a2 = db.query(ATSAnalysis).filter(ATSAnalysis.id == id2).first()
    if not a1 or not a2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both analyses not found.")
    if (a1.user_id != current_user.id or a2.user_id != current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Ownership validation failed.")

    r1 = db.query(Resume).filter(Resume.id == a1.resume_id).first()
    r2 = db.query(Resume).filter(Resume.id == a2.resume_id).first()
    jr1 = db.query(JobRole).filter(JobRole.id == a1.job_role_id).first()
    jr2 = db.query(JobRole).filter(JobRole.id == a2.job_role_id).first()

    weights = ScoringEngineService.get_active_weights(db)
    weights_dict = {
        "required_skills": weights.required_skills_weight,
        "preferred_skills": weights.preferred_skills_weight,
        "keyword_relevance": weights.keyword_relevance_weight,
        "experience_relevance": weights.experience_relevance_weight,
        "education_relevance": weights.education_relevance_weight,
        "project_relevance": weights.project_relevance_weight,
        "formatting": weights.formatting_weight
    }

    resp1 = _format_analysis_response(a1, r1, jr1, weights_dict)
    resp2 = _format_analysis_response(a2, r2, jr2, weights_dict)

    diff_overall = round(a2.overall_score - a1.overall_score, 1)
    cat_diffs = {}
    for k in a1.category_scores:
        cat_diffs[k] = round(a2.category_scores.get(k, 0.0) - a1.category_scores.get(k, 0.0), 2)

    # Calculate newly matched skills and still missing
    matched1 = set([item["skill_name"] for item in a1.skill_matches.get("required_matched", []) + a1.skill_matches.get("preferred_matched", [])])
    matched2 = set([item["skill_name"] for item in a2.skill_matches.get("required_matched", []) + a2.skill_matches.get("preferred_matched", [])])
    missing2 = set([item["skill_name"] for item in a2.skill_matches.get("required_missing", []) + a2.skill_matches.get("preferred_missing", [])])

    newly_matched = list(matched2 - matched1)
    still_missing = list(missing2)

    return CompareAnalysesResponse(
        analysis_1=resp1,
        analysis_2=resp2,
        score_difference=diff_overall,
        category_differences=cat_diffs,
        newly_matched_skills=newly_matched,
        still_missing_skills=still_missing
    )

@router.delete("/resume/{resume_id}")
def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    if resume.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not own this resume.")

    # Delete physical file securely
    try:
        p = Path(resume.file_path)
        if p.exists():
            p.unlink()
    except Exception as e:
        print(f"Error removing physical resume file: {e}")

    # Delete associated reports
    analyses = db.query(ATSAnalysis).filter(ATSAnalysis.resume_id == resume.id).all()
    for a in analyses:
        if a.pdf_report_path:
            rp = Path(a.pdf_report_path)
            if rp.exists():
                rp.unlink()

    # Cascade delete in DB
    db.delete(resume)
    db.commit()

    return {"message": "Resume and all associated analysis records deleted successfully."}

def _format_analysis_response(analysis: ATSAnalysis, resume: Resume, job_role: JobRole, weights: dict) -> ATSAnalysisResponse:
    return ATSAnalysisResponse(
        id=analysis.id,
        resume_id=analysis.resume_id,
        resume_filename=resume.filename if resume else "Resume",
        job_role_id=analysis.job_role_id,
        job_role_title=job_role.title if job_role else "Target Role",
        custom_jd_applied=bool(analysis.custom_jd),
        overall_score=analysis.overall_score,
        scoring_version=analysis.scoring_version,
        category_scores=analysis.category_scores,
        weights=weights,
        skill_matches=analysis.skill_matches,
        keyword_metrics=analysis.keyword_metrics,
        formatting_feedback=analysis.formatting_feedback,
        experience_analysis=analysis.experience_analysis,
        education_analysis=analysis.education_analysis,
        project_analysis=analysis.project_analysis,
        strengths=analysis.strengths,
        recommendations=analysis.recommendations,
        disclaimer=settings.ATS_DISCLAIMER,
        report_download_url=f"/api/ats/analysis/{analysis.id}/report",
        created_at=analysis.created_at
    )

