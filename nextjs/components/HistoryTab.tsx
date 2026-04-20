'use client'
import { useCallback, useEffect, useState } from 'react'
import type { ToastType } from './Toast'
import DetailModal, { type HistoryItem } from './DetailModal'

interface Props {
  showToast: (msg: string, type?: ToastType) => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function HistoryTab({ showToast }: Props) {
  const [items,      setItems]      = useState<HistoryItem[]>([])
  const [loading,    setLoading]    = useState(false)
  const [staffName,  setStaffName]  = useState('')
  const [customerId, setCustomerId] = useState('')
  const [fromDate,   setFromDate]   = useState('')
  const [toDate,     setToDate]     = useState('')
  const [selected,   setSelected]   = useState<HistoryItem | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (staffName)  params.set('staff_name',  staffName)
      if (customerId) params.set('customer_id', customerId)
      if (fromDate)   params.set('from_date',   fromDate)
      if (toDate)     params.set('to_date',      toDate)
      const res = await fetch(`/api/history?${params}`)
      if (!res.ok) throw new Error(`오류 (${res.status})`)
      setItems(await res.json())
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : '불러오기 실패', 'error')
    } finally {
      setLoading(false)
    }
  }, [staffName, customerId, fromDate, toDate, showToast])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  function exportCSV() {
    const params = new URLSearchParams()
    if (staffName)  params.set('staff_name',  staffName)
    if (customerId) params.set('customer_id', customerId)
    if (fromDate)   params.set('from_date',   fromDate)
    if (toDate)     params.set('to_date',      toDate)
    window.location.href = `/api/history/export?${params}`
  }

  return (
    <>
      <div className="card">
        <div className="section-heading">필터</div>
        <div className="form-row">
          <div className="form-group">
            <label>담당자명</label>
            <input value={staffName}  onChange={(e) => setStaffName(e.target.value)}  placeholder="김민지" />
          </div>
          <div className="form-group">
            <label>고객 ID</label>
            <input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="CU001" />
          </div>
          <div className="form-group">
            <label>시작일</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>종료일</label>
            <input type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={fetchHistory} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? '조회 중...' : '조회'}
          </button>
          <button className="btn btn-ghost" onClick={exportCSV}>CSV 내보내기</button>
        </div>
      </div>

      <div className="card table-card">
        {items.length === 0 ? (
          <div className="empty-state">{loading ? '조회 중...' : '내역이 없습니다.'}</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>일시</th>
                  <th>담당자</th>
                  <th>고객 ID</th>
                  <th>질문</th>
                  <th>답변</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                    <td className="td-date">{formatDate(item.created_at)}</td>
                    <td>{item.staff_name || '—'}</td>
                    <td>{item.customer_id || '—'}</td>
                    <td className="td-ellipsis">{item.question}</td>
                    <td className="td-ellipsis">{item.answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </>
  )
}
