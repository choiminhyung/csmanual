import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ChatMessage
from ..schemas import ChatHistoryItem, ChatRequest, ChatResponse, HistoryExchangeItem
from ..services import claude_service

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def send_message(body: ChatRequest, db: Session = Depends(get_db)):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="question은 비워둘 수 없습니다.")
    answer = claude_service.chat(db, body.customer_id, body.question, body.staff_name)
    return ChatResponse(customer_id=body.customer_id, answer=answer)


# 고정 경로를 {session_id} 파라미터 경로보다 먼저 등록해야 라우팅 충돌을 피할 수 있음
@router.get("/chat/history/all", response_model=list[HistoryExchangeItem])
def get_all_history(
    staff_name: str = Query(""),
    customer_id: str = Query(""),
    from_date: str = Query(""),
    to_date: str = Query(""),
    db: Session = Depends(get_db),
):
    q = db.query(ChatMessage).filter(ChatMessage.role == "user")
    if staff_name:
        q = q.filter(ChatMessage.staff_name.ilike(f"%{staff_name}%"))
    if customer_id:
        q = q.filter(ChatMessage.session_id.ilike(f"%{customer_id}%"))
    if from_date:
        q = q.filter(ChatMessage.created_at >= datetime.fromisoformat(from_date))
    if to_date:
        q = q.filter(ChatMessage.created_at <= datetime.fromisoformat(to_date + "T23:59:59"))
    user_msgs = q.order_by(ChatMessage.created_at.desc()).all()

    result = []
    for um in user_msgs:
        assistant = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.session_id == um.session_id,
                ChatMessage.role == "assistant",
                ChatMessage.id > um.id,
            )
            .order_by(ChatMessage.id)
            .first()
        )
        result.append(
            HistoryExchangeItem(
                id=um.id,
                staff_name=um.staff_name or "",
                customer_id=um.session_id,
                question=um.content,
                answer=assistant.content if assistant else "",
                created_at=um.created_at,
            )
        )
    return result


@router.get("/chat/history/export")
def export_history(
    staff_name: str = Query(""),
    customer_id: str = Query(""),
    from_date: str = Query(""),
    to_date: str = Query(""),
    db: Session = Depends(get_db),
):
    items = get_all_history(staff_name, customer_id, from_date, to_date, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["일시", "담당자명", "고객ID", "질문", "답변"])
    for item in items:
        writer.writerow([
            item.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            item.staff_name,
            item.customer_id,
            item.question,
            item.answer,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cs_history.csv"},
    )


@router.get("/chat/{session_id}/history", response_model=list[ChatHistoryItem])
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [ChatHistoryItem.model_validate(r) for r in rows]
