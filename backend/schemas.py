from datetime import datetime
from pydantic import BaseModel


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    response: str


class ChatHistoryItem(BaseModel):
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


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
