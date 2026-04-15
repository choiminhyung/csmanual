from fastapi import APIRouter, HTTPException

from ..schemas import ManualSection, SectionCreate, SectionUpdate
from ..services.manual_service import get_provider

router = APIRouter(prefix="/manual", tags=["manual"])


@router.get("", response_model=str)
def get_full_manual():
    """매뉴얼 전체 내용을 텍스트로 반환합니다."""
    return get_provider().get_content()


@router.get("/sections", response_model=list[ManualSection])
def list_sections():
    """## 레벨 섹션 목록을 반환합니다."""
    return get_provider().get_sections()


@router.post("/sections", response_model=ManualSection, status_code=201)
def add_section(body: SectionCreate):
    """새 섹션을 매뉴얼 끝에 추가합니다."""
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="title은 비워둘 수 없습니다.")
    return get_provider().add_section(body.title, body.content)


@router.put("/sections/{section_id}", response_model=ManualSection)
def update_section(section_id: str, body: SectionUpdate):
    """기존 섹션의 제목 또는 내용을 수정합니다."""
    try:
        return get_provider().update_section(section_id, body.title, body.content)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/sections/{section_id}", status_code=204)
def delete_section(section_id: str):
    """섹션을 삭제합니다."""
    deleted = get_provider().delete_section(section_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"섹션 '{section_id}'을 찾을 수 없습니다.")
