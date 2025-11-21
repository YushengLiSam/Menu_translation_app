from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app import models
from app.schemas.schemas import ProductRead


router = APIRouter(prefix = "/products", tags = ["products"])

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