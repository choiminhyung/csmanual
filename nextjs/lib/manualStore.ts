import fs from 'fs'
import path from 'path'

const DATA_DIR    = path.join(process.cwd(), 'data')
const CONTENT_FILE = path.join(DATA_DIR, 'manual.txt')
const META_FILE    = path.join(DATA_DIR, 'manual.meta.json')

export type SyncMeta = {
  syncedAt: string   // ISO 8601
  docId:    string
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readSyncedManual(): string | null {
  try {
    return fs.readFileSync(CONTENT_FILE, 'utf-8')
  } catch {
    return null
  }
}

export function writeSyncedManual(content: string, docId: string): SyncMeta {
  ensureDataDir()
  const meta: SyncMeta = { syncedAt: new Date().toISOString(), docId }
  fs.writeFileSync(CONTENT_FILE, content, 'utf-8')
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), 'utf-8')
  return meta
}

export function getSyncMeta(): SyncMeta | null {
  try {
    return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')) as SyncMeta
  } catch {
    return null
  }
}
