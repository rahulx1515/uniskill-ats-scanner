from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, ats, admin
from app.seed.run_seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade AI-powered Applicant Tracking System (ATS) Resume Scanner with centralized keyword engine, hybrid NLP matching, and deterministic scoring.",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(ats.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    # Ensure database is seeded on startup if not already
    from app.core.database import SessionLocal
    from app.models.job_role import JobRole
    db = SessionLocal()
    try:
        count = db.query(JobRole).count()
        if count == 0:
            print("Auto-seeding database on first startup...")
            seed_database()
    except Exception as e:
        print(f"Startup check note: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "platform": "UniSkill ATS Resume Intelligence Engine",
        "status": "online",
        "version": settings.SCORING_VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "nlp_engine": "operational",
        "database": "connected"
    }

@app.get(f"{settings.API_V1_STR}/system/load-balancer")
def get_load_balancer_status():
    from app.services.cache_service import cache_service
    return cache_service.get_stats()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled Exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing the resume analysis."}
    )

