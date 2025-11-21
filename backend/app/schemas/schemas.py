# app/schemas.py
from typing import List, Optional
from pydantic import BaseModel


# ---------------------------
# AffiliateLink Schema
# ---------------------------
class AffiliateLinkRead(BaseModel):
    id: int
    platform: str
    url: str
    commission_pct: float

    class Config:
        orm_mode = True


# ---------------------------
# Category Schema
# ---------------------------
class CategoryRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True


# ---------------------------
# Product Schema
# ---------------------------
class ProductRead(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    price: float
    currency: str
    image_url: Optional[str]
    specs: Optional[dict]     # JSONB → dict
    category: CategoryRead
    affiliate_links: List[AffiliateLinkRead] = []

    class Config:
        orm_mode = True
