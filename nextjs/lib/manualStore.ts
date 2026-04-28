export type SyncMeta = {
  syncedAt: string
  docId:    string
}

let cachedContent: string | null = null
let cachedMeta:    SyncMeta | null = null

export function readSyncedManual(): string | null {
  return cachedContent
}

export function writeSyncedManual(content: string, docId: string): SyncMeta {
  const meta: SyncMeta = { syncedAt: new Date().toISOString(), docId }
  cachedContent = content
  cachedMeta    = meta
  return meta
}

export function getSyncMeta(): SyncMeta | null {
  return cachedMeta
}
