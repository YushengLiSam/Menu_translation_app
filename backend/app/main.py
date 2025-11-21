from fastapi import FastAPI
from app.routers import auth
import uvicorn

app = FastAPI(title="DeskHub Backend", version="1.0.0")

# register router 
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "DeskHub Backend Running"}
