# models/fabric.py — Fabric catalogue item
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Enum as SAEnum
from app.database import Base


class Fabric(Base):
    __tablename__ = "fabrics"

    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name            = Column(String(255), nullable=False)
    fabric_type     = Column(
        SAEnum("silk", "cotton", "georgette", "linen", "velvet", "chiffon", "net", "other", name="fabric_type"),
        nullable=False
    )
    color           = Column(String(100), nullable=True)
    hex_code        = Column(String(7), nullable=True)   # e.g. #C4704A
    image_url       = Column(String(500), nullable=True)
    price_per_metre = Column(Float, default=0.0)
    is_available    = Column(Boolean, default=True, nullable=False)
    description     = Column(String(500), nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Fabric {self.name}>"
