from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app import models
from app.schemas.schemas import ProductRead, ProductCreate, ProductUpdate
from .auth import get_current_user
from app.models import User

router = APIRouter(prefix = "/products", tags = ["products"])

@router.post("/", response_model=ProductRead, status_code=201)
def create_product(
    product_in: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 简单的创建逻辑，暂不处理复杂的 cateogry 校验
    new_product = models.Product(
        name=product_in.name,
        brand=product_in.brand,
        price=product_in.price,
        currency=product_in.currency,
        image_url=product_in.image_url,
        category_id=product_in.category_id,
        specs=product_in.specs
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/", response_model=List[ProductRead])
def list_products(
    db: Session = Depends(get_db),
    category_id: Optional[int] = None,
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(models.Product).filter(models.Product.is_active == True)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)

    if q:
        query = query.filter(models.Product.name.ilike(f"%{q}%"))
    
    products = (
        query
        .order_by(models.Product.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return products

@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id, models.Product.is_active == True)
        .first()
    )
    if not product:
        raise HTTPException(404, "Product not found")

    return product

@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update fields
    update_data = product_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.add(product)
    db.commit()
    db.refresh(product)
    return product