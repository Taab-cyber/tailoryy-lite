# routers/users.py — User profile, measurements, addresses (admin + self)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.middleware.auth import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(User).filter(User.role == "customer").offset(skip).limit(limit).all()


@router.get("/me/measurements")
def get_my_measurements(current_user: User = Depends(get_current_user)):
    return {"measurements": {}}


@router.put("/me/measurements")
def save_measurements(data: dict, current_user: User = Depends(get_current_user)):
    # In a full implementation save to a dedicated measurements table
    return {"message": "Measurements saved", "data": data}


@router.get("/me/addresses")
def get_addresses(current_user: User = Depends(get_current_user)):
    return {"addresses": []}


@router.put("/me/addresses")
def save_address(data: dict, current_user: User = Depends(get_current_user)):
    return {"message": "Address saved"}


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(current_user, key, val)
    db.commit()
    db.refresh(current_user)
    return current_user
