import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.core.config import settings
from app.services.storage_service import storage_service
from sqlalchemy import text

def test_db():
    print("Testing Database connection...")
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).scalar()
        if result == 1:
            print(f"DB_CONNECTED: YES (URL: {settings.DATABASE_URL})")
        else:
            print("DB_CONNECTED: UNKNOWN_RESULT")
    except Exception as e:
        print(f"DB_CONNECTED: FAILED\n{e}")
    finally:
        db.close()

def test_s3():
    print("\nTesting S3/Cloudflare R2 connection...")
    try:
        if storage_service.provider == "s3" and storage_service.s3_client:
            # Try to list objects to actually make a network request
            storage_service.s3_client.list_objects_v2(Bucket=settings.S3_BUCKET_NAME, MaxKeys=1)
            print(f"S3_CONNECTED: YES (Bucket: {settings.S3_BUCKET_NAME}, Endpoint: {settings.AWS_ENDPOINT_URL_S3})")
        else:
            print(f"S3_CONNECTED: NO (Provider: {storage_service.provider}, Client exists: {storage_service.s3_client is not None})")
    except Exception as e:
        print(f"S3_CONNECTED: FAILED\n{e}")

if __name__ == "__main__":
    test_db()
    test_s3()
