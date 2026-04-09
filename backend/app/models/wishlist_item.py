# models/wishlist_item.py — Customer wishlist entry
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id                = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id       = Column(String(36), ForeignKey("users.id"), nullable=False)
    portfolio_item_id = Column(String(36), ForeignKey("portfolio_items.id"), nullable=False)
    created_at        = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("customer_id", "portfolio_item_id", name="uq_wishlist_customer_item"),
    )

    customer       = relationship("User", back_populates="wishlist_items")
    portfolio_item = relationship("PortfolioItem", back_populates="wishlist_items")

    def __repr__(self):
        return f"<WishlistItem customer={self.customer_id}>"
