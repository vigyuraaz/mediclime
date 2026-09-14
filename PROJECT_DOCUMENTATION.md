# MediClime & White-Label Health CMS — Master Project Documentation

> **Document Type:** Comprehensive Technical & Operational Specification  
> **Target Audience:** Developers, DevOps Engineers, System Administrators, Technical Project Managers, and AI Document Generators (Claude / Word Converter)  
> **Platform Version:** 2.4.0 (Production Ready)  
> **Last Updated:** September 2026  
> **Status:** Fully Tested & Verified  

---

## Executive Summary

**MediClime** is an enterprise-grade, evidence-first medical publishing and nutraceutical review platform designed for high-authority healthcare content, rigorous editorial workflows, and programmatic affiliate monetization. Built with a decoupled architecture featuring a **FastAPI (Python 3.10+)** backend and a **React 18 + Vite** frontend, the platform integrates automated AI content generation with clinical guardrails, structured JSON content blocks, pharmaceutical-grade supplement fact matrices, and dynamic SEO management.

Additionally, MediClime features a **Plug & Play White-Label Site Cloning Engine**. Through an administrative control panel, non-technical site owners can rebrand and clone the entire platform in minutes—dynamically updating site identity, typography highlights, logos, announcement banners, global SEO metadata, and legal footers across all public and administrative interfaces without touching a single line of code.

---

## Table of Contents

