# routers/messages.py — In-app DM system: one thread per customer with admin
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timedelta

from app.database import get_db
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.message import MessageCreate
from app.middleware.auth import get_current_user, require_admin

router = APIRouter()


def _get_admin(db: Session) -> User:
    return db.query(User).filter(User.role == "admin").first()


def _get_or_create_conversation(customer_id: str, db: Session) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.customer_id == customer_id).first()
    if not conv:
        conv = Conversation(id=str(uuid.uuid4()), customer_id=customer_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv


def _thread_messages(customer_id: str, admin_id: str, db: Session):
    return (
        db.query(Message)
        .filter(
            ((Message.sender_id == customer_id) & (Message.recipient_id == admin_id))
            | ((Message.sender_id == admin_id) & (Message.recipient_id == customer_id))
        )
        .order_by(Message.created_at.asc())
        .all()
    )


@router.get("/my-conversation")
def get_my_conversation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conv  = _get_or_create_conversation(current_user.id, db)
    admin = _get_admin(db)
    messages = _thread_messages(current_user.id, admin.id, db) if admin else []
    return {"conversation": conv, "messages": messages}


@router.post("/")
def send_message(data: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin = _get_admin(db)
    if not admin:
        raise HTTPException(status_code=503, detail="Admin unavailable")

    conv = _get_or_create_conversation(current_user.id, db)

    # Check if first message in 24h for email trigger
    cutoff   = datetime.utcnow() - timedelta(hours=24)
    recent   = db.query(Message).filter(Message.sender_id == current_user.id, Message.created_at > cutoff).first()

    msg = Message(
        id=str(uuid.uuid4()),
        sender_id=current_user.id,
        recipient_id=admin.id,
        content=data.content,
        message_type=data.message_type,
        image_url=data.image_url,
    )
    db.add(msg)
    conv.last_message_at     = datetime.utcnow()
    conv.unread_count_admin += 1
    db.commit()
    db.refresh(msg)

    if not recent:
        try:
            from app.services.email_service import send_new_message_notification_admin
            send_new_message_notification_admin(current_user.full_name, current_user.email, data.content)
        except Exception:
            pass

    return msg


@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db), _=Depends(require_admin)):
    convs  = db.query(Conversation).order_by(Conversation.last_message_at.desc()).all()
    admin  = _get_admin(db)
    result = []
    for conv in convs:
        customer = db.query(User).filter(User.id == conv.customer_id).first()
        last_msg = None
        if admin:
            last_msg = (
                db.query(Message)
                .filter(
                    ((Message.sender_id == conv.customer_id) & (Message.recipient_id == admin.id))
                    | ((Message.sender_id == admin.id) & (Message.recipient_id == conv.customer_id))
                )
                .order_by(Message.created_at.desc())
                .first()
            )
        result.append({
            "conversation": conv,
            "customer": customer,
            "last_message": last_msg.content[:80] if last_msg else "",
        })
    return result


@router.get("/conversations/{customer_id}")
def get_conversation(customer_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    admin    = _get_admin(db)
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    conv     = _get_or_create_conversation(customer_id, db)
    messages = _thread_messages(customer_id, admin.id if admin else "", db)
    return {"conversation": conv, "customer": customer, "messages": messages}


@router.post("/conversations/{customer_id}/reply")
def admin_reply(customer_id: str, data: MessageCreate, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    msg = Message(
        id=str(uuid.uuid4()),
        sender_id=current_admin.id,
        recipient_id=customer_id,
        content=data.content,
        message_type=data.message_type,
    )
    db.add(msg)
    conv = _get_or_create_conversation(customer_id, db)
    conv.last_message_at         = datetime.utcnow()
    conv.unread_count_customer  += 1
    db.commit()
    db.refresh(msg)

    try:
        from app.services.email_service import send_new_message_notification_customer
        send_new_message_notification_customer(customer.email, customer.full_name, data.content)
    except Exception:
        pass

    return msg


@router.put("/conversations/{customer_id}/read")
def mark_read_admin(customer_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    conv = db.query(Conversation).filter(Conversation.customer_id == customer_id).first()
    if conv:
        conv.unread_count_admin = 0
        db.commit()
    return {"message": "Marked as read"}


@router.put("/my-conversation/read")
def mark_my_conversation_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conv = db.query(Conversation).filter(Conversation.customer_id == current_user.id).first()
    if conv:
        conv.unread_count_customer = 0
        db.commit()
    return {"message": "Marked as read"}
