# schemas/message.py — Pydantic schemas for Message and Conversation
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"
    image_url: Optional[str] = None


class MessageOut(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    is_read: bool
    message_type: str
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    customer_id: str
    last_message_at: datetime
    unread_count_admin: int
    unread_count_customer: int
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(BaseModel):
    conversation: ConversationOut
    messages: List[MessageOut]
