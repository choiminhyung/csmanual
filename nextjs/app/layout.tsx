import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '더여백26 CS 챗봇',
  description: '더여백26 고객응대 AI 어시스턴트',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
