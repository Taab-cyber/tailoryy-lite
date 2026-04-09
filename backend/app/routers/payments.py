# routers/payments.py — Razorpay payment order creation and verification
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hmac, hashlib

from app.database import get_db
from app.models.order import Order
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User
from app.config import settings

router = APIRouter()


@router.post("/create-order")
def create_payment_order(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create Razorpay order. Falls back to demo mode if keys not configured."""
    demo_mode = (
        not settings.RAZORPAY_KEY_ID
        or settings.RAZORPAY_KEY_ID.startswith("rzp_test_xxx")
        or "XXXXXXXXXX" in (settings.RAZORPAY_KEY_ID or "")
    )
    if demo_mode:
        return {
            "razorpay_order_id": "order_demo_" + (data.get("order_id") or "")[:8],
            "amount": int(float(data.get("amount", 0)) * 100),
            "currency": "INR",
            "key_id": "rzp_test_demo",
        }
    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        rz_order = client.order.create({
            "amount": int(float(data.get("amount", 0)) * 100),
            "currency": "INR",
            "receipt": data.get("order_id", ""),
        })
        order = db.query(Order).filter(Order.id == data.get("order_id")).first()
        if order:
            order.razorpay_order_id = rz_order["id"]
            db.commit()
        return {**rz_order, "key_id": settings.RAZORPAY_KEY_ID}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
def verify_payment(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Verify Razorpay payment signature and confirm order."""
    demo_mode = (
        not settings.RAZORPAY_KEY_SECRET
        or settings.RAZORPAY_KEY_SECRET == "your-secret"
    )
    if not demo_mode:
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{data['razorpay_order_id']}|{data['razorpay_payment_id']}".encode(),
            hashlib.sha256,
        ).hexdigest()
        if expected != data.get("razorpay_signature"):
            raise HTTPException(status_code=400, detail="Payment verification failed")

    order = db.query(Order).filter(Order.id == data.get("order_id")).first()
    if order:
        order.razorpay_payment_id = data.get("razorpay_payment_id", "demo")
        order.advance_paid = order.total_amount * 0.5
        order.balance_due  = order.total_amount - order.advance_paid
        order.status       = "confirmed"
        db.commit()

        # Send confirmation email
        try:
            from app.services.email_service import send_order_confirmation
            customer = db.query(User).filter(User.id == order.customer_id).first()
            if customer:
                send_order_confirmation(customer.email, customer.full_name, order.order_number)
        except Exception:
            pass

    return {"verified": True, "message": "Payment verified"}


@router.post("/refund")
def initiate_refund(data: dict, _=Depends(require_admin)):
    return {"message": "Refund initiated (manage via Razorpay dashboard in test mode)"}