1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [Repository & Directory Structure](#3-repository--directory-structure)
4. [Core Features & Modules](#4-core-features--modules)
   - 4.1. [Evidence-Based Clinical Articles](#41-evidence-based-clinical-articles)
   - 4.2. [Nutraceutical & Supplement Reviews](#42-nutraceutical--supplement-reviews)
   - 4.3. [Side-by-Side Supplement Comparison Matrix](#43-side-by-side-supplement-comparison-matrix)
   - 4.4. [AI Content Generation Engine](#44-ai-content-generation-engine)
   - 4.5. [Dynamic SEO & Head Tag Management](#45-dynamic-seo--head-tag-management)
   - 4.6. [Plug & Play White-Label Site Cloning](#46-plug--play-white-label-site-cloning)
   - 4.7. [Media Library & Cloudflare R2 / S3 Integration](#47-media-library--cloudflare-r2--s3-integration)
   - 4.8. [API Key Management & Headless CLI Automation](#48-api-key-management--headless-cli-automation)
   - 4.9. [Authentication & Role-Based Access Control](#49-authentication--role-based-access-control)
5. [Database Architecture & Data Models](#5-database-architecture--data-models)
6. [API Specification & Endpoints Reference](#6-api-specification--endpoints-reference)
7. [Environment Variables & Configuration](#7-environment-variables--configuration)
8. [Local Development & Installation Guide](#8-local-development--installation-guide)
9. [Operations & Administrative Workflow Guide](#9-operations--administrative-workflow-guide)
10. [Testing & Quality Assurance Guide](#10-testing--quality-assurance-guide)
11. [Production Deployment Guide](#11-production-deployment-guide)
    - 11.1. [Ubuntu VPS Deployment with Nginx & Systemd](#111-ubuntu-vps-deployment-with-nginx--systemd)
    - 11.2. [PaaS Deployment (Render, Railway, Supabase)](#112-paas-deployment-render-railway-supabase)
    - 11.3. [Cloudflare R2 Storage Configuration](#113-cloudflare-r2-storage-configuration)
12. [Security Hardening & Maintenance](#12-security-hardening--maintenance)
13. [Troubleshooting & Frequently Asked Questions](#13-troubleshooting--frequently-asked-questions)

---

## 1. System Overview & Architecture

MediClime adopts a decoupled, modern client-server architecture engineered for sub-second page loads, high SEO search indexing, and resilient multi-tenant/white-label branding.

### High-Level System Architecture Diagram

```
                              ┌────────────────────────────────────────┐
                              │           Web Browser Client           │
                              │   (Public Reader or Admin User)        │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  │ HTTPS Requests
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │       Nginx Reverse Proxy / CDN        │
                              │   (SSL Termination, Gzip, Caching)     │
                              └─────────┬────────────────────┬─────────┘
                                        │                    │
                  Static SPA Requests   │                    │ /api/v1/*
                                        ▼                    ▼
     ┌────────────────────────────────────┐    ┌──────────────────────────────────┐
     │       Vite / React 18 SPA          │    │         FastAPI Backend          │
     │  - React Router v6 DOM             │    │  - Uvicorn ASGI Server           │
     │  - Reactive SiteContext            │    │  - JWT & API Key Auth Guards     │
     │  - Marked + DOMPurify Sanitizer    │    │  - Pydantic v2 Validation Layer  │
     │  - React Helmet Dynamic Head       │    │  - Background Job Processor      │
     └────────────────────────────────────┘    └───────┬─────────────┬────────────┘
                                                       │             │
                             SQLAlchemy ORM 2.x Session│             │ S3 API
                                                       ▼             ▼
                           ┌───────────────────────────────┐ ┌────────────────────┐
                           │      PostgreSQL Database      │ │   Cloudflare R2    │
                           │  (Supabase / Neon / Local DB) │ │  / AWS S3 Storage  │
                           │  - Articles & Products        │ │  (Media Assets)    │
                           │  - Site Configuration         │ └────────────────────┘
                           │  - Users, Jobs & API Keys     │
                           └───────────────────────────────┘
                                           ▲
                                           │ Async Prompt Execution
                                           ▼
                           ┌───────────────────────────────┐
                           │      AI Provider Layer        │
                           │  - Google Gemini Pro / Flash  │
                           │  - Groq (LLaMA 3 70B)         │
                           │  - OpenAI GPT-4               │
                           └───────────────────────────────┘
```

### Architectural Principles
1. **Zero Data Leakage in Content Blocks:** Articles are stored as discrete, typed JSON blocks (`heading`, `paragraph`, `callout`, `nutrient_card`, `pull_quote`, `table`, `faqs`, `sources`). This eliminates arbitrary layout breakages, enforces consistent design guidelines, and prevents XSS attacks.
2. **Dynamic Branding via Context:** The frontend subscribes to a global `SiteContext` loaded on initial hydration. The site's title, logo, tagline, favicon, banner text, and footer copyright are injected dynamically across all components.
3. **Dual Database Compatibility:** The backend natively supports managed PostgreSQL (Supabase, Neon, AWS RDS) with automated connection pooling and gracefully falls back to local SQLite for disconnected development or testing environments.
4. **Asynchronous Non-Blocking Workers:** AI generation tasks run as asynchronous FastAPI background jobs, providing immediate job IDs to the client and allowing real-time polling without blocking request workers.

---

## 2. Complete Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | FastAPI | `0.110+` | High-performance asynchronous REST API framework |
| **ASGI Web Server** | Uvicorn / Gunicorn | `0.28+` | Production ASGI web server with worker management |
| **Database ORM** | SQLAlchemy | `2.0+` | Declarative object-relational mapping & query building |
| **Data Validation** | Pydantic | `2.6+` | Strict schema validation and JSON serialization |
| **Database Engines** | PostgreSQL / SQLite | Postgres 15+ / SQLite 3 | Relational database storage |
| **Authentication** | Python-Jose & Passlib | `3.3.0` / `1.7.4` | JWT token generation, verification & BCrypt password hashing |
| **HTTP Client** | HTTPX | `0.27+` | Asynchronous HTTP requests to AI providers and external webhooks |
| **Testing Suite** | Pytest & AnyIO | `9.1+` | Automated endpoint testing and integration test execution |
| **Frontend Framework** | React.js | `18.3+` | Single Page Application (SPA) component architecture |
| **Build Tool & Bundler**| Vite | `5.4+` | Ultra-fast HMR and optimized production rollups |
| **Client Routing** | React Router DOM | `6.22+` | Client-side routing with nested admin layouts |
| **Head & SEO Management**| React Helmet Async | `2.0+` | Dynamic document title, meta tags, and structured data injection |
| **Markdown Engine** | Marked & DOMPurify | `12.0+` / `3.0+` | Safe GitHub-flavored markdown parsing & XSS sanitization |
| **Rich Text Editor** | React Quill | `2.0+` | WYSIWYG article and product description editing |
| **Iconography** | Lucide React | `0.359+` | Lightweight SVG icons for healthcare and admin interfaces |
| **Media Storage** | Cloudflare R2 / AWS S3 | Boto3 SDK | Scalable, zero-egress asset storage |

---

## 3. Repository & Directory Structure

```
Indian Blog Project/
├── .env                                # Root environment variable configuration
├── .gitignore                          # Git ignore rules for node_modules, venvs, dist
├── README.md                           # Quick-start summary
├── setup.md                            # Cloudflare R2 and PostgreSQL setup guide
├── PROJECT_DOCUMENTATION.md            # Comprehensive master documentation (this file)
│
├── backend/                            # FastAPI Python Backend Application
│   ├── alembic/                        # Database migration scripts and environment
│   │   ├── env.py
│   │   └── versions/
│   ├── app/
│   │   ├── main.py                     # Application entry point, CORS, routers & startup
│   │   ├── core/                       # Core infrastructure configuration
│   │   │   ├── config.py               # Pydantic BaseSettings loading from .env
│   │   │   ├── database.py             # SQLAlchemy engine, SessionLocal, and DB session
│   │   │   └── security.py             # Password hashing (bcrypt) and JWT encode/decode
│   │   ├── dependencies/               # Security and permission dependency injection
│   │   │   └── auth.py                 # get_current_user, require_admin, require_permission
│   │   ├── models/                     # SQLAlchemy declarative ORM models
│   │   │   ├── __init__.py             # Model exports
│   │   │   ├── user.py                 # User model (Admin, Editor, Reviewer)
│   │   │   ├── article.py              # Article, ArticleFAQ, ArticleSource models
│   │   │   ├── product.py              # Product, SupplementFact, Benefit, FAQ models
│   │   │   ├── condition.py            # Medical condition classification
│   │   │   ├── category.py             # Category taxonomy and tag associations
│   │   │   ├── media.py                # Uploaded media assets tracking
│   │   │   ├── api_key.py              # Headless integration API keys & scopes
│   │   │   ├── ai_job.py               # AI Generation background jobs
│   │   │   └── site_setting.py         # White-label site configuration model
│   │   ├── schemas/                    # Pydantic v2 request/response contracts
│   │   │   ├── common.py               # Standard API response envelopes
│   │   │   ├── user.py                 # User creation, update, and token schemas
│   │   │   ├── article.py              # Article schemas with meta_keywords
│   │   │   ├── product.py              # Product schemas with meta_keywords
│   │   │   ├── condition.py            # Medical condition schemas
│   │   │   ├── category.py             # Category and Tag schemas
│   │   │   ├── media.py                # Media upload and metadata schemas
│   │   │   ├── api_key.py              # API Key management schemas
│   │   │   ├── ai.py                   # AI Generation requests, jobs, and structured outputs
│   │   │   └── settings.py             # White-label SiteConfig schemas
│   │   ├── routers/                    # REST API route handlers (/api/v1)
│   │   │   ├── auth.py                 # Login, refresh, and profile endpoints
│   │   │   ├── public.py               # Public articles, products, search, settings
│   │   │   ├── admin.py                # Admin CMS CRUD and stats endpoints
│   │   │   ├── ai.py                   # AI trigger, background tasks, and job status
│   │   │   ├── media.py                # File upload, deletion, and gallery retrieval
│   │   │   └── integrations.py         # Headless API Key-secured endpoints
│   │   └── services/                   # Business logic and external services
│   │       ├── article_service.py      # Article validation, slugging, and persistence
│   │       ├── product_service.py      # Product facts, benefits, and persistence
│   │       ├── ai_service.py           # Gemini, Groq, and OpenAI provider implementations
│   │       └── storage.py              # Local disk and Cloudflare R2 / S3 client
│   ├── tests/                          # Automated backend tests
│   │   ├── conftest.py                 # Pytest fixtures and mock database setup
│   │   └── test_endpoints.py           # 12+ automated regression test cases
│   ├── clean_and_migrate_db.py         # Automated database migration and data cleaner
│   ├── verify_e2e.py                   # 7-point comprehensive full-stack test script
│   ├── seed_data.py                    # Database seeder with clinical articles & products
│   └── requirements.txt                # Python backend package dependencies
│
├── frontend/                           # React 18 + Vite Frontend Application
│   ├── public/                         # Static assets (favicons, manifest, default logos)
│   ├── src/
│   │   ├── api/                        # Centralized API service layer
│   │   │   ├── client.js               # Fetch wrapper with JWT injection & error handling
│   │   │   ├── publicServices.js       # Public read-only endpoints
│   │   │   ├── adminServices.js        # Protected administrative endpoints
│   │   │   └── settings.js             # Public and Admin settings API client
│   │   ├── context/                    # React Context providers
│   │   │   ├── AuthContext.jsx         # User login state, token storage & RBAC guards
│   │   │   └── SiteContext.jsx         # Global white-label branding & live preview state
│   │   ├── components/                 # Reusable UI component library
│   │   │   ├── Header.jsx              # Dynamic branded header with navigation
│   │   │   ├── Footer.jsx              # Dynamic branded footer with legal disclaimers
│   │   │   ├── ContentBlockRenderer.jsx# Semantic JSON content block parser
│   │   │   ├── ComparisonMatrix.jsx    # Side-by-side supplement comparison table
│   │   │   ├── MedicalDisclaimer.jsx   # FDA clinical safety disclaimers
│   │   │   └── SEO.jsx                 # Dynamic React Helmet meta tag injector
│   │   ├── layouts/                    # Application structural layouts
│   │   │   ├── PublicLayout.jsx        # Public pages layout with header and footer
│   │   │   └── AdminLayout.jsx         # Sidebar admin dashboard layout
│   │   ├── pages/                      # Public page views
│   │   │   ├── HomePage.jsx            # Featured articles, hero banner, top products
│   │   │   ├── ArticleDetailPage.jsx   # Clinical article reader with table of contents
│   │   │   ├── SupplementDetailPage.jsx# Product review with supplement facts table
│   │   │   ├── ComparePage.jsx         # Interactive multi-product comparison page
│   │   │   ├── SearchPage.jsx          # Live faceted search across articles & products
│   │   │   └── AuthorDetailPage.jsx    # Medical reviewer credentials and authored works
│   │   ├── admin/                      # Admin CMS pages
│   │   │   ├── AdminDashboardPage.jsx  # Overview metrics, recent drafts, quick actions
│   │   │   ├── AdminArticleEditorPage.jsx# Rich article authoring and SEO meta keywords
│   │   │   ├── AdminProductEditorPage.jsx# Supplement fact editor, pricing, meta keywords
│   │   │   ├── AdminAIPage.jsx         # AI generation queue and prompt configurator
│   │   │   ├── AdminMediaPage.jsx      # Visual asset manager with copyable URLs
│   │   │   ├── AdminApiKeysPage.jsx    # Headless API token generation and revoking
│   │   │   └── AdminSettingsPage.jsx   # Plug & Play White-Label Site Cloning center
│   │   ├── utils/                      # Helper utilities
│   │   │   ├── markdown.js             # Robust Markdown-to-HTML parser and sanitizer
│   │   │   └── formatting.js           # Date, currency, and slug formatting helpers
│   │   ├── App.jsx                     # Root React routing and context tree
│   │   ├── main.jsx                    # React DOM entry point
│   │   └── index.css                   # Global CSS design system and typography rules
│   ├── index.html                      # HTML template with dynamic root mount
│   ├── package.json                    # Frontend dependencies and scripts
│   ├── tailwind.config.js              # Tailwind design tokens and utility overrides
│   └── vite.config.js                  # Vite configuration and dev server proxy
│
└── scripts/                            # Standalone Automation Clients
    └── article_generator/              # External Python script for automated publishing
        ├── publish_article.py
        └── requirements.txt
```

---

## 4. Core Features & Modules

### 4.1. Evidence-Based Clinical Articles
MediClime delivers a structured medical publication experience designed to establish clinical authority:
- **Block-Based Content Storage:** Articles are stored as structured JSON schemas. Supported block types:
  - `heading` (H1–H4 with auto-generated table of contents anchors).
  - `paragraph` (Rich text with PubMed citations and scientific notations).
  - `callout` (Clinical warnings, dosage notes, or key takeaways).
  - `nutrient_card` (Vitamin, mineral, or compound therapeutic grade rating).
  - `pull_quote` (Prominent clinical quotes with attribution).
  - `table` (Clinical trial outcome comparisons).
- **Executive Summary:** Collapsible or highlighted takeaways at the top of the article.
- **Medical Reviewer Credentials:** Transparent author and medical reviewer attribution, including medical board certifications, degrees, and editorial review timestamps.
- **Scientific Citations:** Footnote-style academic citations linking directly to PubMed, NCBI, and DOI records.
- **Interactive FAQ Accordion:** Semantic FAQ schema formatted for Google Search Rich Results.

### 4.2. Nutraceutical & Supplement Reviews
Supplement review pages are modeled after pharmaceutical standards to foster reader trust:
- **Pharmaceutical Supplement Facts Table:** Exact dosage breakdown per serving, active compound percentages, and % Daily Value (`% DV`).
- **Third-Party Verification Badges:** Visual credibility indicators (e.g., GMP Certified, Non-GMO, NSF Certified, Third-Party Lab Tested).
- **Dosage & Usage Protocols:** Clear instructions on administration timing, cycle durations, and contraindications.
- **Affiliate Link Redirection:** Encrypted, tracked external purchase buttons with automated `rel="nofollow sponsored"` attributes.
- **Markdown-Free Clean Formatting:** Automatic backend and frontend sanitization to ensure zero raw markdown symbols (`##`, `**`) bleed into public views.

### 4.3. Side-by-Side Supplement Comparison Matrix
- Compare up to 4 supplements across key attributes: active ingredients, price per serving, third-party certifications, rating, and user reviews.
- Dynamic matrix rendering accessible at `/compare`.

### 4.4. AI Content Generation Engine
MediClime includes a multi-provider AI generation pipeline (`backend/app/services/ai_service.py`):
- **Provider Support:** Seamless switching between **Google Gemini** (`gemini-1.5-pro` / `gemini-1.5-flash`), **Groq** (`llama-3.3-70b-versatile`), and **OpenAI** (`gpt-4o`).
- **Clinical Safety Guardrails:** Strict prompt engineering prevents the AI from generating definitive diagnostic claims, prescribing controlled substances, or citing non-existent clinical journals.
- **Automated Meta Keywords Engine:** Generates exactly **5 to 6 targeted, high-intent SEO keywords** tailored to the topic or supplement formula.
- **Automated HTML Cleanup:** Generates clean semantic HTML (`<h2>`, `<p>`, `<ul>`, `<li>`), stripping any malformed markdown headings.
- **Image Generation Prompting:** Synthesizes ready-to-use Midjourney and DALL-E image prompts stored directly in the editorial draft for creative teams.

### 4.5. Dynamic SEO & Head Tag Management
Search engine visibility is built directly into every page via `react-helmet-async`:
- **Dynamic `<head>` Injection:** Public pages dynamically generate:
  - `<title>`: Dynamic page title matching editorial standards.
  - `<meta name="description">`: Compelling, truncated search summaries.
  - `<meta name="keywords">`: 5–6 high-intent comma-separated keywords.
  - `<link rel="canonical">`: Canonical URL to eliminate duplicate content penalties.
- **OpenGraph & Twitter Cards:** Dynamic social sharing cards (`og:title`, `og:image`, `og:type`).
- **Schema.org Structured Data:** Automatically embeds JSON-LD for `MedicalWebPage`, `Article`, `Product`, and `FAQPage`.

### 4.6. Plug & Play White-Label Site Cloning
The platform can be cloned into a new brand in under **2 minutes** through the `/admin/settings` control center:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Admin Plug & Play Site Settings                      │
├────────────────────────────────────────────────────────────────────────┤
│ [ Brand & Identity ] [ Announcements ] [ Global SEO ] [ Footer & Info ]│
│                                                                        │
│ Website Brand Name:         [ HealthVibe                      ]        │
│ Brand Highlight / Suffix:   [ Vibe                            ]        │
│ Website Tagline:            [ Next-Gen Clinical Vitality      ]        │
│ Logo URL / Upload:          [ https://cdn.example.com/logo.png]        │
│ Favicon URL:                [ https://cdn.example.com/fav.ico ]        │
│ Top Announcement Banner:    [ Enabled [✓]                     ]        │
│ Announcement Text:          [ Free Shipping On Health Kits!   ]        │
│ Default Meta Title:         [ HealthVibe — Modern Wellness    ]        │
│ Default Meta Keywords:      [ health, vitamins, supplements   ]        │
│ Footer Copyright:           [ 2026 HealthVibe Inc. All Rights ]        │
│ Support Email:              [ support@healthvibe.com          ]        │
│                                                                        │
│                      [ Save Site Settings ]                            │
└────────────────────────────────────────────────────────────────────────┘
```
- **Instant Global Propagation:** Changes saved in the admin settings panel immediately update the public Header logo, Announcement Banner, Document Title, Meta Keywords, and Footer Copyright across all visitors without restarting any servers.
- **Live Preview Card:** Real-time interactive header preview directly inside the admin panel before saving.

### 4.7. Media Library & Cloudflare R2 / S3 Integration
- **Hybrid Storage:** Toggle between local filesystem storage (`STORAGE_PROVIDER=local`) and S3-compatible cloud object storage (`STORAGE_PROVIDER=s3`), optimized for **Cloudflare R2** (zero egress fees).
- **Asset Metadata:** Automated extraction of MIME types, image dimensions (width x height), and file sizes upon upload.
- **One-Click URL Copying:** Copy CDN URLs directly into the clipboard for immediate pasting into article content blocks or product galleries.

### 4.8. API Key Management & Headless CLI Automation
- **Granular Scopes:** Generate unique API keys (`med_live_...`) with fine-grained permissions:
  - `article:create` — Submit article drafts programmatically.
  - `article:publish` — Directly publish live content.
  - `product:create` — Submit supplement review drafts.
- **Automated Publishing Scripts:** Includes a standalone Python automation client (`scripts/article_generator/publish_article.py`) for headless integrations with external scrapers, Make.com, or Zapier workflows.

### 4.9. Authentication & Role-Based Access Control
- **Security:** Industry-standard **OAuth2 Bearer Tokens (JWT)** with BCrypt password hashing (`salt_rounds=12`).
- **Predefined Roles:**
  - `admin`: Full administrative control (site cloning settings, user management, API keys, direct publishing).
  - `editor`: Author and edit articles, manage supplements, upload media, run AI jobs.
  - `reviewer`: Read-only access to drafts for clinical fact-checking and medical sign-off.

---

## 5. Database Architecture & Data Models

MediClime uses SQLAlchemy 2.0 declarative models mapped across 12 relational tables.

```
┌─────────────┐        ┌──────────────┐        ┌───────────────────┐
│    users    │◄───────┤   articles   ├───────►│   article_faqs    │
└─────────────┘        └──────┬───────┘        └───────────────────┘
                              │
                              ├───────────────►┌───────────────────┐
                              │                │  article_sources  │
                              ▼                └───────────────────┘
                       ┌──────────────┐
                       │  categories  │
                       └──────┬───────┘
                              │
┌─────────────┐        ┌──────▼───────┐        ┌───────────────────┐
│ site_configs│        │   products   ├───────►│ supplement_facts  │
└─────────────┘        └──────┬───────┘        └───────────────────┘
                              │
                              ├───────────────►┌───────────────────┐
                              │                │ product_benefits  │
                              ▼                └───────────────────┘
                       ┌──────────────┐
                       │ product_faqs │
                       └──────────────┘
```

### Table Specifications

#### 1. `site_configs` (White-Label Branding Engine)
Stores dynamic site configuration for instantaneous white-label cloning.
- `id` (Integer, Primary Key)
- `site_name` (String, default: "Mediclime")
- `site_name_highlight` (String, default: "clime")
- `site_tagline` (String, default: "Evidence-Led Health")
- `site_description` (Text)
- `logo_url` (String, nullable)
- `favicon_url` (String, nullable)
- `announcement_enabled` (Boolean, default: True)
- `announcement_text` (String)
- `default_meta_title` (String)
- `default_meta_description` (Text)
- `default_meta_keywords` (Text)
- `contact_email` (String)
- `contact_phone` (String)
- `footer_copyright` (String)
- `social_twitter` / `social_facebook` / `social_instagram` / `social_youtube` / `social_linkedin` (String)
- `primary_color` (String, default: "#094749")
- `accent_color` (String, default: "#F43F5E")
- `updated_at` (DateTime)

#### 2. `articles`
Stores structured clinical guides and educational content.
- `id` (Integer, Primary Key)
- `slug` (String, Unique, Indexed)
- `title` (String, Indexed)
- `subtitle` (String)
- `excerpt` (Text)
- `featured_image` (String)
- `category_id` (Integer, ForeignKey -> `categories.id`)
- `condition_id` (Integer, ForeignKey -> `conditions.id`, Nullable)
- `author_id` (Integer, ForeignKey -> `users.id`)
- `reviewer_id` (Integer, ForeignKey -> `users.id`, Nullable)
- `status` (Enum: `draft`, `in_review`, `published`, `archived`)
- `medical_review_status` (Enum: `unreviewed`, `in_review`, `approved`, `revision_requested`)
- `content_blocks` (JSONB / JSON — Array of typed block objects)
- `executive_summary` (JSONB / JSON — Array of bullet points)
- `reading_time` (Integer, minutes)
- `word_count` (Integer)
- `seo_title` (String)
- `seo_description` (Text)
- `meta_keywords` (Text — Comma-separated targeted SEO keywords)
- `published_at` / `created_at` / `updated_at` (DateTime)

#### 3. `products`
Stores nutraceutical profiles, supplement reviews, and commercial metadata.
- `id` (Integer, Primary Key)
- `slug` (String, Unique, Indexed)
- `name` (String, Indexed)
- `brand` (String)
- `category_id` (Integer, ForeignKey -> `categories.id`)
- `featured_image` (String)
- `short_description` (Text)
- `description` (Text — Clean sanitized HTML)
- `rating` (Float, default: 0.0)
- `price` (Float)
- `serving_size` (String)
- `form` (String: Capsules, Powder, Liquid, Tablets)
- `highlight_badges` (JSON — Array of strings)
- `dosage` / `directions` / `warnings` / `allergens` / `storage` (Text)
- `affiliate_url` (String)
- `status` (Enum: `draft`, `published`, `archived`)
- `seo_title` (String)
- `seo_description` (Text)
- `meta_keywords` (Text — Comma-separated targeted SEO keywords)
- `created_at` / `updated_at` (DateTime)

#### 4. Auxiliary Tables
- `supplement_facts`: Line items for supplement labels (`ingredient_name`, `amount`, `daily_value`).
- `product_benefits`: Discrete benefits (`benefit`, `description`).
- `product_faqs` & `article_faqs`: Structured Q&A pairs (`question`, `answer`).
- `article_sources`: Peer-reviewed clinical citations (`title`, `url`, `publisher`, `published_date`, `citation_text`).
- `media`: Asset metadata (`filename`, `original_filename`, `mime_type`, `file_size`, `width`, `height`, `url`, `storage_provider`).
- `api_keys`: Developer programmatic tokens (`key_hash`, `prefix`, `name`, `scopes`, `is_active`, `expires_at`).
- `generation_jobs`: Background AI job tracking (`job_id`, `job_type`, `status`, `request_data`, `output_data`, `error_message`).

---

## 6. API Specification & Endpoints Reference

Base URL: `http://localhost:8000/api/v1` (or your production API domain).

### 6.1. Public Endpoints (No Auth Required)

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/public/settings` | Get live branding and site configuration | None |
| `GET` | `/public/articles` | List published articles | `page`, `page_size`, `category`, `search` |
| `GET` | `/public/articles/{slug}` | Get full article by slug (with FAQs & sources) | None |
| `GET` | `/public/products` | List published supplements | `page`, `page_size`, `category`, `search` |
| `GET` | `/public/products/{slug}` | Get supplement details with facts & benefits | None |
| `GET` | `/public/categories` | List all editorial categories | None |
| `GET` | `/public/conditions` | List all medical condition hubs | None |
| `GET` | `/public/authors` | List accredited medical authors & reviewers | None |
| `GET` | `/public/search` | Unified search across articles & supplements | `q` (search string) |

### 6.2. Administrative Endpoints (Bearer JWT Required)

| Method | Endpoint | Description | Scope / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate with email/password; returns JWT | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile & permissions | Any Authenticated |
| `GET` | `/admin/overview/stats` | Dashboard metrics (total articles, jobs, views) | Admin, Editor |
| `GET` | `/admin/settings` | Retrieve complete white-label settings | Admin Only |
| `PUT` | `/admin/settings` | Update white-label settings (site clone) | Admin Only |
| `GET` | `/admin/articles` | List all articles (including drafts & archived) | Admin, Editor |
| `POST` | `/admin/articles` | Create new article draft | Admin, Editor |
| `GET` | `/admin/articles/{id}` | Get single article for editing | Admin, Editor |
| `PUT` | `/admin/articles/{id}` | Update article content, status, meta_keywords | Admin, Editor |
| `DELETE`| `/admin/articles/{id}` | Archive / Delete article | Admin Only |
| `GET` | `/admin/products` | List all supplement reviews | Admin, Editor |
| `POST` | `/admin/products` | Create supplement review draft | Admin, Editor |
| `PUT` | `/admin/products/{id}` | Update supplement details, facts, meta_keywords| Admin, Editor |
| `DELETE`| `/admin/products/{id}` | Archive / Delete supplement review | Admin Only |

### 6.3. AI Generation Endpoints

| Method | Endpoint | Description | Payload Sample |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/articles/generate` | Queue AI article generation | `{"title": "Magnesium for Neuropathy", "category": "Nervous Health", "desired_word_count": 1200}` |
| `POST` | `/ai/products/generate` | Queue AI supplement review | `{"name": "ProDentim", "category": "Oral Health", "serving_size": "1 Soft Chew"}` |
| `GET` | `/ai/jobs/{job_id}` | Poll background job status | None (Returns: `queued`, `processing`, `completed`, `failed`) |

### 6.4. Media & Integration Endpoints

| Method | Endpoint | Description | Auth Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/media` | List uploaded media files | Bearer JWT |
| `POST` | `/media/upload` | Upload image file (Multipart form) | Bearer JWT |
| `DELETE`| `/media/{id}` | Delete media asset | Bearer JWT |
| `POST` | `/integrations/articles/generate` | Headless external publishing API | `X-API-Key: med_live_...` |

---

## 7. Environment Variables & Configuration

The application is configured through a centralized `.env` file located in the root of the project.

```env
# ==============================================================================
# ENVIRONMENT & CORE CONFIGURATION
# ==============================================================================
ENVIRONMENT=development                # development | staging | production
PROJECT_NAME="Mediclime"
API_V1_STR="/api/v1"
SECRET_KEY="replace_with_a_super_secret_64_character_hex_key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440       # 24 Hours

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
# Managed PostgreSQL (Supabase / Neon / RDS) - Note: Use postgresql+psycopg2://
DATABASE_URL="postgresql+psycopg2://postgres.xxxx:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Local SQLite Fallback (automatically used if DATABASE_URL is empty or unresolvable)
# SQLITE_URL="sqlite:///./mediclime.db"

# ==============================================================================
# CORS SETTINGS (Comma-separated origins)
# ==============================================================================
CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://yourdomain.com"

# ==============================================================================
# AI ENGINE CONFIGURATION (Select Provider)
# ==============================================================================
# Supported: gemini | groq | openai | mock
AI_DEFAULT_PROVIDER="groq"

# API Keys
GEMINI_API_KEY="AIzaSy..."
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-..."

# Models
GROQ_MODEL="llama-3.3-70b-versatile"
GEMINI_MODEL="gemini-1.5-pro"
OPENAI_MODEL="gpt-4o"

# ==============================================================================
# MEDIA STORAGE (Local Disk or Cloudflare R2 / AWS S3)
# ==============================================================================
STORAGE_PROVIDER="local"               # local | s3

# Cloudflare R2 / S3 Configuration (Required if STORAGE_PROVIDER=s3)
AWS_ACCESS_KEY_ID="your_r2_access_key"
AWS_SECRET_ACCESS_KEY="your_r2_secret_key"
AWS_REGION="auto"
S3_BUCKET_NAME="mediclime-media"
S3_ENDPOINT_URL="https://your_cloudflare_account_id.r2.cloudflarestorage.com"
S3_PUBLIC_BASE_URL="https://media.yourdomain.com"

# ==============================================================================
# INITIAL SUPER ADMIN SEED CREDENTIALS
# ==============================================================================
INITIAL_ADMIN_EMAIL="admin@mediclime.com"
INITIAL_ADMIN_PASSWORD="MediclimeAdmin2026!"
INITIAL_ADMIN_NAME="Mediclime Super Admin"

# Internal Automation / Cron Secret
INTERNAL_CRON_SECRET="mediclime_cron_secret_worker_auth_key_2026"
```

---

## 8. Local Development & Installation Guide

Follow these sequential steps to set up and run the entire platform locally from source.

### Prerequisites
- **Python:** Version 3.10, 3.11, or 3.12 installed.
- **Node.js:** Version 18.x or 20.x LTS installed with `npm`.
- **Git:** Installed on your machine.

---

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/indian-blog-project.git
cd "Indian Blog Project"

# Copy environment template if not present
cp .env.example .env
# Edit .env with your credentials (or retain defaults for SQLite & local storage)
```

---

### Step 2: Backend Setup
Open a terminal in the root project directory:

```bash
# 1. Create and activate a Python virtual environment
python -m venv venv

# Windows PowerShell / CMD:
.\venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

# 2. Upgrade pip and install all backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. Run database migrations and clean data
python backend/clean_and_migrate_db.py

# 4. (Optional) Seed the database with sample clinical articles and supplements
python backend/seed_data.py

# 5. Start the FastAPI backend server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend API is now live at `http://127.0.0.1:8000` with interactive Swagger API docs at `http://127.0.0.1:8000/docs`.*

---

### Step 3: Frontend Setup
Open a second terminal window in the root directory:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install all Node package dependencies
npm install

# 3. Start the Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
*The web application is now accessible at `http://127.0.0.1:5173`.*

---

### Step 4: Login as Super Admin
1. Open your browser and navigate to: `http://127.0.0.1:5173/admin/login`
2. Enter the default administrator credentials:
   - **Email:** `admin@mediclime.com`
   - **Password:** `MediclimeAdmin2026!`
3. Click **Sign In** to access the complete Admin CMS.

---

## 9. Operations & Administrative Workflow Guide

### 9.1. How to Clone & Rebrand the Website (Plug & Play)
To launch a new brand or niche clone:
1. Log in to the Admin Dashboard (`/admin`).
2. Click **Site Settings** on the sidebar navigation (or go to `/admin/settings`).
3. Under the **Brand & Identity** tab:
   - Enter your new **Website Brand Name** (e.g., *NuHealth Labs*).
   - Enter your **Brand Highlight** (the colored text suffix, e.g., *Labs*).
   - Enter your **Brand Tagline** (e.g., *Clinical Nutraceuticals & Evidence*).
   - Paste or upload your **Logo URL** and **Favicon URL**.
4. Under the **Announcement Bar** tab:
   - Toggle the banner on or off and update the promotional message.
5. Under the **Global SEO** tab:
   - Set the default Meta Title, Description, and fallback Meta Keywords.
6. Under the **Contact & Footer** tab:
   - Update support email, phone number, and legal copyright text.
7. Observe the **Live Preview Card** at the top right to verify the look.
8. Click **Save Site Settings**.  
*The entire public website (header, footer, title, meta tags, announcements) immediately updates to your new brand identity.*

---

### 9.2. How to Generate an Article with AI
1. Go to `/admin/ai` in the Admin Panel.
2. Under **AI Article Writer**, enter:
   - **Topic / Headline:** e.g., *Alpha Lipoic Acid for Diabetic Nerve Pain*.
   - **Category:** Select *Nervous Health*.
   - **Primary Keyword:** e.g., *alpha lipoic acid neuropathy*.
   - **Target Word Count:** e.g., *1500*.
3. Click **Generate Article**.
4. The task will be queued and processed in the background. Once completed, click **Open in Editor** to inspect the structured content blocks, verify citations, review the 5–6 generated meta keywords, and click **Publish**.

---

### 9.3. How to Generate or Edit a Supplement Review
1. Go to `/admin/supplements` and click **New Supplement** (or click edit on an existing product).
2. Review the **Supplement Facts Table**: Enter ingredient amounts and Daily Values.
3. Review the **SEO Settings Card**:
   - Ensure the **Meta Keywords (Comma separated)** field has 5–6 relevant keywords.
4. Click **Save Product** or toggle the status to **Published**.
5. Visit the public supplement detail page (`/supplements/[slug]`) to view the pharmaceutical-grade facts table and verify that no raw markdown hashes (`##`) or asterisks (`**`) are visible.

---

## 10. Testing & Quality Assurance Guide

MediClime includes automated regression test suites and full-stack end-to-end verification scripts.

### 10.1. Running the Automated Pytest Suite
The backend test suite validates authentication, public listing, detail pages, draft creation, headless API key auth, and settings updates.

```bash
# Run pytest excluding any broken environment plugins
python -m pytest -p no:seleniumbase backend/tests -v
```

**Expected Result:**
```
============================= test session starts =============================
collected 12 items

backend/tests/test_endpoints.py::test_health_check PASSED               [  8%]
backend/tests/test_endpoints.py::test_auth_login_success PASSED         [ 16%]
backend/tests/test_endpoints.py::test_auth_login_failure PASSED         [ 25%]
backend/tests/test_endpoints.py::test_public_articles_list PASSED       [ 33%]
backend/tests/test_endpoints.py::test_public_article_detail_by_slug PASSED [ 41%]
backend/tests/test_endpoints.py::test_public_products_list PASSED       [ 50%]
backend/tests/test_endpoints.py::test_public_product_detail_by_slug PASSED [ 58%]
backend/tests/test_endpoints.py::test_public_search PASSED              [ 66%]
backend/tests/test_endpoints.py::test_admin_create_article_draft PASSED [ 75%]
backend/tests/test_endpoints.py::test_api_key_integration_auth PASSED  [ 83%]
backend/tests/test_endpoints.py::test_public_settings PASSED           [ 91%]
backend/tests/test_endpoints.py::test_admin_settings_get_and_update PASSED [100%]

============================== 12 passed in 100% ==============================
```

---

### 10.2. Running the Full-Stack Pipeline Verification Script
Run the automated end-to-end verification script against a running backend instance:

```bash
python backend/verify_e2e.py
```

**Verified Checks:**
1. Backend health check.
2. Product detail parsing: Verifies that ProDentim contains 6 valid meta keywords and zero raw `## ` markdown headings in HTML descriptions.
3. Public site settings retrieval.
4. Admin authentication via JWT.
5. Plug & Play Site Settings: Updates brand to *HealthVibe*, confirms immediate public sync, and restores default *Mediclime*.
6. Article detail verification: Confirms populated meta keywords in clinical articles.

---

### 10.3. Validating the Frontend Production Build
To ensure zero JavaScript bundling errors, dead imports, or syntax bugs:

```bash
cd frontend
npm run build
```
*Must complete with exit code 0 and output bundle files inside `frontend/dist`.*

---

## 11. Production Deployment Guide

### 11.1. Ubuntu VPS Deployment with Nginx & Systemd

#### Step 1: System Provisioning & Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 2: Clone Code & Build Frontend
```bash
cd /var/www
sudo git clone https://github.com/your-org/indian-blog-project.git mediclime
cd mediclime
sudo chown -R $USER:$USER /var/www/mediclime

# Setup Frontend
cd frontend
npm install
npm run build
# The production bundle is compiled into /var/www/mediclime/frontend/dist
```

#### Step 3: Configure Python Backend Virtual Environment
```bash
cd /var/www/mediclime
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install gunicorn

# Setup .env file
nano .env
# Paste production environment settings (PostgreSQL connection, Cloudflare R2, Secret Key)

# Run database setup
python backend/clean_and_migrate_db.py
```

#### Step 4: Configure Systemd Daemon for FastAPI
Create the service configuration file:
```bash
sudo nano /etc/systemd/system/mediclime-backend.service
```

Paste the following configuration:
```ini
[Unit]
Description=MediClime FastAPI Application Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mediclime/backend
EnvironmentFile=/var/www/mediclime/.env
ExecStart=/var/www/mediclime/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 127.0.0.1:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mediclime-backend
sudo systemctl start mediclime-backend
sudo systemctl status mediclime-backend
```

#### Step 5: Configure Nginx Reverse Proxy
Create the Nginx server block:
```bash
sudo nano /etc/nginx/sites-available/mediclime
```

Paste the following Nginx configuration:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # Frontend Single Page Application (Static Files)
    location / {
        root /var/www/mediclime/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Media Files (If using local storage provider)
    location /static/ {
        alias /var/www/mediclime/backend/static/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Upload size limits
    client_max_body_size 25M;
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/mediclime /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Install Free SSL Certificate via Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### 11.2. PaaS Deployment (Render, Railway, Supabase)

#### Frontend (Vercel or Netlify)
1. **Root Directory:** `frontend`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Environment Variables:**
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com`
5. **SPA Rewrites (Netlify `_redirects` or Vercel `vercel.json`):**
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

#### Backend (Render / Railway)
1. **Root Directory:** `backend`
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables:** Add all variables from your `.env` file (ensure `DATABASE_URL` points to Supabase/Neon).

---

### 11.3. Cloudflare R2 Storage Configuration
To enable zero-egress asset storage for article hero images and supplement bottles:
1. In Cloudflare Dashboard, navigate to **R2** > **Create bucket** (`mediclime-media`).
2. Go to **Manage R2 API Tokens** > **Create API Token** with **Object Read & Write** permissions.
3. Update your `.env` file:
   ```env
   STORAGE_PROVIDER=s3
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=auto
   S3_BUCKET_NAME=mediclime-media
   S3_ENDPOINT_URL=https://<your_account_id>.r2.cloudflarestorage.com
   ```

---

## 12. Security Hardening & Maintenance

1. **JWT Secret Rotation:** Generate a cryptographically secure 64-character secret key for `SECRET_KEY`:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
2. **CORS Restrictions:** In production, explicitly restrict `CORS_ORIGINS` to your registered domain names. Never use `*` with `allow_credentials=True`.
3. **Content Sanitization (XSS Defense):** All public markdown and rich text content passes through `DOMPurify.sanitize()` on the client side, stripping any injected `<script>`, `onerror`, or `iframe` vectors.
4. **Database Backups:**
   - For Supabase/Neon: Enable automated daily point-in-time recovery (PITR).
   - For custom VPS: Configure a daily cron script executing `pg_dump`:
     ```bash
     pg_dump -U postgres -d mediclime | gzip > /backups/mediclime_$(date +\%Y\%m\%d).sql.gz
     ```

---

## 13. Troubleshooting & Frequently Asked Questions

### Q1: Why does SQLAlchemy throw `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgresql`?
**Solution:** Ensure the connection URI in your `.env` starts with `postgresql+psycopg2://` rather than plain `postgresql://`. The `psycopg2-binary` driver requires this explicit dialect specifier.

### Q2: Why are markdown asterisks (`**`) or hashes (`##`) showing up on supplement pages?
**Solution:** Run the database cleanup script (`python backend/clean_and_migrate_db.py`). The application converts markdown headings directly into clean HTML tags (`<h2>`, `<p>`, `<ul>`) both during AI ingestion and database migration.

### Q3: Why do backend tests fail with an error mentioning `seleniumbase`?
**Solution:** Some developer environments have an incomplete global installation of SeleniumBase. Run tests using the `-p no:seleniumbase` flag:
```bash
python -m pytest -p no:seleniumbase backend/tests
```

### Q4: How do I change the website name, logo, or colors without modifying React code?
**Solution:** Navigate to the `/admin/settings` panel as an administrator. Modify the **Brand Name**, **Tagline**, **Logo URL**, and **Colors**, then click **Save Site Settings**. The reactive `SiteContext` immediately updates the entire website.

### Q5: What should I do if the AI provider returns a 429 Rate Limit error?
**Solution:** In `.env`, change `AI_DEFAULT_PROVIDER` to another configured provider (e.g., switch from `gemini` to `groq` or `openai`), or adjust your rate limits in the provider console. The platform's provider abstraction handles the payload consistently across all vendors.

---

*End of Technical Specification. Document generated for automated Word Document (.docx) conversion.*
