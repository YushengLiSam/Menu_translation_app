from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from ..db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False) # Store encrypted passwords
    avatar_url = Column(String(500), nullable=True)     # User avatar
    role = Column(String(20), default="user")           # user / admin

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    templates = relationship("Template", back_populates="creator")

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

    image_url = Column(Text, nullable=True)

    specs = Column(JSONB, nullable=True)  # Specifications

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    affiliate_links = relationship("AffiliateLink", back_populates="product")

class AffiliateLink(Base):
    __tablename__ = "affiliate_links"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    platform = Column(String(50), nullable=False)       # "Amazon", "JD", "Official"
    url = Column(String(1000), nullable=False)
    commission_pct = Column(Float, nullable=False)      # commission rate

    product = relationship("Product", back_populates="affiliate_links")

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    
    # nullable=False indicates that users must be logged in to post.
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False) 
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    style = Column(String(50), nullable=True) # e.g. Minimal, Cyberpunk
    cover_image_url = Column(Text, nullable=True)
    
    # 推荐流所需的统计字段
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("TemplateItem", back_populates="template")
    
    creator = relationship("User", back_populates="templates")



class TemplateItem(Base):
    __tablename__ = "template_items"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Optional metadata for positioning
    position_x = Column(Float, default=0)
    position_y = Column(Float, default=0)
    
    template = relationship("Template", back_populates="items")
    product = relationship("Product")

class ViewEvent(Base):

    __tablename__ = "view_events"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    
    # ✅ New: Record who viewed it (may be left blank, as visitors can view it too)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    platform = Column(String(50), nullable=True)
    
    # ✅ New: Record who clicked (may be left blank)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())