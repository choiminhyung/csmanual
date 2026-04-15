"""
AI 프로바이더 추상화.

AI_PROVIDER 환경변수로 사용할 프로바이더를 선택합니다.
  claude  → Anthropic Claude (기본값, 프롬프트 캐싱 지원)
  openai  → OpenAI ChatGPT

새 프로바이더 추가 시 AIProvider를 상속하여 reply() 만 구현하면 됩니다.
"""
from __future__ import annotations

import os
from abc import ABC, abstractmethod

SYSTEM_PROMPT_TEMPLATE = """\
당신은 스킨케어 브랜드 **더여백26**의 전문 고객응대 AI입니다.
아래 매뉴얼을 참고하여 고객 문의에 한국어로만 답변하세요.

**절대 금지 사항**
- 의료적 판단 또는 인과관계 단정 표현
- 환불 확정 표현
- 고객과의 논쟁 또는 실랑이
- 개봉 후 환불 가능 표현

**응대 원칙**
- 공감 → 상황 파악 → 해결 방안 제시
- 브랜드 슬로건: "피부가 행복해지는 더여백26"

--- 매뉴얼 시작 ---
{manual_content}
--- 매뉴얼 끝 ---"""


class AIProvider(ABC):
    @abstractmethod
    def reply(self, manual_content: str, history: list[dict], user_message: str) -> str:
        """
        history  : [{"role": "user"|"assistant", "content": str}, ...]
        반환값   : 어시스턴트 응답 텍스트
        """


# ── Claude ────────────────────────────────────────────────────────────────────

class ClaudeProvider(AIProvider):
    def __init__(self):
        import anthropic
        self._client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self._model = os.getenv("CLAUDE_MODEL", "claude-opus-4-6")

    def _system_blocks(self, manual_content: str) -> list[dict]:
        """매뉴얼 블록에 cache_control을 붙여 프롬프트 캐싱을 활성화합니다."""
        preamble = SYSTEM_PROMPT_TEMPLATE.split("--- 매뉴얼 시작 ---")[0]
        manual_block = "--- 매뉴얼 시작 ---\n" + manual_content + "\n--- 매뉴얼 끝 ---"
        return [
            {"type": "text", "text": preamble},
            {
                "type": "text",
                "text": manual_block,
                "cache_control": {"type": "ephemeral"},
            },
        ]

    def reply(self, manual_content: str, history: list[dict], user_message: str) -> str:
        messages = history + [{"role": "user", "content": user_message}]
        response = self._client.messages.create(
            model=self._model,
            max_tokens=1024,
            system=self._system_blocks(manual_content),
            messages=messages,
        )
        return next((b.text for b in response.content if b.type == "text"), "")


# ── OpenAI ────────────────────────────────────────────────────────────────────

class OpenAIProvider(AIProvider):
    def __init__(self):
        from openai import OpenAI
        self._client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o")

    def reply(self, manual_content: str, history: list[dict], user_message: str) -> str:
        system_text = SYSTEM_PROMPT_TEMPLATE.format(manual_content=manual_content)
        messages = (
            [{"role": "system", "content": system_text}]
            + history
            + [{"role": "user", "content": user_message}]
        )
        response = self._client.chat.completions.create(
            model=self._model,
            max_tokens=1024,
            messages=messages,
        )
        return response.choices[0].message.content or ""


# ── 팩토리 ────────────────────────────────────────────────────────────────────

def get_ai_provider() -> AIProvider:
    provider = os.getenv("AI_PROVIDER", "claude").lower()
    if provider == "openai":
        return OpenAIProvider()
    return ClaudeProvider()
