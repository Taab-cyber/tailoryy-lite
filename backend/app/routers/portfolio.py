# routers/portfolio.py — Portfolio items CRUD
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.models.portfolio_item import PortfolioItem
from app.schemas.portfolio import PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemOut
from app.middleware.auth import require_admin

router = APIRouter()


@router.get("/featured", response_model=List[PortfolioItemOut])
def get_featured(db: Session = Depends(get_db)):
    return (
        db.query(PortfolioItem)
        .filter(PortfolioItem.is_featured == True)
        .order_by(PortfolioItem.display_order)
        .limit(12)
        .all()
    )


@router.get("/", response_model=List[PortfolioItemOut])
def list_portfolio(
    category: Optional[str] = None,
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(PortfolioItem)
    if category:
        query = query.filter(PortfolioItem.category == category)
    return query.order_by(PortfolioItem.display_order, PortfolioItem.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{item_id}", response_model=PortfolioItemOut)
def get_portfolio_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return item


@router.post("/", response_model=PortfolioItemOut, status_code=201)
def create_portfolio_item(data: PortfolioItemCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = PortfolioItem(id=str(uuid.uuid4()), **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=PortfolioItemOut)
def update_portfolio_item(item_id: str, data: PortfolioItemUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in data.model_dump(exclude_none=True).items():
        setattr(item, key, val)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_portfolio_item(item_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
