# app/main.py
from fastapi import FastAPI

from .db import Base, engine
from .routers.products import router as products_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DeskHub Backend (PostgreSQL Version)",
    version="1.0.0"
)

app.include_router(products_router)


@app.get("/")
def root():
    return {"message": "DeskHub Backend Running with PostgreSQL"}
