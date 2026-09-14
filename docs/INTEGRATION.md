# External Automation & Python Script Integration Guide

This guide explains how external Python scripts, cron jobs, and CI/CD pipelines automate clinical content creation on Mediclime.

> [!IMPORTANT]
> External automation scripts **never directly connect to the PostgreSQL database**. All creation, validation, and publishing is performed over authenticated REST endpoints via an API Key.

---

## 1. Authentication via API Key

All external integration endpoints require an API Key. You can generate API keys directly in the Mediclime Admin Dashboard under **API Keys** (`/admin/api-keys`).

Keys are prefixed with `med_live_` and use SHA-256 database hashing.

Send the key using either header:
```http
X-API-Key: med_live_demo_test_api_key_2026
```
or
```http
Authorization: Bearer med_live_demo_test_api_key_2026
```

### Granular Key Permissions:
- `article:create` — Submit drafts or trigger generation.
- `article:publish` — Enable `auto_publish: true` for immediate live publishing. If this permission is absent on the key, submitted articles automatically downgrade to `needs_review` or `draft`.
- `ai:generate` — Enqueue AI generation jobs.
- `product:create` — Create supplement fact reviews.

---

## 2. Triggering AI Article Generation via Script

### Request (`POST /api/v1/integrations/articles/generate`)
```json
{
  "title": "Clinical Efficacy of R-Alpha Lipoic Acid in Neuropathy",
  "category": "Nervous Health",
  "primary_keyword": "alpha lipoic acid neuropathy",
  "desired_word_count": 1800,
  "auto_publish": false,
  "idempotency_key": "my-script-job-001"
}
```

### Immediate Response:
```json
{
  "success": true,
  "data": {
    "job_id": "8a7c2b4d-1234-5678-abcd-9876543210ab",
    "status": "queued",
    "message": "AI article generation job queued"
  }
}
```

### Polling Status (`GET /api/v1/ai/jobs/{job_id}`):
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "output_data": {
      "article_id": 42,
      "slug": "clinical-efficacy-of-r-alpha-lipoic-acid-in-neuropathy",
      "title": "Clinical Efficacy of R-Alpha Lipoic Acid in Neuropathy",
      "status": "draft"
    }
  }
}
```

---

## 3. Submitting Pre-Generated Structured Articles

If your external script runs its own custom LLM pipeline, you can push the completed structured JSON directly into Mediclime:

### Request (`POST /api/v1/integrations/articles`)
```json
{
  "title": "Magnesium L-Threonate: Blood-Brain Barrier Transport",
  "subtitle": "Clinical mechanisms of neuro-magnesium on synaptic density",
  "excerpt": "A targeted clinical review of magnesium L-threonate pharmacokinetics.",
  "category_id": 1,
  "status": "draft",
  "executive_summary": [
    {
      "bold": "Cerebrospinal Fluid Penetration:",
      "text": "L-Threonate chelation enables magnesium ions to cross the blood-brain barrier efficiently."
    }
  ],
  "content_blocks": [
    {
      "type": "heading",
      "level": 2,
      "text": "1. Transport Across the Blood-Brain Barrier"
    },
    {
      "type": "paragraph",
      "text": "Magnesium is a critical enzymatic cofactor for synaptic plasticity..."
    },
    {
      "type": "nutrient_card",
      "data": {
        "name": "Magnesium L-Threonate",
        "grade": "Evidence Grade: A-",
        "description": "Crosses the blood-brain barrier to elevate brain CSF magnesium levels.",
        "dosage": "1,000 mg – 2,000 mg daily",
        "mechanism": "Synaptic NMDA Receptor Stabilization"
      }
    }
  ],
  "faqs": [
    {
      "question": "Can this be taken in the morning?",
      "answer": "It is generally taken in the late afternoon or evening."
    }
  ],
  "sources": [
    {
      "title": "Neuron: Enhancement of Learning and Memory by Elevating Brain Magnesium",
      "publisher": "Cell Press",
      "published_date": "2024",
      "url": "https://pubmed.ncbi.nlm.nih.gov"
    }
  ]
}
```

---

## 4. Running the Built-In Python Automation Tool

The repository includes a ready-to-run CLI tool inside `scripts/article_generator/`:

```bash
cd scripts/article_generator
python generate_article.py \
  --title "Bioactive Curcumin and Neuroinflammation" \
  --category "Nervous Health" \
  --keyword "curcumin neuroinflammation" \
  --word-count 1500
```
