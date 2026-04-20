'use client'

export type HistoryItem = {
  id: number
  staff_name: string
  customer_id: string
  question: string
  answer: string
  created_at: string
}

interface Props {
  item: HistoryItem | null
  onClose: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function DetailModal({ item, onClose }: Props) {
  if (!item) return null

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h3>응대 상세</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <span className="meta-chip">{formatDate(item.created_at)}</span>
            <span className="meta-chip">담당자 {item.staff_name || '—'}</span>
            <span className="meta-chip">고객 ID {item.customer_id || '—'}</span>
          </div>
          <div className="modal-section-label">질문</div>
          <div className="modal-text">{item.question}</div>
          <div style={{ height: 12 }} />
          <div className="modal-section-label">답변</div>
          <div className="modal-text answer">{item.answer}</div>
        </div>
      </div>
    </div>
  )
}
