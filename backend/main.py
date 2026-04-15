import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .database import create_tables  # noqa: E402
from .routers import chat, manual    # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="더여백26 CS API",
    description="cs-manual.md 기반 고객응대 챗봇 및 매뉴얼 관리 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(manual.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
