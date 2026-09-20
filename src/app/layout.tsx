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

// 카카오톡 등 공유 미리보기는 상대 경로를 못 읽으므로 절대 주소가 필요합니다
const SITE_URL = 'https://waterrr17.github.io/penguin-date'
const TITLE = '펭귄팅 🐧'
const DESCRIPTION = '친구가 소개해주는 비공개 소개팅'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: `${SITE_URL}/favicon.svg`,
    apple: `${SITE_URL}/favicon.svg`,
  },
  openGraph: {
    type: 'website',
    siteName: '펭귄팅',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'ko_KR',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '펭귄팅 — 친구가 소개해주는 비공개 소개팅',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
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
