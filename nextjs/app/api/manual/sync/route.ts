import { NextResponse } from 'next/server'
import { fetchGoogleDoc } from '@/lib/googleDocs'
import { writeSyncedManual, getSyncMeta } from '@/lib/manualStore'

/** GET /api/manual/sync — 마지막 동기화 상태 조회 */
export async function GET() {
  const meta = getSyncMeta()
  if (!meta) {
    return NextResponse.json({ synced: false, message: '아직 동기화된 매뉴얼이 없습니다.' })
  }
  return NextResponse.json({ synced: true, ...meta })
}

/** POST /api/manual/sync — Google Docs → data/manual.txt 동기화 */
export async function POST() {
  const docId = process.env.GOOGLE_DOC_ID
  if (!docId) {
    return NextResponse.json(
      { error: 'GOOGLE_DOC_ID 환경변수가 설정되지 않았습니다.' },
      { status: 400 }
    )
  }

  try {
    const content = await fetchGoogleDoc(docId)
    const meta = writeSyncedManual(content, docId)
    return NextResponse.json({ ok: true, ...meta })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '동기화 실패'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
