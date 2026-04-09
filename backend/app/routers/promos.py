# routers/promos.py — Promo code CRUD (admin) + validate endpoint (public)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.models.promo_code import PromoCode
from app.middleware.auth import get_current_user, require_admin

router = APIRouter()


# ── Pydantic schemas (frontend-compatible field names) ────────────────
class PromoIn(BaseModel):
    code: str
    type: str = "percentage"          # "percentage" | "flat"
    value: float
    min_order_amount: float = 0.0
    max_uses: int = 100
    expiry_date: Optional[str] = None  # ISO date string "YYYY-MM-DD"
    is_active: bool = True
    description: Optional[str] = None


class PromoUpdate(BaseModel):
    code: Optional[str] = None
    type: Optional[str] = None
    value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_uses: Optional[int] = None
    expiry_date: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class PromoOut(BaseModel):
    id: str
    code: str
    type: str
    value: float
    min_order_amount: float
    max_uses: int
    used_count: int
    is_active: bool
    expiry_date: Optional[str] = None
    description: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


def _serialize(p: PromoCode) -> dict:
    """Convert model → frontend-friendly dict."""
    return {
        "id":               p.id,
        "code":             p.code,
        "type":             "percentage" if p.type == "percent" else p.type,
        "value":            p.value,
        "min_order_amount": p.min_order or 0.0,
        "max_uses":         p.max_uses or 0,
        "used_count":       p.times_used or 0,
        "is_active":        p.is_active,
        "expiry_date":      p.expires_at.isoformat() if p.expires_at else None,
        "description":      getattr(p, "description", None),
        "created_at":       p.created_at.isoformat(),
    }


def _parse_expiry(expiry_date: Optional[str]) -> Optional[datetime]:
    if not expiry_date:
        return None
    try:
        return datetime.fromisoformat(expiry_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid expiry_date format. Use YYYY-MM-DD.")


# ── Admin endpoints ────────────────────────────────────────────────────

@router.get("/", response_model=List[dict])
def list_promos(
    db: Session = Depends(get_db),
    _admin = Depends(require_admin),
):
    promos = db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()
    return [_serialize(p) for p in promos]


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_promo(
    payload: PromoIn,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin),
):
    existing = db.query(PromoCode).filter(PromoCode.code == payload.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Promo code already exists")

    db_type = "percent" if payload.type == "percentage" else "flat"
    promo = PromoCode(
        code       = payload.code.upper().strip(),
        type       = db_type,
        value      = payload.value,
        min_order  = payload.min_order_amount,
        max_uses   = payload.max_uses,
        is_active  = payload.is_active,
        expires_at = _parse_expiry(payload.expiry_date),
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return _serialize(promo)


@router.put("/{promo_id}", response_model=dict)
def update_promo(
    promo_id: str,
    payload: PromoUpdate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")

    if payload.code is not None:
        promo.code = payload.code.upper().strip()
    if payload.type is not None:
        promo.type = "percent" if payload.type == "percentage" else payload.type
    if payload.value is not None:
        promo.value = payload.value
    if payload.min_order_amount is not None:
        promo.min_order = payload.min_order_amount
    if payload.max_uses is not None:
        promo.max_uses = payload.max_uses
    if payload.is_active is not None:
        promo.is_active = payload.is_active
    if "expiry_date" in payload.model_fields_set:
        promo.expires_at = _parse_expiry(payload.expiry_date)

    db.commit()
    db.refresh(promo)
    return _serialize(promo)


@router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promo(
    promo_id: str,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    db.delete(promo)
    db.commit()


# ── Public: validate a code at checkout ───────────────────────────────

@router.post("/validate", response_model=dict)
def validate_promo(
    payload: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    code = payload.get("code", "").upper().strip()
    order_amount = float(payload.get("order_amount", 0))

    promo = db.query(PromoCode).filter(
        PromoCode.code == code,
        PromoCode.is_active == True,
    ).first()

    if not promo:
        raise HTTPException(status_code=404, detail="Invalid promo code")

    if promo.expires_at and promo.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Promo code has expired")

    if promo.max_uses > 0 and promo.times_used >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Promo code usage limit reached")

    if promo.min_order and order_amount < promo.min_order:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order amount for this code is ₹{promo.min_order:.0f}"
        )

    if promo.type == "percent":
        discount = round(order_amount * promo.value / 100, 2)
    else:
        discount = min(promo.value, order_amount)

    return {
        "valid":    True,
        "code":     promo.code,
        "type":     "percentage" if promo.type == "percent" else "flat",
        "value":    promo.value,
        "discount": discount,
        "final":    round(order_amount - discount, 2),
    }
