# models/conversation.py — One conversation thread per customer with admin
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id                    = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id           = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    last_message_at       = Column(DateTime, default=datetime.utcnow, nullable=False)
    unread_count_admin    = Column(Integer, default=0)
    unread_count_customer = Column(Integer, default=0)
    created_at            = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("User", back_populates="conversation")

    def __repr__(self):
        return f"<Conversation customer={self.customer_id}>"
