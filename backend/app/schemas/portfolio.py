# schemas/portfolio.py — Pydantic schemas for PortfolioItem
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PortfolioItemCreate(BaseModel):
    title: str
    category: str
    images: List[str] = []
    description: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = False
    display_order: int = 0


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None


class PortfolioItemOut(BaseModel):
    id: str
    title: str
    category: str
    images: List[str] = []
    description: Optional[str] = None
    tags: List[str] = []
    is_featured: bool
    display_order: int
    created_at: datetime

    class Config:
        from_attributes = True
