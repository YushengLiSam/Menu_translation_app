from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class AffiliateLinkRead(BaseModel):
    id: int
    platform: str
    url: str
    commission_pct: float

    class Config:
        orm_mode = True

class CategoryRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        orm_mode = True

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

class TemplateBase(BaseModel):
    title: str
    description: Optional[str] = None
    style: str
    cover_image_url: Optional[str] = None

# --- 创建模板 (API 请求参数) ---
class TemplateCreate(TemplateBase):
    # 关键：接收一个产品ID列表，例如 [1, 5, 10]
    product_ids: List[int] = []

# --- 模板内的单项商品 ---
class TemplateItemOut(BaseModel):
    # 直接嵌套完整的 ProductRead
    product: ProductRead 
    
    class Config:
        orm_mode = True

# --- 模板详情 (API 返回结果) ---
class TemplateOut(TemplateBase):
    id: int
    views: int
    clicks: int
    created_at: datetime
    # 嵌套 items
    items: List[TemplateItemOut] = []

class FeedResponse(BaseModel):
    data: List[TemplateOut]      # 这一刷出来的 10 个模板
    next_cursor: Optional[int]   # 下一页的游标 (如果没了就是 null)
    has_more: bool               # 方便前端判断是否要显示 "没有更多了"

class TrackViewCreate(BaseModel):
    template_id: int

class TrackClickCreate(BaseModel):
    template_id: Optional[int] = None
    product_id: Optional[int] = None
    platform: str  # 点击了哪个平台的链接，如 "Amazon"

# ===========================
# 4. AI Configurator
# ===========================

class ConfigRequest(BaseModel):
    space_width: float  # 房间/桌子可用宽度 (cm)
    space_depth: float  # 房间/桌子可用深度 (cm)
    budget: float       # 预算 (CNY)
    style: str          # 风格 (e.g., "Minimal")
    purpose: str        # 用途 (e.g., "Gaming", "Work")

class ConfigResponse(BaseModel):
    total_price: float
    products: List[ProductRead]  # 推荐的商品列表
    compatibility_issues: List[str] = []  # 兼容性警告 (e.g., "预算超了 200")
    ai_message: Optional[str] = None # 模拟 AI 的建议语
    
    class Config:
        orm_mode = True
