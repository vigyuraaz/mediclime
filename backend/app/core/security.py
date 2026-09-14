import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    try:
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generate a secure bcrypt hash for a plain password."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_api_key(prefix: str = "med") -> tuple[str, str, str]:
    """
    Generates a secure API key.
    Returns (raw_key, key_hash, prefix_display)
    Example raw_key: med_live_ab12cd34...
    """
    entropy = secrets.token_urlsafe(32)
    raw_key = f"{prefix}_live_{entropy}"
    key_hash = hash_api_key(raw_key)
    prefix_display = f"{raw_key[:12]}...{raw_key[-4:]}"
    return raw_key, key_hash, prefix_display

def hash_api_key(key: str) -> str:
    """Hash an API key using SHA-256 for database storage."""
    return hashlib.sha256(key.encode('utf-8')).hexdigest()
