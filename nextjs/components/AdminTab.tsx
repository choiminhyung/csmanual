'use client'
import { useCallback, useEffect, useState } from 'react'
import type { ToastType } from './Toast'

interface Props {
  showToast: (msg: string, type?: ToastType) => void
}

type SyncStatus =
  | { synced: false; message: string }
  | { synced: true; syncedAt: string; docId: string }

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function AdminTab({ showToast }: Props) {
  const [status,  setStatus]  = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<{ ok: boolean; message: string } | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/manual/sync')
      setStatus(await res.json())
    } catch {
      setStatus({ synced: false, message: '상태 조회 실패' })
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  async function runSync() {
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/manual/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? `오류 (${res.status})`)
      setResult({ ok: true, message: `동기화 완료 — ${formatDate(data.syncedAt)}` })
      showToast('매뉴얼이 동기화되었습니다.', 'info')
      await fetchStatus()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '동기화 실패'
      setResult({ ok: false, message: msg })
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="section-heading">매뉴얼 동기화</div>

      {/* 현재 상태 */}
      <div className="sync-status-box">
        <div className="sync-status-label">마지막 동기화</div>
        {status === null ? (
          <div className="sync-status-value muted">조회 중...</div>
        ) : status.synced ? (
          <>
            <div className="sync-status-value">{formatDate(status.syncedAt)}</div>
            <div className="sync-doc-id">Doc ID: {status.docId}</div>
          </>
        ) : (
          <div className="sync-status-value muted">아직 동기화된 매뉴얼이 없습니다.</div>
        )}
      </div>

      {/* 동기화 버튼 */}
      <button className="btn btn-primary" onClick={runSync} disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? '동기화 중...' : 'Google Docs에서 동기화'}
      </button>

      {/* 결과 메시지 */}
      {result && (
        <div className={`sync-result ${result.ok ? 'sync-result-ok' : 'sync-result-err'}`}>
          {result.ok ? '✓' : '✕'} {result.message}
        </div>
      )}
    </div>
  )
}
