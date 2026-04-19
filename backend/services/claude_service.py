"""
채팅 서비스 — AI 프로바이더에 무관한 공통 로직.

AI_PROVIDER 환경변수로 claude / openai 중 선택합니다 (기본: claude).
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from ..models import ChatMessage
from .ai_providers import get_ai_provider
from .manual_service import get_provider as get_manual_provider


def _get_history(db: Session, session_id: str) -> list[dict]:
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [{"role": r.role, "content": r.content} for r in rows]


def _save_message(db: Session, session_id: str, role: str, content: str, staff_name: str = "") -> None:
    db.add(ChatMessage(session_id=session_id, role=role, content=content, staff_name=staff_name))
    db.commit()


def chat(db: Session, customer_id: str, question: str, staff_name: str = "") -> str:
    manual_content = get_manual_provider().get_content()
    history = _get_history(db, customer_id)

    _save_message(db, customer_id, "user", question, staff_name)

    ai = get_ai_provider()
    answer = ai.reply(manual_content, history, question)

    _save_message(db, customer_id, "assistant", answer, staff_name)
    return answer
