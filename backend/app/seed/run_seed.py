import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.job_role import JobRole, Skill, JobRoleSkill, ATSKeyword, ScoringWeightConfig
from app.seed.seed_data import ALL_SKILLS, INITIAL_ROLES, normalize_string

def seed_database():
    print("[1/5] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users (Admin & Student)
        print("[2/5] Seeding default users...")
        admin = db.query(User).filter(User.email == "rahul@uniskill.in").first()
        if not admin:
            admin = User(
                email="rahul@uniskill.in",
                hashed_password=get_password_hash("1234567890"),
                full_name="Rahul",
                role="admin",
                is_active=True
            )
            db.add(admin)
        else:
            admin.hashed_password = get_password_hash("1234567890")
            admin.role = "admin"
            admin.is_active = True

        student = db.query(User).filter(User.email == "student@uniskill.in").first()
        if not student:
            student = User(
                email="student@uniskill.in",
                hashed_password=get_password_hash("student123"),
                full_name="Demo Student",
                role="student",
                is_active=True
            )
            db.add(student)

        # 2. Seed Default Scoring Weights
        print("[3/5] Seeding scoring weight configuration...")
        weight_config = db.query(ScoringWeightConfig).filter(ScoringWeightConfig.version == "v1.0.0").first()
        if not weight_config:
            weight_config = ScoringWeightConfig(
                version="v1.0.0",
                required_skills_weight=0.30,
                preferred_skills_weight=0.10,
                keyword_relevance_weight=0.20,
                experience_relevance_weight=0.15,
                education_relevance_weight=0.10,
                project_relevance_weight=0.10,
                formatting_weight=0.05,
                is_active=True
            )
            db.add(weight_config)

        db.commit()

        # 3. Seed Skills and Keywords
        print("[4/5] Seeding centralized skills and keyword dictionary...")
        skill_id_map = {}
        for skill_name, (category, synonyms) in ALL_SKILLS.items():
            skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill:
                skill = Skill(
                    name=skill_name,
                    category=category,
                    normalized_name=normalize_string(skill_name),
                    synonyms=synonyms
                )
                db.add(skill)
                db.flush()
            skill_id_map[skill_name] = skill.id

            # Add primary keyword
            kw_norm = normalize_string(skill_name)
            existing_kw = db.query(ATSKeyword).filter(ATSKeyword.keyword == skill_name).first()
            if not existing_kw:
                db.add(ATSKeyword(
                    keyword=skill_name,
                    normalized_keyword=kw_norm,
                    category=category,
                    synonyms=synonyms,
                    skill_id=skill.id
                ))

            # Add synonyms as keywords
            for syn in synonyms:
                syn_norm = normalize_string(syn)
                existing_syn = db.query(ATSKeyword).filter(ATSKeyword.keyword == syn).first()
                if not existing_syn:
                    db.add(ATSKeyword(
                        keyword=syn,
                        normalized_keyword=syn_norm,
                        category=category,
                        synonyms=[skill_name],
                        skill_id=skill.id
                    ))

        db.commit()

        # 4. Seed Job Roles and Role-Skill associations
        print("[5/5] Seeding 17 initial job roles and skills mappings...")
        for role_data in INITIAL_ROLES:
            title = role_data["title"]
            job_role = db.query(JobRole).filter(JobRole.title == title).first()
            if not job_role:
                job_role = JobRole(
                    title=title,
                    description=role_data["description"],
                    category=role_data["category"],
                    is_active=True
                )
                db.add(job_role)
                db.flush()

            # Link required skills
            for req_skill_name in role_data["required_skills"]:
                if req_skill_name in skill_id_map:
                    skill_id = skill_id_map[req_skill_name]
                    exists = db.query(JobRoleSkill).filter(
                        JobRoleSkill.job_role_id == job_role.id,
                        JobRoleSkill.skill_id == skill_id
                    ).first()
                    if not exists:
                        db.add(JobRoleSkill(
                            job_role_id=job_role.id,
                            skill_id=skill_id,
                            importance="Required",
                            weight=1.5,
                            relevance=1.0
                        ))

            # Link preferred skills
            for pref_skill_name in role_data["preferred_skills"]:
                if pref_skill_name in skill_id_map:
                    skill_id = skill_id_map[pref_skill_name]
                    exists = db.query(JobRoleSkill).filter(
                        JobRoleSkill.job_role_id == job_role.id,
                        JobRoleSkill.skill_id == skill_id
                    ).first()
                    if not exists:
                        db.add(JobRoleSkill(
                            job_role_id=job_role.id,
                            skill_id=skill_id,
                            importance="Preferred",
                            weight=1.0,
                            relevance=0.8
                        ))

        db.commit()
        print("Successfully seeded UniSkill Centralized ATS Database!")
        print(f"Total Job Roles: {db.query(JobRole).count()}")
        print(f"Total Skills: {db.query(Skill).count()}")
        print(f"Total ATS Keywords: {db.query(ATSKeyword).count()}")
        print(f"Total Role-Skill Mappings: {db.query(JobRoleSkill).count()}")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

