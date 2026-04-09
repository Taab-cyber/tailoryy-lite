# models/portfolio_item.py — Portfolio/lookbook item
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
from app.database import Base


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title         = Column(String(255), nullable=False)
    category      = Column(
        SAEnum("lehenga", "saree", "kurta", "indo_western", "upcycled", "western", name="portfolio_category"),
        nullable=False, index=True
    )
    images        = Column(JSON, default=list)          # list of Cloudinary URLs
    description   = Column(String(1000), nullable=True)
    tags          = Column(JSON, default=list)
    is_featured   = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0)
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    wishlist_items = relationship("WishlistItem", back_populates="portfolio_item")

    def __repr__(self):
        return f"<PortfolioItem {self.title}>"
