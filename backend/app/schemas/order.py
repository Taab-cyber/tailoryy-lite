# schemas/order.py — Pydantic schemas for Order model
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class ShippingAddress(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str


class OrderCreate(BaseModel):
    service_type: str
    inspiration_images: List[str] = []
    measurements: Dict[str, Any] = {}
    fabric_preference: Optional[str] = None
    color_preference: Optional[str] = None
    embellishments: List[str] = []
    additional_notes: Optional[str] = None
    shipping_address: ShippingAddress
    delivery_type: str = "standard"
    promo_code: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    assigned_artisan: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    tracking_number: Optional[str] = None
    admin_notes: Optional[str] = None
    subtotal: Optional[float] = None
    total_amount: Optional[float] = None
    advance_paid: Optional[float] = None
    balance_due: Optional[float] = None


class OrderOut(BaseModel):
    id: str
    order_number: str
    customer_id: str
    service_type: str
    status: str
    inspiration_images: List[str] = []
    measurements: Dict[str, Any] = {}
    fabric_preference: Optional[str] = None
    color_preference: Optional[str] = None
    embellishments: List[str] = []
    additional_notes: Optional[str] = None
    assigned_artisan: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    tracking_number: Optional[str] = None
    subtotal: float = 0.0
    advance_paid: float = 0.0
    balance_due: float = 0.0
    total_amount: float = 0.0
    shipping_address: Dict[str, Any] = {}
    delivery_type: str = "standard"
    razorpay_order_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
