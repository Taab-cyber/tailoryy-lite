# models/user.py — User model: customers and admins
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email           = Column(String(255), unique=True, nullable=False, index=True)
    full_name       = Column(String(255), nullable=False)
    phone           = Column(String(20), nullable=True)
    password_hash   = Column(String(255), nullable=True)      # null for social auth
    firebase_uid    = Column(String(128), unique=True, nullable=True, index=True)
    role            = Column(SAEnum("customer", "admin", name="user_role"), default="customer", nullable=False)
    profile_picture = Column(String(500), nullable=True)
    is_active       = Column(Boolean, default=True, nullable=False)
    is_verified     = Column(Boolean, default=False, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders              = relationship("Order", back_populates="customer", foreign_keys="Order.customer_id")
    reviews             = relationship("Review", back_populates="customer")
    wishlist_items      = relationship("WishlistItem", back_populates="customer")
    sent_messages       = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages   = relationship("Message", back_populates="recipient", foreign_keys="Message.recipient_id")
    notifications       = relationship("Notification", back_populates="user")
    conversation        = relationship("Conversation", back_populates="customer", uselist=False)

    def __repr__(self):
        return f"<User {self.email}>"
