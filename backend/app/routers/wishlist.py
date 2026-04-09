# routers/wishlist.py — Customer wishlist management
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models.wishlist_item import WishlistItem
from app.models.portfolio_item import PortfolioItem
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
def get_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = (
        db.query(WishlistItem, PortfolioItem)
        .join(PortfolioItem, WishlistItem.portfolio_item_id == PortfolioItem.id)
        .filter(WishlistItem.customer_id == current_user.id)
        .all()
    )
    return [
        {
            "id": wi.id,
            "portfolio_item_id": wi.portfolio_item_id,
            "created_at": wi.created_at,
            "portfolio_item": {
                "id": pi.id, "title": pi.title, "category": pi.category,
                "images": pi.images, "tags": pi.tags,
            },
        }
        for wi, pi in items
    ]


@router.post("/{portfolio_item_id}", status_code=201)
def add_to_wishlist(portfolio_item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(PortfolioItem).filter(PortfolioItem.id == portfolio_item_id).first():
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    if db.query(WishlistItem).filter(
        WishlistItem.customer_id == current_user.id,
        WishlistItem.portfolio_item_id == portfolio_item_id,
    ).first():
        raise HTTPException(status_code=400, detail="Already in wishlist")
    item = WishlistItem(id=str(uuid.uuid4()), customer_id=current_user.id, portfolio_item_id=portfolio_item_id)
    db.add(item)
    db.commit()
    return {"message": "Added to wishlist"}


@router.delete("/{portfolio_item_id}")
def remove_from_wishlist(portfolio_item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(WishlistItem).filter(
        WishlistItem.customer_id == current_user.id,
        WishlistItem.portfolio_item_id == portfolio_item_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not in wishlist")
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}
