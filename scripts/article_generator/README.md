# Mediclime External Python Automation Scripts

This directory contains standalone Python CLI tools and an API client SDK for integrating external content pipelines, cron jobs, and CI/CD workflows with the Mediclime Medical Publishing platform.

> [!IMPORTANT]
> The external automation script **never directly accesses the PostgreSQL database**. All operations communicate through authenticated, permission-checked REST API endpoints using an API Key.

---

## 🛠️ Setup & Requirements

Ensure Python 3.10+ and `requests` are installed:
```bash
pip install requests
```

Set your API Key as an environment variable or pass it via `--api-key`:
```bash
# Windows PowerShell
$env:MEDICLIME_API_KEY="med_live_demo_test_api_key_2026"
$env:MEDICLIME_API_URL="http://localhost:8000"

# Linux / macOS
export MEDICLIME_API_KEY="med_live_demo_test_api_key_2026"
export MEDICLIME_API_URL="http://localhost:8000"
```

---

## 🚀 CLI Commands

### 1. Generate an Evidence-Based Clinical Article via AI
```bash
python generate_article.py \
  --title "Evidence-Based Magnesium Glycinate for Peripheral Neuropathy" \
  --category "Nervous Health" \
  --keyword "magnesium neuropathy" \
  --word-count 1800
```

#### Available CLI Flags:
- `--title` (Required): Headline of the clinical guide
- `--category` (Default: `Nervous Health`): Target category
- `--keyword`: Primary SEO focus keyword
- `--word-count` (Default: `1500`): Target word count
- `--auto-publish`: If set, requests immediate publication (requires `article:publish` API Key permission)
- `--no-poll`: Enqueues the job and exits immediately without waiting for generation
- `--api-url`: Custom backend host (default: `http://localhost:8000`)
- `--api-key`: API key override

---

### 2. Submit a Pre-Generated Structured Article
```bash
python publish_article.py --file example_article.json --publish
```

---

## 🐍 Using the Python Client in Your Own Scripts

```python
from client import MediclimeClient

client = MediclimeClient(
    api_url="http://localhost:8000",
    api_key="med_live_demo_test_api_key_2026"
)

# 1. Enqueue generation job
result = client.generate_article(
    title="Optimizing Mitochondrial Biogenesis in Peripheral Nerves",
    category="Cellular Nutrition",
    primary_keyword="mitochondrial biogenesis nerves",
    desired_word_count=2000
)

job_id = result["data"]["job_id"]
print(f"Job queued: {job_id}")

# 2. Poll until completed
completed_job = client.poll_job(job_id)
print("Article Created:", completed_job["output_data"])
```
