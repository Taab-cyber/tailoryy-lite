# schemas/review.py — Pydantic schemas for Review model
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReviewCreate(BaseModel):
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    images: List[str] = []


class ReviewOut(BaseModel):
    id: str
    order_id: str
    customer_id: str
    rating: int
    comment: Optional[str] = None
    images: List[str] = []
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
