from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

# 1. 修正数据库依赖引用 (不要自己在文件里重写 get_db)
from app.db import get_db

# 2. 修正模型引用 (User 现在在 models.py 里，不在 models/user.py)
from app import models

# 3. 修正 Schema 引用 (路径要对)
from app.schemas.schemas import UserCreate, UserLogin, Token

# 4. 引用工具
from app.utils.security import hash_password, verify_password, create_access_token
from app.config import settings

# 设置路由前缀，这样 URL 就是 /auth/login
router = APIRouter(prefix="/auth", tags=["Auth"])

# ---------------------------------------------------------
# 1. 注册接口
# ---------------------------------------------------------
@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 查重
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 创建用户
    new_user = models.User(
        email=user_in.email,
        username=user_in.username,
        password_hash=hash_password(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 注册成功后直接登录，颁发 Token
    # 注意：标准 JWT 使用 "sub" (Subject) 来存用户 ID
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------------------------------------------------
# 2. 登录接口
# ---------------------------------------------------------
@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    # 找用户
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    
    # 验密码
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # 颁发 Token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------------------------------------------------
# 3. 核心安检门卫：获取当前用户
# ---------------------------------------------------------
# 这个 oauth2_scheme 告诉 FastAPI：去 Header 里找 "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    这个函数会被用作依赖项 (Depends)。
    它负责：
    1. 解析 Token
    2. 如果 Token 无效 -> 报错 401
    3. 如果 Token 有效 -> 从数据库取出 User 对象返回
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 解码 Token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 确认用户还存在于数据库
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
        
    return user

# ---------------------------------------------------------
# 4. 获取当前用户信息
# ---------------------------------------------------------
from app.schemas.schemas import UserOut

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user