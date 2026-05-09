import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: '펭귄팅',
  description: '친구들이 서로를 소개해주는 비공개 소개팅 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
