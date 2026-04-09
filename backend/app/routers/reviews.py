# routers/reviews.py — Customer reviews with admin approval workflow
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if db.query(Review).filter(Review.order_id == data.order_id).first():
        raise HTTPException(status_code=400, detail="Review already exists for this order")
    review = Review(id=str(uuid.uuid4()), customer_id=current_user.id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/", response_model=List[ReviewOut])
def list_approved_reviews(db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.is_approved == True).order_by(Review.created_at.desc()).all()


@router.get("/admin", response_model=List[ReviewOut])
def list_all_reviews(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.put("/{review_id}/approve")
def approve_review(review_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Not found")
    review.is_approved = True
    db.commit()
    return {"message": "Review approved"}


@router.delete("/{review_id}")
def delete_review(review_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(review)
    db.commit()
    return {"message": "Deleted"}
