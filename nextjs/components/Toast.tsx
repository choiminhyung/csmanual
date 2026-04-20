'use client'
import { useEffect, useRef } from 'react'

export type ToastType  = 'info' | 'error'
export type ToastState = { message: string; type: ToastType } | null

interface Props {
  toast: ToastState
  onClear: () => void
}

export default function Toast({ toast, onClear }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!toast) return
    clearTimeout(timer.current)
    timer.current = setTimeout(onClear, toast.type === 'error' ? 4000 : 2500)
  }, [toast, onClear])

  return (
    <div className={`toast ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'toast-error' : ''}`}>
      {toast?.message}
    </div>
  )
}
