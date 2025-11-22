# app/routers/configurator.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import models, schemas
import random

router = APIRouter(prefix="/configurator", tags=["AI Configurator"])

@router.post("/recommendations", response_model=schemas.ConfigResponse)
def generate_recommendations(
    request: schemas.ConfigRequest, 
    db: Session = Depends(get_db)
):
    """
    AI 推荐逻辑 (MVP 规则版):
    1. 搜索数据库中的 Desk, Chair, Monitor。
    2. 筛选符合尺寸限制的桌子。
    3. 组合总价最接近预算的一套方案。
    """
    
    # 1. 从数据库取候选商品 (按类别)
    # 注意：这里假设你的 Category 表里 id=1是桌子, 2是椅子, 3是显示器
    # 实际项目中最好按 name 查找 category_id
    desks = db.query(models.Product).filter(models.Product.category_id == 1).all()
    chairs = db.query(models.Product).filter(models.Product.category_id == 2).all()
    monitors = db.query(models.Product).filter(models.Product.category_id == 3).all()

    selected_products = []
    issues = []
    current_total = 0.0

    # 2. 挑选桌子 (逻辑: 宽度必须小于用户空间宽度)
    valid_desks = [
        d for d in desks 
        if d.specs and d.specs.get("width", 0) <= request.space_width
    ]
    
    if valid_desks:
        # 简单策略: 随机选一个符合条件的 (进阶: 选价格占预算 40% 的)
        selected_desk = random.choice(valid_desks)
        selected_products.append(selected_desk)
        current_total += selected_desk.price
    else:
        issues.append(f"没有找到宽度小于 {request.space_width}cm 的桌子")

    # 3. 挑选椅子 (逻辑: 只要有就选)
    if chairs:
        selected_chair = random.choice(chairs)
        selected_products.append(selected_chair)
        current_total += selected_chair.price

    # 4. 挑选显示器 (逻辑: 只要有就选)
    if monitors:
        selected_monitor = random.choice(monitors)
        selected_products.append(selected_monitor)
        current_total += selected_monitor.price

    # 5. 检查预算
    if current_total > request.budget:
        issues.append(f"当前组合总价 ¥{current_total} 超过了您的预算 ¥{request.budget}")

    # 6. 生成 AI 建议语 (模拟)
    ai_msg = f"基于您的 {request.style} 风格偏好，为您推荐了这套总价 ¥{current_total} 的配置。"

    return {
        "total_price": current_total,
        "products": selected_products,
        "compatibility_issues": issues,
        "ai_message": ai_msg
    }