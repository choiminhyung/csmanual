from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ChatMessage
from ..schemas import ChatHistoryItem, ChatRequest, ChatResponse
from ..services import claude_service

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def send_message(body: ChatRequest, db: Session = Depends(get_db)):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="message는 비워둘 수 없습니다.")
    reply = claude_service.chat(db, body.session_id, body.message)
    return ChatResponse(session_id=body.session_id, response=reply)


@router.get("/chat/{session_id}/history", response_model=list[ChatHistoryItem])
def get_history(session_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [ChatHistoryItem.model_validate(r) for r in rows]
