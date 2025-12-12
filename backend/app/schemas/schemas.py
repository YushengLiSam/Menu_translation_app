from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# --- [新增] 写入专用 ---
class AffiliateLinkCreate(BaseModel):
    platform: str
    url: str
    commission_pct: float

class ProductCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    price: float
    currency: str = "CNY"
    image_url: Optional[str] = None
    specs: Optional[dict] = None
    category_id: int
    affiliate_links: List[AffiliateLinkCreate] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[str] = None
    specs: Optional[dict] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

# --- [原有] 读取专用 ---
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

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class TemplateBase(BaseModel):
    title: str
    description: Optional[str] = None
    style: str
    cover_image_url: Optional[str] = None

# --- 创建模板 (API 请求参数) ---
class TemplateItemCreate(BaseModel):
    product_id: int
    position_x: float = 0
    position_y: float = 0

class TemplateCreate(TemplateBase):
    # 关键：接收一个产品 Item 列表
    items: List[TemplateItemCreate] = []

class TemplateUpdate(TemplateCreate):
    pass

# --- 模板内的单项商品 ---
class TemplateItemOut(BaseModel):
    # 直接嵌套完整的 ProductRead
    product: ProductRead 
    position_x: float
    position_y: float
    
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
    # Include creator info
    creator: Optional[UserOut] = None

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

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str