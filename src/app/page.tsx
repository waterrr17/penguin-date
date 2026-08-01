import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, #F7FBFF 0%, #E6F1FC 45%, #CFE3F7 100%)',
      }}
    >

      {/* 로고 / 소개 섹션 */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-4">
        {/* 펭귄 로고 */}
        <div className="w-24 h-24 rounded-full bg-white shadow-md shadow-peri-100 border border-peri-100 flex items-center justify-center text-5xl animate-bounce-slow">
          🐧
        </div>

        {/* 서비스명 */}
        <h1 className="font-display text-3xl text-slate-800 tracking-tight text-center">
          펭귄팅
        </h1>

        {/* 설명 */}
        <p className="text-slate-400 text-sm text-center leading-relaxed">
          한 번의 프로필 등록으로 <br />
          연애 성공할 때까지
        </p>

        {/* 작은 구분선 */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-peri-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-peri-300" />
        </div>
      </div>

      {/* 빙하 버튼 섹션 — 좌우 분할, 빙산 오브젝트 */}
      <div className="flex h-64 gap-2 px-2">

        {/* 프로필 등록하기 — 빙산 */}
        <Link
          href="/register"
          className="iceberg iceberg-a flex-1 relative flex flex-col items-center justify-end gap-2 pb-8 text-peri-700 hover:-translate-y-1 active:translate-y-0 transition-transform duration-300"
        >
          <span className="absolute top-10 left-1/4 w-10 h-10 rounded-full bg-white/60 blur-xl pointer-events-none" />
          <span className="text-4xl drop-shadow-sm">✏️</span>
          <span className="text-base font-semibold tracking-wide drop-shadow-sm">프로필 등록하기</span>
          <span className="text-xs text-peri-600/80">이상형을 알려주세요</span>
        </Link>

        {/* 프로필 둘러보기 — 빙산 */}
        <Link
          href="/browse"
          className="iceberg iceberg-b flex-1 relative flex flex-col items-center justify-end gap-2 pb-8 text-white hover:-translate-y-1 active:translate-y-0 transition-transform duration-300"
        >
          <span className="absolute top-8 right-1/4 w-12 h-12 rounded-full bg-white/40 blur-xl pointer-events-none" />
          <span className="text-4xl drop-shadow-sm">💌</span>
          <span className="text-base font-semibold tracking-wide drop-shadow-sm">프로필 둘러보기</span>
          <span className="text-xs text-white/80">내 이상형 찾아보기</span>
        </Link>

      </div>

    </main>
  )
}
