from datetime import datetime
from pydantic import BaseModel


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    customer_id: str
    question: str
    staff_name: str = ""


class ChatResponse(BaseModel):
    customer_id: str
    answer: str


class ChatHistoryItem(BaseModel):
    role: str
    content: str
    staff_name: str = ""
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryExchangeItem(BaseModel):
    id: int
    staff_name: str
    customer_id: str
    question: str
    answer: str
    created_at: datetime


# ── Manual ────────────────────────────────────────────────────────────────────

class ManualSection(BaseModel):
    id: str
    title: str
    content: str


class SectionCreate(BaseModel):
    title: str
    content: str


class SectionUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
