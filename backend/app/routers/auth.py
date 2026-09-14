from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserLogin, UserCreate, UserOut, TokenResponse
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=StandardResponse[TokenResponse])
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated"
        )
        
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(subject=str(user.id))
    return StandardResponse(
        data=TokenResponse(
            access_token=token,
            user=UserOut.model_validate(user)
        ),
        message="Login successful"
    )

@router.get("/me", response_model=StandardResponse[UserOut])
def get_current_user_profile(user: User = Depends(get_current_user)):
    return StandardResponse(
        data=UserOut.model_validate(user),
        message="User profile retrieved"
    )

@router.post("/logout", response_model=StandardResponse[dict])
def logout(user: User = Depends(get_current_user)):
    return StandardResponse(data={"logged_out": True}, message="Logged out successfully")
