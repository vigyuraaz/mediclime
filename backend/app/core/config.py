import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "Mediclime Medical Publishing Platform"
    API_V1_PREFIX: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = "dev_secret_key_change_in_production_mediclime_jwt_auth_token_secret_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./mediclime.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "https://*.vercel.app"
    ]
    
    # Storage
    STORAGE_PROVIDER: str = "local"  # "local", "s3", "vercel_blob"
    UPLOAD_DIR: str = "./uploads"
    STORAGE_BASE_URL: str = "/api/v1/media/files"
    MAX_UPLOAD_SIZE_MB: int = 15
    
    # AI Providers
    DEFAULT_AI_PROVIDER: str = "groq"  # "groq", "gemini", or "openai"
    DEFAULT_TEXT_MODEL: str = "openai/gpt-oss-120b"
    DEFAULT_IMAGE_PROVIDER: str = "none"  # "gemini", "openai", "none"
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # S3 Storage (optional)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_ENDPOINT_URL_S3: str = ""
    S3_BUCKET_NAME: str = "mediclime-media"
    S3_PUBLIC_DOMAIN: str = ""
    
    # Internal Cron / Worker Secret
    INTERNAL_CRON_SECRET: str = "mediclime_cron_secret_worker_auth_key_2026"
    
    # Initial Admin
    INITIAL_ADMIN_EMAIL: str = "admin@mediclime.com"
    INITIAL_ADMIN_PASSWORD: str = "MediclimeAdmin2026!"
    INITIAL_ADMIN_NAME: str = "Mediclime Super Admin"
    
    LICENSE_VERIFICATION_URL: str = ""

    class Config:
        env_file = [".env", "../.env"]
        extra = "ignore"

settings = Settings()
