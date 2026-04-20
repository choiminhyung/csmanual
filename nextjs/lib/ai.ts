import { getManualContent } from './manual'

const SYSTEM_PREAMBLE = `당신은 스킨케어 브랜드 **더여백26**의 전문 고객응대 AI입니다.
아래 매뉴얼을 참고하여 고객 문의에 한국어로만 답변하세요.

**절대 금지 사항**
- 의료적 판단 또는 인과관계 단정 표현
- 환불 확정 표현
- 고객과의 논쟁 또는 실랑이
- 개봉 후 환불 가능 표현

**응대 원칙**
- 공감 → 상황 파악 → 해결 방안 제시
- 브랜드 슬로건: "피부가 행복해지는 더여백26"`

type Message = { role: 'user' | 'assistant'; content: string }

export async function generateAnswer(
  question: string,
  history: Message[]
): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const manual = getManualContent()
  const systemText = `${SYSTEM_PREAMBLE}\n\n--- 매뉴얼 시작 ---\n${manual}\n--- 매뉴얼 끝 ---`
  const messages: Message[] = [...history, { role: 'user', content: question }]

  if (provider === 'claude') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const model = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5-20251001'

    const res = await client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_PREAMBLE },
        {
          type: 'text',
          text: `--- 매뉴얼 시작 ---\n${manual}\n--- 매뉴얼 끝 ---`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })
    return res.content.find((b) => b.type === 'text')?.text ?? ''
  }

  // OpenAI (default)
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o'

  const res = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'system', content: systemText }, ...messages],
  })
  return res.choices[0].message.content ?? ''
}
