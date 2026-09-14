import os
import uuid
import shutil
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image
from app.core.config import settings

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    boto3 = None

ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"
}

class StorageService:
    def __init__(self):
        self.provider = settings.STORAGE_PROVIDER
        self.upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        os.makedirs(self.upload_dir, exist_ok=True)
        
        self.s3_client = None
        if self.provider == "s3" and boto3:
            # Configure boto3 for S3 / Cloudflare R2
            kwargs = {
                "service_name": "s3",
                "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
                "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
                "region_name": settings.AWS_REGION
            }
            if settings.AWS_ENDPOINT_URL_S3:
                kwargs["endpoint_url"] = settings.AWS_ENDPOINT_URL_S3
                
            self.s3_client = boto3.client(**kwargs)

    async def upload_file(self, file: UploadFile, subfolder: str = "media") -> Tuple[str, str, int, Optional[int], Optional[int]]:
        """
        Saves an uploaded file to storage.
        Returns: (storage_key, public_url, file_size_bytes, width, height)
        """
        # Validate MIME type
        content_type = file.content_type or "application/octet-stream"
        if content_type not in ALLOWED_IMAGE_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {content_type}. Allowed: {', '.join(ALLOWED_IMAGE_MIME_TYPES)}"
            )

        # Generate unique storage filename
        ext = os.path.splitext(file.filename or "")[1].lower()
        if not ext:
            ext = ".jpg" if "jpeg" in content_type else ".png"
            
        unique_name = f"{uuid.uuid4().hex}{ext}"
        storage_key = f"{subfolder}/{unique_name}".replace("\\", "/")
        
        target_folder = os.path.join(self.upload_dir, subfolder)
        os.makedirs(target_folder, exist_ok=True)
        file_path = os.path.join(self.upload_dir, storage_key.replace("/", os.sep))

        # Save to local disk first (to get dimensions and fallback)
        size = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                size += len(chunk)
                if size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=400,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
                    )
                buffer.write(chunk)

        # Extract dimensions if image
        width, height = None, None
        try:
            with Image.open(file_path) as img:
                width, height = img.size
        except Exception:
            pass

        public_url = f"{settings.STORAGE_BASE_URL}/{storage_key}"

        # If S3/R2 is configured, upload it
        if self.provider == "s3" and self.s3_client:
            try:
                self.s3_client.upload_file(
                    file_path, 
                    settings.S3_BUCKET_NAME, 
                    storage_key,
                    ExtraArgs={'ContentType': content_type}
                )
                
                # Use public URL logic based on endpoint (R2 usually has a custom domain or we can return a signed URL)
                # For R2 without a custom public domain, we might need to rely on backend proxy, or format the URL.
                # Usually we want a public bucket url:
                if settings.S3_PUBLIC_DOMAIN:
                    public_url = f"{settings.S3_PUBLIC_DOMAIN.rstrip('/')}/{storage_key}"
                elif settings.AWS_ENDPOINT_URL_S3:
                    # Generic R2 public URL fallback, assume endpoint_url/bucket/key if no CDN domain is configured
                    public_url = f"{settings.AWS_ENDPOINT_URL_S3}/{settings.S3_BUCKET_NAME}/{storage_key}"
                else:
                    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{storage_key}"
                    
                # Optionally delete local file to save space
                try:
                    os.remove(file_path)
                except Exception:
                    pass
            except ClientError as e:
                print(f"Error uploading to S3/R2: {e}")
                # Fallback to local if S3 fails or return error
                raise HTTPException(status_code=500, detail="Failed to upload file to cloud storage")
            
        return storage_key, public_url, size, width, height

    def delete_file(self, storage_key: str) -> bool:
        """Deletes a file from storage."""
        if self.provider == "s3" and self.s3_client:
             try:
                 self.s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=storage_key)
                 return True
             except ClientError as e:
                 print(f"Error deleting from S3/R2: {e}")
                 return False
                 
        file_path = os.path.join(self.upload_dir, storage_key.replace("/", os.sep))
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                return True
            except Exception:
                return False
        return False

storage_service = StorageService()
