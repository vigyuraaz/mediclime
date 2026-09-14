# Setup Guide: PostgreSQL & Cloudflare R2

This guide explains how to get the necessary credentials to configure your `.env` file for a production PostgreSQL database and Cloudflare R2 (S3-compatible) media storage.

---

## 1. Setting up PostgreSQL

You can use any PostgreSQL provider. **Neon** and **Supabase** are two of the easiest ways to get a free, managed cloud Postgres database.

### Option A: Using Neon (Recommended)
1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Click **Create Project**.
3. Name your project (e.g., `mediclime-db`) and select a region close to your users.
4. Once created, the dashboard will show a connection string. It looks like:
   `postgresql://<user>:<password>@<host>/<database_name>?sslmode=require`
5. In your `.env` file, set `DATABASE_URL`. Make sure to change the protocol from `postgresql://` to `postgresql+psycopg2://`:
   ```env
   DATABASE_URL=postgresql+psycopg2://<user>:<password>@<host>/<database_name>?sslmode=require
   ```

### Option B: Using Supabase
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In your project, go to **Project Settings** (gear icon) > **Database**.
3. Scroll down to find the **Connection string** (URI tab).
4. Replace `[YOUR-PASSWORD]` with the database password you chose during setup.
5. In your `.env` file, set `DATABASE_URL`. Again, ensure you use the `postgresql+psycopg2` driver:
   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:<password>@db.<your-project>.supabase.co:5432/postgres
   ```

---

## 2. Setting up Cloudflare R2 (Media Storage)

Cloudflare R2 provides an S3-compatible API, which works perfectly with the app's `STORAGE_PROVIDER=s3` option. It's often cheaper than AWS S3 and has zero egress fees.

### Step 1: Create an R2 Bucket
1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. On the left sidebar, click **R2**. (You may need to enable a billing plan to start using R2, but the free tier is very generous).
3. Click **Create bucket**.
4. Name your bucket (e.g., `mediclime-media`) and click **Create**.

### Step 2: Get the S3 Credentials
1. Back on the main R2 dashboard, look at the right side of the screen and click **Manage R2 API Tokens**.
2. Click **Create API token**.
3. Give it a descriptive name (e.g., `Mediclime Access`).
4. Under **Permissions**, select **Object Read & Write**.
5. Click **Create API Token**.

You will now be shown your credentials. **Copy them immediately**, as you will not be able to see the Secret Access Key again:
- **Access Key ID**
- **Secret Access Key**
- **Jurisdiction-specific endpoint** (Looks like `https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com`)

### Step 3: Configure your `.env` file
Open your `.env` file and update the Storage Configuration section with your new Cloudflare R2 credentials:

```env
# Change from 'local' to 's3'
STORAGE_PROVIDER=s3

# Your Cloudflare R2 API Token Credentials
AWS_ACCESS_KEY_ID=<Your_Access_Key_ID>
AWS_SECRET_ACCESS_KEY=<Your_Secret_Access_Key>

# Cloudflare R2 typically uses 'auto' or 'us-east-1' for region
AWS_REGION=auto

# The name of the bucket you created in Step 1
S3_BUCKET_NAME=mediclime-media

# IMPORTANT FOR CLOUDFLARE R2:
# You will likely need to specify your custom endpoint URL so the AWS S3 SDK (boto3) knows to talk to Cloudflare instead of AWS.
S3_ENDPOINT_URL=https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com
```

### Developer Note: Modifying the Backend for Cloudflare R2
Since Cloudflare R2 uses a custom endpoint URL (`https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com`), you may need to ensure your backend Python code explicitly passes the `endpoint_url` when initializing the `boto3` S3 client.

In the file where S3 is configured (usually `backend/app/services/storage.py` or similar), make sure it looks somewhat like this:

```python
import boto3

s3_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT_URL, # <--- Make sure this is passed
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)
```
