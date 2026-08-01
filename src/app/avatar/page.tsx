import Link from 'next/link'
import PenguinCustomizer from '@/components/PenguinCustomizer'

export default function AvatarPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(to bottom, #F7FBFF 0%, #E6F1FC 45%, #CFE3F7 100%)',
      }}
    >
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-peri-100 flex items-center gap-3 px-4 h-14">
        <Link
          href="/"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-peri-50 text-peri-500 hover:bg-peri-100 transition-colors text-lg"
        >
          ←
        </Link>
        <h1 className="font-display text-xl text-slate-800">내 펭귄 꾸미기 🐧</h1>
      </header>

      <div className="max-w-sm mx-auto px-4 py-6">
        <PenguinCustomizer />
        <div className="h-6" />
      </div>
    </main>
  )
}
