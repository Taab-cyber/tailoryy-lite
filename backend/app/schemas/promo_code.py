# schemas/promo_code.py — Pydantic schemas for PromoCode
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PromoCodeCreate(BaseModel):
    code: str
    type: str = "percent"
    value: float
    min_order: float = 0.0
    max_uses: int = 0
    expires_at: Optional[datetime] = None


class PromoCodeOut(BaseModel):
    id: str
    code: str
    type: str
    value: float
    min_order: float
    max_uses: int
    times_used: int
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
