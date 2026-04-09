# schemas/fabric.py — Pydantic schemas for Fabric model
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FabricCreate(BaseModel):
    name: str
    fabric_type: str
    color: Optional[str] = None
    hex_code: Optional[str] = None
    image_url: Optional[str] = None
    price_per_metre: float = 0.0
    is_available: bool = True
    description: Optional[str] = None


class FabricUpdate(BaseModel):
    name: Optional[str] = None
    fabric_type: Optional[str] = None
    color: Optional[str] = None
    hex_code: Optional[str] = None
    image_url: Optional[str] = None
    price_per_metre: Optional[float] = None
    is_available: Optional[bool] = None
    description: Optional[str] = None


class FabricOut(BaseModel):
    id: str
    name: str
    fabric_type: str
    color: Optional[str] = None
    hex_code: Optional[str] = None
    image_url: Optional[str] = None
    price_per_metre: float
    is_available: bool
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
