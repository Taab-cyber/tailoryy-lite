# models/message.py — In-app DM message between customer and admin
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum as SAEnum, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id           = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id    = Column(String(36), ForeignKey("users.id"), nullable=False)
    recipient_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content      = Column(Text, nullable=False)
    is_read      = Column(Boolean, default=False, nullable=False)
    message_type = Column(SAEnum("text", "image", name="message_type"), default="text")
    image_url    = Column(String(500), nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow, nullable=False)

    sender    = relationship("User", back_populates="sent_messages",     foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="received_messages", foreign_keys=[recipient_id])

    __table_args__ = (
        Index("ix_messages_sender_recipient_created", "sender_id", "recipient_id", "created_at"),
    )

    def __repr__(self):
        return f"<Message {self.id}>"
