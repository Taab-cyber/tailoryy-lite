# routers/contact.py — Contact form: emails admin + auto-replies to sender
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()


class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


@router.post("/")
async def submit_contact(data: ContactForm, background_tasks: BackgroundTasks):
    try:
        from app.services.email_service import send_contact_form_emails
        background_tasks.add_task(
            send_contact_form_emails,
            data.name, data.email, data.subject, data.message,
        )
    except Exception:
        pass
    return {"message": "Thank you! We'll get back to you within 24 hours."}
