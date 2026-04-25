'use client'
import { useCallback, useState } from 'react'
import ChatTab    from '@/components/ChatTab'
import HistoryTab from '@/components/HistoryTab'
import AdminTab   from '@/components/AdminTab'
import Toast, { type ToastState, type ToastType } from '@/components/Toast'

type Tab = 'chat' | 'history' | 'admin'

export default function Home() {
  const [tab,   setTab]   = useState<Tab>('chat')
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ message: msg, type })
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  return (
    <>
      <header className="app-header">
        <div className="brand-badge">26</div>
        <span className="brand-name">더여백26 CS</span>
      </header>

      <div className="app-wrap">
        <nav className="tab-nav">
          <button className={`tab-btn ${tab === 'chat'    ? 'active' : ''}`} onClick={() => setTab('chat')}>답변 생성</button>
          <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>응대 내역</button>
          <button className={`tab-btn ${tab === 'admin'   ? 'active' : ''}`} onClick={() => setTab('admin')}>관리</button>
        </nav>

        {tab === 'chat'    && <ChatTab    showToast={showToast} />}
        {tab === 'history' && <HistoryTab showToast={showToast} />}
        {tab === 'admin'   && <AdminTab   showToast={showToast} />}
      </div>

      <Toast toast={toast} onClear={clearToast} />
    </>
  )
}
