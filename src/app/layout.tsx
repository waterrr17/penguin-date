import type { Metadata } from 'next'
import { Do_Hyeon, Noto_Sans_KR } from 'next/font/google'
import '../styles/globals.css'

// 본문 폰트
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
})

// 제목 폰트
const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-do-hyeon',
})

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
    <html lang="ko" className={`${notoSansKr.variable} ${doHyeon.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
