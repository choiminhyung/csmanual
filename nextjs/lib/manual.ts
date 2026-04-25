import fs from 'fs'
import path from 'path'
import { readSyncedManual } from './manualStore'

/** cs-manual.md — AI 응대 원칙 · 금지사항 · 스타일 가이드 */
export function getGuide(): string {
  const p = process.env.MANUAL_PATH
    ? path.resolve(process.env.MANUAL_PATH)
    : path.join(process.cwd(), '..', 'cs-manual.md')
  return fs.readFileSync(p, 'utf-8')
}

/** data/manual.txt — Google Docs에서 sync된 QnA 답변 모음. 미동기화 시 null. */
export function getQna(): string | null {
  return readSyncedManual()
}
