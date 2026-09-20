import type { Metadata } from 'next'

// 관리자 화면은 어디에도 링크하지 않고 주소로만 들어갑니다.
// 검색엔진에도 노출되지 않도록 막아둡니다
export const metadata: Metadata = {
  title: '관리자',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
