# UniSkill ATS — AI-Powered Resume Compatibility Scanner

Enterprise-grade Applicant Tracking System (ATS) Resume Scanner module developed for the **UniSkill** career acceleration platform. Features deterministic 100-point scoring, hybrid NLP keyword matching, centralized keyword database, Redis load-balancing cache, dual-mode UI, and downloadable branded PDF reports.

---

## 🌟 Key Features

- **Document Ingestion**: Supports `.pdf` and `.docx` file formats with MIME validation, file size limits, and scanned document / image PDF detection.
- **Centralized Keyword Database**: Pre-seeded with 17 industry job roles, 122+ standardized skills, and 430+ ATS keywords.
- **Hybrid NLP Matching Engine**:
  - Exact & case-insensitive matching
  - Synonym and acronym expansion (e.g., K8s → Kubernetes, GCP → Google Cloud)
  - Semantic sentence embeddings via Sentence Transformers (`all-MiniLM-L6-v2`) with TF-IDF fallback
  - Context-aware validation preventing false positives (e.g., "Java coffee" vs "Java programming")
  - Special character preservation (C++, C#, .NET)
- **Deterministic 100-Point Scoring Engine**:
  - Required Skills (30%)
  - Preferred Skills (10%)
  - Keyword Relevance (20%)
  - Experience Relevance (15%)
  - Education Relevance (10%)
  - Project Relevance (10%)
  - Formatting & Section Audit (5%)
- **Custom Job Description (JD) Extractor**: Extracts technical skills, experience requirements, and responsibilities from pasted job postings.
- **Downloadable PDF Reports**: Professional ReportLab-generated reports with score gauge, category breakdown, skill gap matrix, and actionable recommendations.
- **Candidate Analysis History**: Track previous score attempts, compare progress side-by-side with diff metrics, and manage resumes.
- **Full Administrator Control**:
  - Job roles and skill associations management
  - Keyword dictionary CRUD
  - Dynamic scoring weight configuration (sum to 100% validation)
  - Admin user management (admins can grant privileges or revoke other admins)
- **Redis Load Balancer & Caching Service**: Dynamic query caching for job roles and keywords with automated thread-safe in-memory fallback.
- **Modern Responsive Dashboard**: Light Mode & Dark Mode with high-contrast text and sidebar navigation.

---

## 🛠️ Architecture & Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database**: SQLAlchemy ORM + SQLite (Production-ready for PostgreSQL)
- **NLP & Parsing**: PyMuPDF (`pymupdf`), `python-docx`, `scikit-learn`, `SentenceTransformers`, `spaCy`
- **PDF Generation**: ReportLab
- **Authentication**: JWT (JSON Web Tokens) with `passlib` bcrypt hashing
- **Cache / Load Balancer**: Redis with automated in-memory fallback

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Dark/Light mode support)
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic JWT interceptors

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed centralized database (Roles, Skills, Keywords, Default Admin)
python app/seed/run_seed.py

# Run FastAPI backend server (Port 8000)
python run.py
```

The interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Authentication & Roles

The platform provides role-based access control (RBAC):
- **Candidate / Student**: Access to the ATS Resume Scanner, real-time scoring, history comparison, and official PDF report generation.
- **Administrator**: Dedicated management of the centralized keyword dictionary, job roles, scoring weight configuration, and platform users. Admin accounts are provisioned securely via administrative seed scripts or environment variables.

For testing candidate functionality, demo candidate access is available:
- **Demo Candidate**: `student@uniskill.in` / `student123`

---

## 🧪 Testing

Run the automated test suite with pytest:

```bash
python -m pytest backend/tests/test_ats_engine.py -o pythonpath=backend
```

Tests cover:
- PDF & DOCX text parsing and corrupted file detection
- Hybrid synonym matching & false positive prevention
- Deterministic scoring verification
- PDF report generation
- Authentication & Admin CRUD lifecycle

---

## 📄 License
Proprietary software for UniSkill Career Acceleration Platform.

