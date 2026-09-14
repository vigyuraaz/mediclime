import os
import time
import httpx
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

# A simple cache to avoid checking the license on every request
_LICENSE_CACHE = {
    "is_active": True,
    "last_checked": 0
}

# 1 hour cache duration
CACHE_TTL_SECONDS = 3600

# The external URL you control that returns JSON: {"status": "active"} or {"status": "suspended"}
# In production, this should be set via environment variable.
LICENSE_VERIFICATION_URL = settings.LICENSE_VERIFICATION_URL

async def verify_license_status() -> bool:
    """Verifies the license status with the remote server."""
    if not LICENSE_VERIFICATION_URL:
        # If no URL is configured, fail open (assume active)
        return True
        
    current_time = time.time()
    
    # Return cached value if within TTL
    if current_time - _LICENSE_CACHE["last_checked"] < CACHE_TTL_SECONDS:
        return _LICENSE_CACHE["is_active"]
        
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(LICENSE_VERIFICATION_URL)
            if response.status_code == 200:
                data = response.json()
                is_active = data.get("status") != "suspended"
                _LICENSE_CACHE["is_active"] = is_active
                _LICENSE_CACHE["last_checked"] = current_time
                return is_active
            else:
                # If the server is unreachable or returns non-200, fail open to avoid accidental downtime
                _LICENSE_CACHE["last_checked"] = current_time
                return True
    except Exception as e:
        # On network failure, fail open
        _LICENSE_CACHE["last_checked"] = current_time
        return True


class LicenseProtectionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude health check from license verification
        if request.url.path.endswith("/health") or request.url.path == "/":
            return await call_next(request)

        # Only check license for API routes
        if request.url.path.startswith(settings.API_V1_PREFIX):
            is_active = await verify_license_status()
            if not is_active:
                return JSONResponse(
                    status_code=402,
                    content={"detail": "Payment Required", "suspended": True, "message": "The application license is suspended. Please contact the administrator."}
                )
                
        response = await call_next(request)
        return response
