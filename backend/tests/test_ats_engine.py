import os
import io
import pytest
from pathlib import Path
from docx import Document
import pymupdf
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.job_role import JobRole
from app.services.parser import ResumeParserService, ResumeParserError
from app.services.scoring_engine import ScoringEngineService
from app.services.nlp_engine import NLPEngineService
from app.services.jd_extractor import JDExtractorService
from app.services.report_generator import ReportGeneratorService

client = TestClient(app)

def create_sample_docx(file_path: Path, text: str):
    doc = Document()
    for paragraph in text.split("\n"):
        if paragraph.strip():
            doc.add_paragraph(paragraph)
    doc.save(str(file_path))

def create_sample_pdf(file_path: Path, text: str):
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 50), text, fontsize=11)
    doc.save(str(file_path))
    doc.close()

def create_empty_pdf(file_path: Path):
    doc = pymupdf.open()
    doc.new_page()  # Page with no text
    doc.save(str(file_path))
    doc.close()

@pytest.fixture(scope="function")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module")
def auth_headers():
    # Login with default student
    res = client.post("/api/auth/login", json={"email": "student@uniskill.edu", "password": "Student@12345"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="module")
def admin_auth_headers():
    # Login with default admin
    res = client.post("/api/auth/login", json={"email": "admin@uniskill.edu", "password": "Admin@12345"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

class TestParser:
    def test_pdf_parsing_success(self, tmp_path):
        pdf_path = tmp_path / "resume_test.pdf"
        sample_text = (
            "Rahul Sharma\nEmail: rahul@example.com\nPhone: (555) 123-4567\n"
            "Technical Skills:\nPython, FastAPI, Docker, SQL, PostgreSQL, Git\n"
            "Experience:\nSoftware Engineer at TechCorp. Built scalable microservices with 99.9% uptime.\n"
            "Education:\nBachelor of Science in Computer Science\n"
            "Projects:\nBuilt an ATS scanner with Python and React."
        )
        create_sample_pdf(pdf_path, sample_text)
        result = ResumeParserService.parse_file(pdf_path, ".pdf")
        assert result["is_scanned"] is False
        assert "Python" in result["raw_text"]
        assert "skills" in result["sections"]
        assert len(result["sections"]["skills"]) > 0

    def test_docx_parsing_success(self, tmp_path):
        docx_path = tmp_path / "resume_test.docx"
        sample_text = (
            "Jane Doe\nEmail: jane@test.com\nPhone: 555-987-6543\n"
            "Technical Skills:\nJava, Spring Boot, Microservices, Hibernate, RESTful APIs, Git\n"
            "Work Experience:\nJava Developer at Enterprise LLC. Reduced latency by 35%.\n"
            "Education:\nB.Tech in Computer Science"
        )
        create_sample_docx(docx_path, sample_text)
        result = ResumeParserService.parse_file(docx_path, ".docx")
        assert result["is_scanned"] is False
        assert "Spring Boot" in result["raw_text"]

    def test_scanned_pdf_detection(self, tmp_path):
        pdf_path = tmp_path / "scanned_doc.pdf"
        create_empty_pdf(pdf_path)
        result = ResumeParserService.parse_file(pdf_path, ".pdf")
        # Empty text should trigger is_scanned
        assert result["is_scanned"] is True

class TestNLPMatchingAndContext:
    def test_synonym_matching(self):
        # K8s should match Kubernetes
        sections = {"skills": "Expertise in Docker, K8s, and AWS Cloud."}
        raw_text = "Docker, K8s, AWS Cloud"
        status, term, snippet, conf = NLPEngineService.match_skill(
            skill_name="Kubernetes",
            synonyms=["K8s", "Kubernetes Cluster"],
            sections=sections,
            raw_text=raw_text
        )
        assert status == "matched"
        assert term.lower() == "k8s"

    def test_context_awareness_false_positive_prevention(self):
        # Should not award Python points for "Monty Python" in unrelated context
        sections = {"skills": "Java, SQL", "summary": "Loves watching Monty Python movies."}
        raw_text = "Java, SQL. Loves watching Monty Python movies."
        status, term, snippet, conf = NLPEngineService.match_skill(
            skill_name="Python",
            synonyms=["Python 3", "Py"],
            sections=sections,
            raw_text=raw_text
        )
        assert status == "missing"

class TestScoringEngineDeterminism:
    def test_scoring_determinism(self, db_session):
        role = db_session.query(JobRole).filter(JobRole.title == "Python Developer").first()
        assert role is not None

        raw_text = (
            "Rahul Sharma | rahul@gmail.com | (555) 345-6789 | linkedin.com/in/rahulsharma\n"
            "Technical Skills:\nPython, Django, FastAPI, RESTful APIs, SQL, PostgreSQL, Git, Unit Testing, Docker, Redis\n"
            "Professional Experience:\nBackend Engineer at DevLab. Improved API response speed by 40%.\n"
            "Education:\nBachelor of Science in Computer Science\n"
            "Key Projects:\nEngineered full-stack analytics platform utilizing FastAPI and PostgreSQL."
        )
        sections = {
            "summary": "Rahul Sharma",
            "skills": "Python, Django, FastAPI, RESTful APIs, SQL, PostgreSQL, Git, Unit Testing, Docker, Redis",
            "experience": "Backend Engineer at DevLab. Improved API response speed by 40%.",
            "education": "Bachelor of Science in Computer Science",
            "projects": "Engineered full-stack analytics platform utilizing FastAPI and PostgreSQL."
        }

        # Run scoring twice on identical input
        score1 = ScoringEngineService.calculate_ats_score(db_session, role, raw_text, sections, 1)
        score2 = ScoringEngineService.calculate_ats_score(db_session, role, raw_text, sections, 1)

        assert score1["overall_score"] == score2["overall_score"]
        assert score1["category_scores"] == score2["category_scores"]
        assert score1["overall_score"] >= 60.0  # High match for strong profile

    def test_missing_skills_low_score(self, db_session):
        role = db_session.query(JobRole).filter(JobRole.title == "Java Developer").first()
        # Resume has no Java skills (only graphics & cooking)
        raw_text = "Chef & Graphic Designer\nPhotoshop, Illustrator, French Cuisine\nNo tech experience."
        sections = {"general": raw_text}

        score = ScoringEngineService.calculate_ats_score(db_session, role, raw_text, sections, 1)
        assert score["overall_score"] < 45.0
        assert len(score["skill_matches"]["required_missing"]) > 0

class TestPDFReportGeneration:
    def test_pdf_report_generates_file(self, db_session, tmp_path):
        role = db_session.query(JobRole).filter(JobRole.title == "Frontend Developer").first()
        raw_text = "Frontend Dev | React, TypeScript, HTML5, CSS3, Tailwind CSS, Git | B.Tech CS"
        sections = {"skills": "React, TypeScript, HTML5, CSS3, Tailwind CSS, Git", "education": "B.Tech CS"}
        analysis_data = ScoringEngineService.calculate_ats_score(db_session, role, raw_text, sections, 1)

        pdf_path = ReportGeneratorService.generate_pdf_report(
            analysis_id="test-analysis-12345",
            candidate_name="Test Student",
            candidate_email="student@uniskill.edu",
            target_role=role.title,
            analysis_data=analysis_data
        )

        assert pdf_path.exists()
        assert pdf_path.stat().st_size > 1000  # Non-empty valid PDF

from app.api.ats import get_job_roles, get_keywords, get_job_role_skills
from app.api.auth import login, register
from app.schemas.user import UserLogin, UserCreate
from app.schemas.job_role import ATSKeywordCreate
from app.api.admin import create_keyword, delete_keyword, create_user, delete_user
from fastapi import HTTPException

class TestAPIEndpoints:
    def test_get_job_roles(self, db_session):
        roles = get_job_roles(db=db_session)
        assert len(roles) >= 17
        titles = [r.title for r in roles]
        assert "Software Developer" in titles
        assert "Python Developer" in titles
        assert "Data Scientist" in titles

    def test_get_job_role_skills(self, db_session):
        roles = get_job_roles(db=db_session)
        python_role = next(r for r in roles if r.title == "Python Developer")
        role_skills = get_job_role_skills(python_role.id, db=db_session)
        assert len(role_skills.skills) > 0
        skill_names = [s.skill_name for s in role_skills.skills]
        assert "Python" in skill_names
        assert "FastAPI" in skill_names or "Django" in skill_names

    def test_auth_login_admin(self, db_session):
        res = login(UserLogin(email="rahul@uniskill.in", password="1234567890"), db=db_session)
        assert res["access_token"] is not None
        assert res["user"].email == "rahul@uniskill.in"
        assert res["user"].role == "admin"

    def test_admin_create_and_delete_subadmin(self, db_session):
        admin_user = db_session.query(User).filter(User.email == "rahul@uniskill.in").first()
        # Admin creates another admin
        new_admin = create_user(
            UserCreate(
                email="secondary_admin@uniskill.in",
                password="SecurePassword123!",
                full_name="Secondary Operations Admin",
                role="admin"
            ),
            admin=admin_user,
            db=db_session
        )
        assert new_admin.email == "secondary_admin@uniskill.in"
        assert new_admin.role == "admin"

        # Admin can delete the created subadmin
        del_res = delete_user(new_admin.id, admin=admin_user, db=db_session)
        assert "deleted successfully" in del_res["message"]

    def test_admin_keyword_management(self, db_session):
        admin_user = db_session.query(User).filter(User.role == "admin").first()
        # Admin creates keyword
        kw = create_keyword(
            ATSKeywordCreate(keyword="Docker Compose V2", category="DevOps", synonyms=["Compose v2"]),
            admin=admin_user,
            db=db_session
        )
        assert kw.keyword == "Docker Compose V2"

        # Delete keyword
        res = delete_keyword(kw.id, admin=admin_user, db=db_session)
        assert "deleted successfully" in res["message"]
