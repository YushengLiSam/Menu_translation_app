# app/routers/feed.py
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db import get_db
from app import models
from app.schemas import FeedResponse # 刚刚定义的响应格式

router = APIRouter(prefix="/feed", tags=["Feed"])

@router.get("/", response_model=FeedResponse)
def get_feed(
    db: Session = Depends(get_db),
    limit: int = 10,
    cursor: Optional[int] = Query(None, description="游标：上一页最后一条的ID"),
    style: Optional[str] = Query(None, description="筛选：Minimal, Cyberpunk 等")
):
    """
    首页无限推荐流 (小红书模式)
    策略：基于 ID 倒序 (最新发布优先) + Cursor 分页
    """
    
    # 1. 基础查询
    query = db.query(models.Template)

    # 2. 筛选逻辑 (如果用户选了风格)
    if style:
        query = query.filter(models.Template.style == style)

    # 3. Cursor 分页核心逻辑
    # 如果前端传了 cursor (比如 100)，我们就找 ID < 100 的 (也就是更早发布的)
    if cursor:
        query = query.filter(models.Template.id < cursor)

    # 4. 排序 & 取数
    # 按 ID 倒序 (最新的在最前面)
    # 进阶提示：如果要按“热度”排序，需要复杂的 Score 算法，MVP 先用时间倒序最稳
    items = query.order_by(models.Template.id.desc()).limit(limit).all()

    # 5. 计算下一页的 cursor
    next_cursor = None
    if items:
        # 拿这一页最后一条的 ID 作为下一次的 cursor
        next_cursor = items[-1].id

    # 6. 组装返回
    return {
        "data": items,
        "next_cursor": next_cursor,
        "has_more": next_cursor is not None and len(items) == limit
    }