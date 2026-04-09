# models/review.py — Customer review for a delivered order
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id    = Column(String(36), ForeignKey("orders.id"), nullable=False, unique=True)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    rating      = Column(Integer, nullable=False)   # 1–5
    comment     = Column(String(2000), nullable=True)
    images      = Column(JSON, default=list)
    is_approved = Column(Boolean, default=False, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    order    = relationship("Order", back_populates="review")
    customer = relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review {self.id} rating={self.rating}>"
