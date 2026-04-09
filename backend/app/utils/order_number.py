# utils/order_number.py — Generates unique order numbers like TLR-20240315-0042
from datetime import datetime
from sqlalchemy.orm import Session


def generate_order_number(db: Session) -> str:
    """Generate a sequential order number in format TLR-YYYYMMDD-XXXX."""
    from app.models.order import Order

    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"TLR-{today}-"

    # Count orders today
    count = (
        db.query(Order)
        .filter(Order.order_number.like(f"{prefix}%"))
        .count()
    )
    return f"{prefix}{str(count + 1).zfill(4)}"
