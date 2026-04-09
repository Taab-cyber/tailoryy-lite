# models/notification.py — In-app notification for users
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id    = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    type       = Column(String(50), nullable=False)   # e.g. order_update, message, review
    title      = Column(String(255), nullable=False)
    message    = Column(Text, nullable=True)
    is_read    = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.type} user={self.user_id}>"
