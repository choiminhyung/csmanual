import { NextRequest, NextResponse } from 'next/server'
import { GET as getHistory } from '../route'

export async function GET(req: NextRequest) {
  const res  = await getHistory(req)
  const items = await res.json() as {
    created_at: string; staff_name: string; customer_id: string; question: string; answer: string
  }[]

  const header = '일시,담당자명,고객ID,질문,답변\n'
  const rows = items.map((r) =>
    [r.created_at, r.staff_name, r.customer_id, r.question, r.answer]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n')

  const bom = '\uFEFF'
  return new NextResponse(bom + header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="cs_history.csv"',
    },
  })
}
