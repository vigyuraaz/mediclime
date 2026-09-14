# Mediclime Platform — Deployment & Production Guide

This document explains how to deploy the Mediclime React Frontend and FastAPI Backend to production environments, including **Vercel**, **PostgreSQL**, and **AWS S3**.

---

## 1. Local Development Quickstart

### Start the FastAPI Backend:
```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Seed initial data (Admin user, categories, Arialief, Neuropathy article, test API key)
python seed_data.py

# 3. Start server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running on `http://localhost:8000`.
Interactive Swagger docs available at `http://localhost:8000/docs`.

### Start the React Frontend:
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Frontend development server will open on `http://localhost:5173`.
Admin CMS available at `http://localhost:5173/admin` (Default login: `admin@mediclime.com` / `MediclimeAdmin2026!`).

---

## 2. PostgreSQL Production Configuration

In production, supply your PostgreSQL connection string in the `DATABASE_URL` environment variable:
```env
DATABASE_URL=postgresql+psycopg2://<user>:<password>@<host>:5432/<database_name>
```

Run Alembic database migrations:
```bash
cd backend
alembic upgrade head
```

---

## 3. Vercel Deployment

The architecture is explicitly designed for Vercel deployment:

### Deploying the Frontend:
1. Link your GitHub repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `dist`.
5. Add Environment Variable:
   ```env
   VITE_API_URL=https://your-backend-api-domain.com/api/v1
   ```

### Deploying the FastAPI Backend (Vercel Serverless / ASGI):
1. In the backend directory, add `api/index.py`:
   ```python
   from app.main import app
   ```
2. Configure `vercel.json`:
   ```json
   {
     "builds": [
       { "src": "api/index.py", "use": "@vercel/python" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "api/index.py" }
     ]
   }
   ```
3. Set environment variables in Vercel project settings:
   - `DATABASE_URL` (Supabase, Neon, or RDS PostgreSQL)
   - `SECRET_KEY` (Strong random JWT secret)
   - `GEMINI_API_KEY` or `OPENAI_API_KEY`
   - `INTERNAL_CRON_SECRET`

---

## 4. Scheduled Publishing with Vercel Cron

Mediclime supports scheduled publishing without requiring a persistent server worker process. Configure `vercel.json` to trigger the publication endpoint every 15 minutes:

```json
{
  "crons": [
    {
      "path": "/api/v1/internal/publishing/process-scheduled",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Include the `X-Cron-Secret` header matching your `INTERNAL_CRON_SECRET` environment variable.

---

## 5. Media & S3 Object Storage

In production, set:
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=mediclime-media
```
The `StorageService` automatically pipes uploaded files to your S3 bucket or CDN, ensuring serverless instances do not write to local ephemeral disk storage.
