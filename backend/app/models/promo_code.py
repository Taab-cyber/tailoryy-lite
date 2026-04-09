# models/promo_code.py — Discount promo codes
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, Enum as SAEnum
from app.database import Base


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code        = Column(String(50), unique=True, nullable=False, index=True)
    type        = Column(SAEnum("percent", "flat", name="promo_type"), default="percent")
    value       = Column(Float, nullable=False)
    min_order   = Column(Float, default=0.0)
    max_uses    = Column(Integer, default=0)      # 0 = unlimited
    times_used  = Column(Integer, default=0)
    is_active   = Column(Boolean, default=True, nullable=False)
    expires_at  = Column(DateTime, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<PromoCode {self.code}>"
