# app/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

from ..db import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(100), nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    price = Column(Float, nullable=False)
    currency = Column(String(10), default="CNY")

    image_url = Column(String(500), nullable=True)

    specs = Column(JSONB, nullable=True)  # 使用 PostgreSQL JSONB（比 TEXT 更强）

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    affiliate_links = relationship("AffiliateLink", back_populates="product")


class AffiliateLink(Base):
    __tablename__ = "affiliate_links"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    platform = Column(String(50), nullable=False)       # "Amazon", "JD", "Official"
    url = Column(String(1000), nullable=False)
    commission_pct = Column(Float, nullable=False)

    product = relationship("Product", back_populates="affiliate_links")
