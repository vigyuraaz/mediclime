# Mediclime Platform — REST API Reference (`/api/v1`)

The Mediclime API provides structured, evidence-based medical content, third-party lab-verified supplement data, and editorial management endpoints.

Base URL: `http://localhost:8000/api/v1` (Development) or your production domain.

---

## 🔐 Authentication

### User JWT Authentication
Include the JWT token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

- `POST /api/v1/auth/login` — Authenticate user and receive JWT.
  ```json
  {
    "email": "admin@mediclime.com",
    "password": "MediclimeAdmin2026!"
  }
  ```
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile.
- `POST /api/v1/auth/logout` — Revoke active session.

### API Key Authentication (For External Automation & Scripts)
Pass the key either as a Bearer token or in the `X-API-Key` header:
```http
X-API-Key: med_live_demo_test_api_key_2026
```
or
```http
Authorization: Bearer med_live_demo_test_api_key_2026
```

---

## 🌐 Public Endpoints (Cached, Publicly Accessible)

### 1. Articles
- `GET /api/v1/public/articles`
  - Query parameters: `page`, `page_size`, `category_id`, `search`, `is_featured`
  - Returns: Paginated list of published articles.
- `GET /api/v1/public/articles/{slug}`
  - Returns: Complete structured article including `content_blocks`, `executive_summary`, `faqs`, `sources`, and reviewer bylines.

### 2. Supplements & Products
- `GET /api/v1/public/products`
  - Query parameters: `page`, `page_size`, `category_id`, `brand`, `search`
- `GET /api/v1/public/products/{slug}`
  - Returns: Detailed product analysis including `supplement_facts`, `benefits`, `ingredients`, and `highlight_badges`.

### 3. Health Condition Hubs
- `GET /api/v1/public/conditions` — Returns all condition hubs.
- `GET /api/v1/public/conditions/{slug}` — Returns condition symptoms, causes, diagnosis, and treatments.

### 4. Medical Advisory Board
- `GET /api/v1/public/authors` — List all credentialed physicians and reviewers.
- `GET /api/v1/public/authors/{slug}` — Physician credentials, hospital affiliations, and bio.

### 5. Multi-Entity Search
- `GET /api/v1/public/search?q={query}`
  - Searches simultaneously across articles, supplements, conditions, and authors.

### 6. Newsletter & Contact
- `POST /api/v1/public/newsletter/subscribe` (`{ "email": "..." }`)
- `POST /api/v1/public/contact` (`{ "name": "...", "email": "...", "subject": "...", "message": "..." }`)

---

## 🛠️ Admin CMS Endpoints (Role Protected)

- `GET /api/v1/admin/overview/stats` — Content and database metric counters.
- `GET /api/v1/admin/articles` — Manage all articles across all statuses.
- `POST /api/v1/admin/articles` — Create article draft with structured blocks.
- `PUT /api/v1/admin/articles/{id}` — Update article metadata and blocks.
- `POST /api/v1/admin/articles/{id}/publish` — Set article to live published.
- `POST /api/v1/admin/articles/{id}/unpublish` — Revert article to draft.
- `DELETE /api/v1/admin/articles/{id}` — Delete article.
- `GET /api/v1/admin/products` & `POST /api/v1/admin/products` — Manage supplements.
- `GET /api/v1/admin/api-keys` & `POST /api/v1/admin/api-keys` — Generate external script keys.
- `GET /api/v1/media` & `POST /api/v1/media` — Upload and list media assets.

---

## 🤖 AI Content Engine Endpoints

- `POST /api/v1/ai/articles/generate`
  - Enqueues background generation task using configured AI provider (Gemini / OpenAI / Mock).
  - Returns: `{ "job_id": "...", "status": "queued" }`.
- `GET /api/v1/ai/jobs/{job_id}`
  - Polls job status (`queued`, `processing`, `completed`, `failed`).
  - Upon completion, contains the structured article draft ID and slug.
- `GET /api/v1/ai/settings` & `PUT /api/v1/ai/settings` — Configure models and keys.

---

## 🐍 External Automation Endpoints

- `POST /api/v1/integrations/articles/generate`
  - Authenticated via API Key (`ai:generate` permission).
  - Triggers asynchronous article generation.
- `POST /api/v1/integrations/articles`
  - Authenticated via API Key (`article:create` permission).
  - Submits pre-formatted structured article JSON. If the key has `article:publish`, publishes immediately; otherwise saves as `needs_review`.
