from fastapi import FastAPI

from .db import Base, engine
from .routers.products import router as products_router
from .routers.templates import router as templates_router
from .routers.feed import router as feed_router          # ✅ 指向 feed.py
from .routers.tracking import router as tracking_router  # ✅ 指向 tracking.py
from .routers.configurator import router as configurator_router
from .routers.auth import router as auth_router
from .models import models  # Ensure models are loaded

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DeskHub Backend (PostgreSQL Version)",
    version="1.0.0"
)

# Seed default category
@app.on_event("startup")
def startup_db_client():
    from app.db import SessionLocal
    from app.models import models
    db = SessionLocal()
    try:
        if not db.query(models.Category).filter(models.Category.id == 1).first():
            default_cat = models.Category(id=1, name="General", description="Default category")
            db.add(default_cat)
            db.commit()
            print("Seeded default category 'General'")
    except Exception as e:
        print(f"Skipping seed: {e}")
    finally:
        db.close()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(templates_router)
app.include_router(feed_router)
app.include_router(tracking_router)
app.include_router(tracking_router)
app.include_router(configurator_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "DeskHub Backend Running with PostgreSQL"}
