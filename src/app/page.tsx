import Link from 'next/link'
import PenguinAvatar from '@/components/PenguinAvatar'
import PenguinCount from '@/components/PenguinCount'
import type { PenguinLook } from '@/config/penguinLook'

// 랜딩에 나란히 세워둘 펭귄 3마리
const HERO_PENGUINS: PenguinLook[] = [
  { body: 'ice', hat: 'beanie', glasses: null, neck: 'scarf', item: null },
  { body: 'navy', hat: null, glasses: 'heart', neck: 'bowtie', item: null },
  { body: 'coral', hat: 'crown', glasses: null, neck: null, item: 'cocktail' },
]

const STEPS = [
  { emoji: '🎨', text: '펭귄 꾸미고 프로필 등록' },
  { emoji: '💌', text: '주선자가 연결해줘요' },
  { emoji: '☕', text: '맘에 들면 연락처 교환' },
]

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, #F7FBFF 0%, #E6F1FC 45%, #CFE3F7 100%)',
      }}
    >
      {/* 소개 섹션 */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 gap-4">
        {/* 펭귄 3마리 — 가운데가 살짝 큽니다 */}
        <div className="flex items-end justify-center gap-1">
          <PenguinAvatar look={HERO_PENGUINS[0]} size={64} />
          <PenguinAvatar
            look={HERO_PENGUINS[1]}
            size={88}
            className="animate-bounce-slow"
          />
          <PenguinAvatar look={HERO_PENGUINS[2]} size={64} />
        </div>

        {/* 서비스명 */}
        <h1 className="font-display text-3xl text-slate-800 tracking-tight text-center">
          펭귄팅
        </h1>

        <p className="text-slate-500 text-sm text-center leading-relaxed -mt-2">
          친구가 소개해주는 비공개 소개팅
        </p>

        {/* 이용 방법 3단계 */}
        <ol className="w-full max-w-xs mt-2 flex flex-col gap-1.5">
          {STEPS.map((step, i) => (
            <li
              key={step.text}
              className="flex items-center gap-2.5 rounded-2xl bg-white/70 border border-peri-100 px-3.5 py-2.5"
            >
              <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-peri-400 text-white text-[11px] font-bold">
                {i + 1}
              </span>
              <span className="text-lg leading-none">{step.emoji}</span>
              <span className="text-[13px] text-slate-600 font-medium">
                {step.text}
              </span>
            </li>
          ))}
        </ol>

        <PenguinCount />
      </div>

      {/* 빙하 버튼 섹션 — 좌우 분할, 빙산 오브젝트 */}
      <div className="flex h-56 gap-2 px-2 shrink-0">
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
