from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
# 引用我们在 schemas.py 里定义好的埋点格式
from app.schemas.schemas import TrackViewCreate, TrackClickCreate

router = APIRouter(prefix="/track", tags=["Tracking"])

# 1. 记录浏览 (View)
@router.post("/view")
def track_view(event_in: TrackViewCreate, db: Session = Depends(get_db)):
    """
    当用户进入详情页时调用。
    功能：
    1. 往 view_events 表插一条记录
    2. 顺便把 templates 表的 views 计数 +1 (为了推荐算法查询更快)
    """
    # A. 检查模板是否存在
    template = db.query(models.Template).filter(models.Template.id == event_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # B. 记录事件 (详细日志)
    new_event = models.ViewEvent(template_id=event_in.template_id)
    db.add(new_event)
    
    # C. 核心逻辑：直接增加模板的浏览计数
    template.views += 1
    
    db.commit()
    return {"status": "ok", "views": template.views}

# 2. 记录点击 (Click)
@router.post("/click")
def track_click(event_in: TrackClickCreate, db: Session = Depends(get_db)):
    """
    当用户点击购买链接时调用。
    功能：
    1. 往 click_events 表插一条记录 (记录点了哪个平台)
    2. 顺便把 templates 表的 clicks 计数 +1
    """
    # A. 记录事件 (详细日志)
    new_event = models.ClickEvent(
        template_id=event_in.template_id,
        product_id=event_in.product_id,
        platform=event_in.platform
    )
    db.add(new_event)
    
    # B. 如果关联了模板，增加模板的点击计数
    if event_in.template_id:
        template = db.query(models.Template).filter(models.Template.id == event_in.template_id).first()
        if template:
            template.clicks += 1
            
    db.commit()
    return {"status": "ok"}