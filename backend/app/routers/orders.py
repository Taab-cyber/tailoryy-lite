# routers/orders.py — Order CRUD, status updates, admin stats
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut
from app.middleware.auth import get_current_user, require_admin
from app.utils.order_number import generate_order_number

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order_number = generate_order_number(db)
    subtotal = 500.0 if data.delivery_type == "express" else 0.0
    order = Order(
        id=str(uuid.uuid4()),
        order_number=order_number,
        customer_id=current_user.id,
        service_type=data.service_type,
        inspiration_images=data.inspiration_images,
        measurements=data.measurements,
        fabric_preference=data.fabric_preference,
        color_preference=data.color_preference,
        embellishments=data.embellishments,
        additional_notes=data.additional_notes,
        shipping_address=data.shipping_address.model_dump(),
        delivery_type=data.delivery_type,
        subtotal=subtotal,
        total_amount=subtotal,
        balance_due=subtotal,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/stats")
def order_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    from sqlalchemy import func
    total     = db.query(func.count(Order.id)).scalar() or 0
    pending   = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0
    delivered = db.query(func.count(Order.id)).filter(Order.status == "delivered").scalar() or 0
    revenue   = db.query(func.sum(Order.advance_paid)).scalar() or 0
    return {"total": total, "pending": pending, "delivered": delivered, "revenue": float(revenue)}


@router.get("/", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order)
    if current_user.role != "admin":
        query = query.filter(Order.customer_id == current_user.id)
    if status:
        query = query.filter(Order.status == status)
    if service_type:
        query = query.filter(Order.service_type == service_type)
    return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.put("/{order_id}/status")
def update_order_status(order_id: str, data: dict, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.get("status", order.status)
    if data.get("estimated_delivery"):
        from datetime import datetime
        order.estimated_delivery = datetime.fromisoformat(data["estimated_delivery"])
    if data.get("admin_notes"):
        order.admin_notes = data["admin_notes"]
    db.commit()

    # Send status update email
    try:
        from app.services.email_service import send_order_status_update
        customer = db.query(User).filter(User.id == order.customer_id).first()
        if customer:
            send_order_status_update(customer.email, customer.full_name, order.order_number, order.status)
    except Exception:
        pass

    return {"message": "Status updated", "status": order.status}


@router.put("/{order_id}/tracking")
def update_tracking(order_id: str, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.tracking_number = data.get("tracking_number")
    db.commit()
    return {"message": "Tracking updated"}


@router.put("/{order_id}/artisan")
def assign_artisan(order_id: str, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.assigned_artisan = data.get("artisan")
    db.commit()
    return {"message": "Artisan assigned"}


@router.put("/{order_id}")
def update_order(order_id: str, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, val in data.items():
        if hasattr(order, key):
            setattr(order, key, val)
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}")
def delete_order(order_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}
