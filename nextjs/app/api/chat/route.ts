import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAnswer } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { customer_id, question, staff_name = '' } = await req.json()

  if (!question?.trim()) {
    return NextResponse.json({ detail: 'question은 비워둘 수 없습니다.' }, { status: 400 })
  }

  const history = await prisma.chatMessage.findMany({
    where: { session_id: customer_id },
    orderBy: { created_at: 'asc' },
    select: { role: true, content: true },
  })

  await prisma.chatMessage.create({
    data: { session_id: customer_id, role: 'user', content: question, staff_name },
  })

  try {
    const answer = await generateAnswer(
      question,
      history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    )

    await prisma.chatMessage.create({
      data: { session_id: customer_id, role: 'assistant', content: answer, staff_name },
    })

    return NextResponse.json({ customer_id, answer })
  } catch {
    return NextResponse.json(
      { detail: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 503 }
    )
  }
}
