from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token, hash_api_key
from app.models.user import User
from app.models.api_key import ApiKey

security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload["sub"]
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
        
    user = db.query(User).filter(User.id == user_id_int).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
        
    return user

def require_permission(permission: str):
    """Dependency factory that checks if current user or API key has the required permission."""
    def permission_checker(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
        x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
        db: Session = Depends(get_db)
    ):
        # 1. Check if provided as an API key via header or Bearer prefix
        raw_key = x_api_key
        if not raw_key and credentials and credentials.credentials.startswith("med_live_"):
            raw_key = credentials.credentials

        if raw_key:
            key_hash = hash_api_key(raw_key)
            api_key = db.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.is_active == True).first()
            if not api_key:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or revoked API key")
            if not api_key.has_permission(permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"API Key missing required permission: '{permission}'"
                )
            return api_key

        # 2. Otherwise check user JWT
        if not credentials:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials required")
            
        user = get_current_user(credentials, db)
        if not user.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User missing required permission: '{permission}'"
            )
        return user

    return permission_checker
