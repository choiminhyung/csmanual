'use client'
import { useRef, useState } from 'react'
import type { ToastType } from './Toast'

interface Props {
  showToast: (msg: string, type?: ToastType) => void
}

export default function ChatTab({ showToast }: Props) {
  const [staffName,  setStaffName]  = useState('')
  const [customerId, setCustomerId] = useState('')
  const [question,   setQuestion]   = useState('')
  const [answer,     setAnswer]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [errStaff,   setErrStaff]   = useState('')
  const [errQuestion, setErrQuestion] = useState('')
  const isLoading = useRef(false)

  function validate() {
    let ok = true
    if (!staffName.trim())  { setErrStaff('담당자명은 필수 입력 항목입니다.');   ok = false }
    if (!question.trim())   { setErrQuestion('고객 질문은 필수 입력 항목입니다.'); ok = false }
    return ok
  }

  async function generate() {
    if (isLoading.current) return
    if (!validate()) return

    isLoading.current = true
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, question, staff_name: staffName }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.detail ?? `오류 (${res.status})`)
      setAnswer(data.answer)
    } catch (e: unknown) {
      const msg = e instanceof Error && e.message.includes('Failed to fetch')
        ? '서버에 연결할 수 없습니다.'
        : (e instanceof Error ? e.message : '오류가 발생했습니다.')
      showToast(msg, 'error')
    } finally {
      isLoading.current = false
      setLoading(false)
    }
  }

  async function copyAnswer() {
    if (!answer) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(answer)
      } else {
        const ta = document.createElement('textarea')
        ta.value = answer
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'
        document.body.appendChild(ta)
        ta.focus(); ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      showToast('클립보드에 복사되었습니다.')
    } catch {
      showToast('복사에 실패했습니다.', 'error')
    }
  }

  return (
    <>
      <div className="card">
        <div className="section-heading">응대 정보</div>
        <div className="form-row">
          <div className="form-group">
            <label>담당자명<span className="req">*</span></label>
            <input
              value={staffName}
              onChange={(e) => { setStaffName(e.target.value); setErrStaff('') }}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="김민지"
              className={errStaff ? 'field-error' : ''}
            />
            <span className="error-msg">{errStaff}</span>
          </div>
          <div className="form-group">
            <label>고객 ID</label>
            <input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="CU001"
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label>고객 질문<span className="req">*</span></label>
          <textarea
            value={question}
            onChange={(e) => { setQuestion(e.target.value); setErrQuestion('') }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
            placeholder={'고객이 문의한 내용을 입력하세요.\nEnter로 답변 생성, Shift+Enter로 줄바꿈합니다.'}
            className={errQuestion ? 'field-error' : ''}
          />
          <span className="error-msg">{errQuestion}</span>
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? '생성 중...' : '답변 생성'}
        </button>
      </div>

      {answer && (
        <div className="card">
          <div className="answer-label">생성된 답변</div>
          <div className="answer-box">{answer}</div>
          <div className="answer-actions">
            <button className="btn btn-ghost btn-sm" onClick={copyAnswer}>복사</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setAnswer('')}>초기화</button>
          </div>
        </div>
      )}
    </>
  )
}
