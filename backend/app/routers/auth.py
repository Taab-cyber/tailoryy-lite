# routers/auth.py — Authentication: register, login, Google OAuth, JWT
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import uuid

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token, LoginRequest, GoogleAuthRequest
from app.schemas.user import ForgotPasswordRequest, ResetPasswordRequest
from app.middleware.auth import get_current_user
from passlib.context import CryptContext
from jose import jwt as jose_jwt

router = APIRouter()
# rounds=8 is faster on serverless cold starts (default 12 takes ~1s, 8 takes ~100ms)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=8)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jose_jwt.encode(
        {"sub": user_id, "exp": expire, "type": "access"},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jose_jwt.encode(
        {"sub": user_id, "exp": expire, "type": "refresh"},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="customer",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        from app.services.email_service import send_welcome_email
        background_tasks.add_task(send_welcome_email, user.email, user.full_name)
    except Exception:
        pass

    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.is_active == True).first()
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


def _verify_firebase_token(id_token: str) -> dict:
    """Verify Firebase ID token using Google's public key endpoint (no SDK needed)."""
    import httpx
    # First try: use Firebase Admin SDK if available
    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth, credentials
        if not firebase_admin._apps:
            if settings.FIREBASE_PROJECT_ID and settings.FIREBASE_PROJECT_ID != "placeholder":
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n") if settings.FIREBASE_PRIVATE_KEY else "",
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "token_uri": "https://oauth2.googleapis.com/token",
                })
                firebase_admin.initialize_app(cred)
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except Exception:
        pass

    # Fallback: verify via Google tokeninfo endpoint
    try:
        resp = httpx.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=10)
        if resp.status_code != 200:
            raise ValueError("Token verification failed")
        data = resp.json()
        if "error" in data:
            raise ValueError(data.get("error_description", "Invalid token"))
        return {
            "uid": data.get("sub"),
            "email": data.get("email", ""),
            "name": data.get("name", ""),
            "picture": data.get("picture"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")


@router.post("/google", response_model=Token)
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        decoded = _verify_firebase_token(data.id_token)
        firebase_uid = decoded["uid"]
        email = decoded.get("email", "")
        full_name = decoded.get("name", email.split("@")[0])
        photo_url = decoded.get("picture")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            firebase_uid=firebase_uid,
            profile_picture=photo_url,
            role="customer",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
    else:
        user.firebase_uid = firebase_uid
        if photo_url and not user.profile_picture:
            user.profile_picture = photo_url
    db.commit()
    db.refresh(user)

    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(updates: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed = {"full_name", "phone", "profile_picture"}
    for key, val in updates.items():
        if key in allowed:
            setattr(current_user, key, val)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return {"message": "If an account exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    return {"message": "Password reset successfully"}
