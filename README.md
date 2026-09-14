# Mediclime — Full-Stack Medical Publishing & Supplement Platform

A production-ready, scalable clinical content and supplement review platform built with a **React.js / Vite** frontend, **FastAPI** backend, **SQLAlchemy 2.x / PostgreSQL** database, **Gemini/OpenAI** AI content generation engine, and **authenticated Python automation scripts**.

---

## 🏛️ System Architecture

```
                      ┌────────────────────────────┐
                      │    React.js Public Site    │
                      │  (Preserving 100% Design)  │
                      └─────────────┬──────────────┘
                                    │
                                    │ REST API (/api/v1)
                                    ▼
                      ┌────────────────────────────┐
                      │      FastAPI Backend       │
                      │  (Auth, CMS, Media, Jobs)  │
                      └───────┬──────────────┬─────┘
                              │              │
        ┌─────────────────────┼──────────────┼─────────────────────┐
        ▼                     ▼              ▼                     ▼
 ┌─────────────┐       ┌──────────────┐ ┌─────────────┐     ┌──────────────┐
 │ PostgreSQL  │       │ Storage      │ │ AI Provider │     │ External CLI │
 │  Database   │       │ Service      │ │ Layer       │     │ Automation   │
 └─────────────┘       │ (Local / S3) │ └──────┬──────┘     └──────────────┘
                       └──────────────┘        │
                                       ┌───────┴───────┐
                                       │ Gemini/OpenAI │
                                       └───────────────┘

                      ┌────────────────────────────┐
                      │   React Admin Dashboard    │
                      │   (CMS, Editors, Jobs)     │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
                             Same FastAPI API
```

---

## 🚀 Key Features

1. **Exact Design System Preservation**:
   - Built with the established visual identity (`#0F6265` Deep Teal, `#F43F5E` Coral, Plus Jakarta Sans, and Newsreader serif).
   - Faithful evolution of the **Article Detail Page** (executive summaries, pathology diagrams, nutrient grades, clinical citations, and structured FAQs).
   - Faithful evolution of the **Supplement Detail Page** (pharmaceutical Supplement Facts table, third-party lab verification badges, and dosage directions).
   - Interactive **Side-by-Side Supplement Comparison Matrix**.
2. **Structured Content Block Architecture**:
   - The backend stores articles as structured JSON blocks (`heading`, `paragraph`, `callout`, `nutrient_card`, `pull_quote`, `table`, `faqs`, `sources`), preventing arbitrary HTML injection and guaranteeing perfect styling.
3. **Comprehensive Admin CMS Portal (`/admin`)**:
   - Dual View Article Editor with a **Live Public Article Detail Preview** toggle.
   - Dual View Supplement Editor with a **Live Public Supplement Detail Preview** toggle.
   - Visual Media Library with dimension extraction, file size inspection, and instant URL copying.
   - Dedicated AI Generation Workspace with real-time job status polling.
   - API Key Management with granular permissions.
4. **AI Generation Engine (Gemini & OpenAI)**:
   - Provider-agnostic abstraction with strict medical safety guardrails (avoids false diagnoses, prevents fabricated citations, and enforces FDA disclaimers).
   - Asynchronous job queue (`GenerationJob`) returning job IDs and supporting status polling.
   - Pydantic v2 schema validation of all AI outputs before saving to draft.
5. **External Python Automation (`scripts/article_generator/`)**:
   - External scripts communicate strictly through authenticated REST endpoints (`POST /api/v1/integrations/articles/generate`).
   - Supports permission-checked auto-publishing via API Keys (`article:create`, `article:publish`).

---

## 📁 Repository Structure

```
├── frontend/                  # React + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── api/               # Centralized REST API client layer
│   │   ├── components/        # Reusable UI components & ContentBlockRenderer
│   │   ├── layouts/           # PublicLayout & AdminLayout
│   │   ├── pages/             # Public pages (Home, ArticleDetail, Supplements, etc.)
│   │   ├── admin/             # Admin CMS (Articles, Products, Media, AI, API Keys)
│   │   └── styles/            # Design tokens & Tailwind directives
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI entry point, CORS, routers
│   │   ├── core/              # Config, security (JWT, bcrypt), database session
│   │   ├── models/            # SQLAlchemy 2.x models (Article, Product, User, etc.)
│   │   ├── schemas/           # Pydantic v2 schemas and AI output validation
│   │   ├── routers/           # v1 endpoints (public, admin, media, ai, integrations)
│   │   ├── services/          # Business logic & AI Provider abstraction
│   │   └── dependencies/      # JWT and API Key permission guards
│   ├── alembic/               # Alembic database migrations
│   ├── tests/                 # Automated pytest test suite
│   ├── seed_data.py           # Populates initial medical data and admin user
│   ├── requirements.txt
│   └── .env.example
│
├── scripts/
│   └── article_generator/     # Standalone Python CLI automation client
│       ├── config.py
│       ├── client.py          # Authenticated REST client SDK
│       ├── generate_article.py# CLI for generating articles via API
│       ├── publish_article.py # CLI for submitting structured drafts
│       └── README.md
│
├── docs/                      # Platform Documentation
│   ├── API.md                 # Full REST API Reference
│   ├── INTEGRATION.md         # External script automation guide
│   └── DEPLOYMENT.md          # Production, Vercel & PostgreSQL guide
│
├── tasks.md                   # Live workspace task tracking file
└── .env.example               # Master environment variable template
```

---

## 🏁 Quickstart Guide

### 1. Start the Backend API

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed database (Creates admin user, categories, Arialief, Neuropathy article, test API key)
python seed_data.py

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000`
- Interactive Documentation: `http://localhost:8000/docs`

### 2. Start the React Frontend.

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```
- Public Website: `http://localhost:5173`
- Admin CMS Dashboard: `http://localhost:5173/admin`
- Default Admin Login: `admin@mediclime.com` / `MediclimeAdmin2026!`

### 3. Run Backend Automated Tests

```bash
pytest backend/tests
```

### 4. Run the External Python Article Generator CLI

```bash
cd scripts/article_generator
python generate_article.py \
  --title "Evidence-Based Benfotiamine for Peripheral Nerve Regeneration" \
  --category "Nervous Health" \
  --keyword "benfotiamine neuropathy" \
  --word-count 1500
```

---

## 📖 Additional Documentation

- [REST API Reference](docs/API.md) — Comprehensive listing of all `/api/v1` public, admin, and AI endpoints.
- [External Python Integration](docs/INTEGRATION.md) — How external automation scripts interact with the platform without database access.
- [Production & Vercel Deployment](docs/DEPLOYMENT.md) — Deployment instructions for PostgreSQL, Vercel Serverless, and AWS S3 storage.
