from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app import models
from app.schemas import TemplateCreate, TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])

# 1. 获取模板列表 (Feed流的基础)
@router.get("/", response_model=List[TemplateOut])
def list_templates(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(get_db)
):
    templates = db.query(models.Template).order_by(models.Template.created_at.desc()).offset(skip).limit(limit).all()
    return templates

# 2. 获取单个模板详情
@router.get("/{template_id}", response_model=TemplateOut)
def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # 增加浏览量 (简单的实现)
    template.views += 1
    db.commit()
    db.refresh(template)
    return template

# 3. 发布新模板 (核心逻辑)
@router.post("/", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(template_in: TemplateCreate, db: Session = Depends(get_db)):
    # A. 创建 Template 主体
    new_template = models.Template(
        title=template_in.title,
        description=template_in.description,
        style=template_in.style,
        cover_image_url=template_in.cover_image_url
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template) # 拿到 ID

    # B. 关联产品 (如果有 product_ids)
    if template_in.product_ids:
        for pid in template_in.product_ids:
            # 检查产品是否存在
            product = db.query(models.Product).filter(models.Product.id == pid).first()
            if product:
                # 创建关联记录
                link_item = models.TemplateItem(
                    template_id=new_template.id,
                    product_id=pid
                )
                db.add(link_item)
        
        db.commit()
        db.refresh(new_template)

    return new_template