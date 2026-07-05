import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: '#f0f9ff',
        backgroundImage: `radial-gradient(circle, #bae6fd 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >

      {/* 로고 / 소개 섹션 */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-4">
        {/* 펭귄 로고 */}
        <div className="w-24 h-24 rounded-full bg-white shadow-md shadow-sky-100 border border-sky-100 flex items-center justify-center text-5xl animate-bounce-slow">
          🐧
        </div>

        {/* 서비스명 */}
        <h1
          className="text-5xl font-bold text-slate-800 tracking-tight"
          style={{ fontFamily: "'Gaegu', cursive" }}
        >
          펭귄팅
        </h1>

        {/* 설명 */}
        <p className="text-slate-500 text-base text-center leading-relaxed">
          친구들이 소개해주는 소개팅 서비스
        </p>

        {/* 작은 구분선 */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
        </div>
      </div>

      {/* 버튼 섹션 — 좌우 분할 */}
      <div className="flex h-52 rounded-t-3xl overflow-hidden shadow-[0_-8px_24px_-12px_rgba(56,189,248,0.35)]">

        {/* 프로필 등록하기 */}
        <Link
          href="/register"
          className="flex-1 flex flex-col items-center justify-center gap-3 bg-sky-400 hover:bg-sky-500 active:bg-sky-600 transition-colors text-white"
        >
          <span className="text-4xl">✏️</span>
          <span className="text-base font-semibold tracking-wide">프로필 등록하기</span>
          <span className="text-xs text-sky-100">친구를 소개해 주세요</span>
        </Link>

        {/* 구분선 */}
        <div className="w-px bg-white/30" />

        {/* 프로필 둘러보기 */}
        <Link
          href="/browse"
          className="flex-1 flex flex-col items-center justify-center gap-3 bg-rose-300 hover:bg-rose-400 active:bg-rose-500 transition-colors text-white"
        >
          <span className="text-4xl">💌</span>
          <span className="text-base font-semibold tracking-wide">프로필 둘러보기</span>
          <span className="text-xs text-rose-100">어떤 펭귄이 있을까요?</span>
        </Link>

      </div>

    </main>
  )
}
