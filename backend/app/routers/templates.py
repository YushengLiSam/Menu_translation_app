from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app import models
# 修正 Schema 引用路径 (确保指向 schemas/schemas.py)
from app.schemas.schemas import TemplateCreate, TemplateOut, TemplateUpdate

# 👇 1. 新增导入：我们需要 Auth 里的“门卫”和 User 模型
from .auth import get_current_user
from app.models import User

router = APIRouter(prefix="/templates", tags=["templates"])

# ---------------------------------------------------------
# 1. 获取模板列表 (Feed流的基础) - 所有人可见
# ---------------------------------------------------------
@router.get("/", response_model=List[TemplateOut])
def list_templates(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(get_db)
):
    # 按创建时间倒序排列 (最新的在前面)
    templates = db.query(models.Template).order_by(models.Template.created_at.desc()).offset(skip).limit(limit).all()
    return templates

# ---------------------------------------------------------
# 2. 获取单个模板详情 - 所有人可见
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# 3. 发布新模板 (核心逻辑) - 🔒 必须登录
# ---------------------------------------------------------
@router.post("/", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    template_in: TemplateCreate, 
    db: Session = Depends(get_db),
    # 👇 关键改动 A：加上这行！
    # 这就像安检门，只有带了 Token 的人才能进来，
    # 进来后，current_user 就是这个人的所有信息。
    current_user: User = Depends(get_current_user) 
):
    # A. 创建 Template 主体
    new_template = models.Template(
        title=template_in.title,
        description=template_in.description,
        style=template_in.style,
        cover_image_url=template_in.cover_image_url,
        
        # 👇 关键改动 B：自动盖章
        # 我们不再需要前端传 user_id，直接用 Token 里解析出来的 ID
        creator_id=current_user.id 
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template) # 拿到 ID

    # B. 关联产品 (items)
    if template_in.items:
        for item_in in template_in.items:
            # 检查产品是否存在
            product = db.query(models.Product).filter(models.Product.id == item_in.product_id).first()
            if product:
                # 创建关联记录
                link_item = models.TemplateItem(
                    template_id=new_template.id,
                    product_id=item_in.product_id,
                    position_x=item_in.position_x,
                    position_y=item_in.position_y
                )
                db.add(link_item)
        
        db.commit()
        db.refresh(new_template) # 刷新以获取关联后的 items

    return new_template

# ---------------------------------------------------------
# 4. 删除模板 - 🔒 必须登录且是作者
# ---------------------------------------------------------
@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    # 鉴权：只有作者能删除
    if template.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this template")
        
    db.delete(template)
    db.commit()
    return None

# ---------------------------------------------------------
# 5. 更新模板 - 🔒 必须登录且是作者
# ---------------------------------------------------------
@router.put("/{template_id}", response_model=TemplateOut)
def update_template(
    template_id: int,
    template_in: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    if template.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this template")
        
    # Update basic fields
    template.title = template_in.title
    template.description = template_in.description
    template.style = template_in.style
    template.cover_image_url = template_in.cover_image_url
    
    # Update items: brute force replace
    # 1. Delete existing items
    db.query(models.TemplateItem).filter(models.TemplateItem.template_id == template.id).delete()
    
    # 2. Add new items
    if template_in.items:
        for item_in in template_in.items:
            product = db.query(models.Product).filter(models.Product.id == item_in.product_id).first()
            if product:
                link_item = models.TemplateItem(
                    template_id=template.id,
                    product_id=item_in.product_id,
                    position_x=item_in.position_x,
                    position_y=item_in.position_y
                )
                db.add(link_item)
    
    db.commit()
    db.refresh(template)
    return template