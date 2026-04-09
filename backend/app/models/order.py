# models/order.py — Customer order with full lifecycle tracking
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id                  = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number        = Column(String(30), unique=True, nullable=False, index=True)
    customer_id         = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    service_type        = Column(
        SAEnum("custom_stitch", "upcycle", "own_fabric", name="service_type"),
        nullable=False
    )
    status              = Column(
        SAEnum(
            "pending", "confirmed", "cutting", "stitching",
            "quality_check", "shipped", "delivered", "cancelled",
            name="order_status"
        ),
        default="pending", nullable=False, index=True
    )

    # Design inputs
    inspiration_images  = Column(JSON, default=list)     # list of Cloudinary URLs
    measurements        = Column(JSON, default=dict)     # {bust, waist, hip, ...}
    fabric_preference   = Column(String(100), nullable=True)
    color_preference    = Column(String(255), nullable=True)
    embellishments      = Column(JSON, default=list)
    additional_notes    = Column(Text, nullable=True)

    # Operations
    assigned_artisan    = Column(String(255), nullable=True)
    estimated_delivery  = Column(DateTime, nullable=True)
    tracking_number     = Column(String(100), nullable=True)

    # Pricing
    subtotal            = Column(Float, default=0.0)
    advance_paid        = Column(Float, default=0.0)
    balance_due         = Column(Float, default=0.0)
    total_amount        = Column(Float, default=0.0)
    razorpay_order_id   = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)

    # Shipping
    shipping_address    = Column(JSON, default=dict)
    delivery_type       = Column(String(20), default="standard")  # standard / express

    # Meta
    admin_notes         = Column(Text, nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer   = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    review     = relationship("Review", back_populates="order", uselist=False)

    def __repr__(self):
        return f"<Order {self.order_number}>"
