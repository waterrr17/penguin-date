'use client'

import { useEffect, useState } from 'react'
import PenguinAvatar from '@/components/PenguinAvatar'
import {
  CATEGORIES,
  DEFAULT_LOOK,
  PENGUIN_LOOK_KEY,
  normalizeLook,
  randomLook,
  type LayerCategory,
  type PenguinLook,
} from '@/config/penguinLook'

interface Props {
  /** 값을 넘기면 제어 모드로 동작합니다 (등록 폼). 없으면 localStorage에 저장합니다 */
  value?: PenguinLook
  onChange?: (look: PenguinLook) => void
  previewSize?: number
}

export default function PenguinCustomizer({
  value,
  onChange,
  previewSize = 240,
}: Props) {
  const controlled = value !== undefined
  const [internal, setInternal] = useState<PenguinLook>(DEFAULT_LOOK)
  const [tab, setTab] = useState<LayerCategory>('body')
  // 복원이 끝나기 전에 기본값을 덮어쓰지 않도록 합니다
  const [restored, setRestored] = useState(false)

  const look = controlled ? value : internal

  // 마운트 시 localStorage에서 복원
  // (초기 state로 읽으면 프리렌더 결과와 달라져 hydration 오류가 납니다)
  useEffect(() => {
    if (controlled) return
    try {
      const saved = localStorage.getItem(PENGUIN_LOOK_KEY)
      if (saved) setInternal(normalizeLook(JSON.parse(saved)))
    } catch {
      // 저장값이 깨졌으면 기본 펭귄으로 시작합니다
    }
    setRestored(true)
  }, [controlled])

  useEffect(() => {
    if (controlled || !restored) return
    localStorage.setItem(PENGUIN_LOOK_KEY, JSON.stringify(internal))
  }, [controlled, internal, restored])

  const apply = (next: PenguinLook) => {
    if (controlled) onChange?.(next)
    else setInternal(next)
  }

  const select = (category: LayerCategory, name: string | null) =>
    apply({ ...look, [category]: name })

  const current = CATEGORIES.find((c) => c.key === tab)!

  return (
    <div className="flex flex-col gap-5">
      {/* ── 미리보기 ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-3xl bg-white border border-peri-100 shadow-sm p-4">
          <PenguinAvatar look={look} size={previewSize} />
        </div>
        <button
          type="button"
          onClick={() => apply(randomLook())}
          className="min-h-[44px] px-5 rounded-full bg-peri-400 hover:bg-peri-500 active:scale-[0.98] text-white text-sm font-semibold shadow-md shadow-peri-200 transition-all duration-150"
        >
          🎲 랜덤
        </button>
      </div>

      {/* ── 카테고리 탭 ── */}
      <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setTab(category.key)}
            className={`min-h-[44px] px-4 rounded-full text-sm font-medium shrink-0 transition-all duration-150 ${
              tab === category.key
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-peri-100 hover:bg-peri-50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* ── 옵션 썸네일 (이름 없이 펭귄 모습으로만 고릅니다) ── */}
      <div className="grid grid-cols-4 gap-2">
        {current.optional && (
          <OptionThumb
            label={`${current.label} 없음`}
            isNone
            selected={look[current.key] === null}
            onClick={() => select(current.key, null)}
            look={previewLook(look, current.key, null)}
          />
        )}

        {current.options.map((option) => (
          <OptionThumb
            key={option.name}
            label={option.label}
            selected={look[current.key] === option.name}
            onClick={() => select(current.key, option.name)}
            look={previewLook(look, current.key, option.name)}
          />
        ))}
      </div>
    </div>
  )
}

// 썸네일용 조합: 현재 몸 색 위에 해당 옵션 하나만 얹어 보여줍니다
function previewLook(
  base: PenguinLook,
  category: LayerCategory,
  name: string | null,
): PenguinLook {
  const next: PenguinLook = { ...DEFAULT_LOOK, body: base.body }
  if (category === 'body') next.body = name ?? base.body
  else next[category] = name
  return next
}

/* ── 내부 컴포넌트 ── */

function OptionThumb({
  label,
  look,
  selected,
  onClick,
  isNone = false,
}: {
  /** 화면에는 안 보이고 스크린 리더용으로만 씁니다 */
  label: string
  look: PenguinLook
  selected: boolean
  onClick: () => void
  isNone?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={`relative p-1 rounded-2xl border-2 transition-all duration-150 ${
        selected
          ? 'bg-peri-50 border-peri-400 shadow-sm'
          : 'bg-white border-peri-100 hover:border-peri-200 active:scale-[0.97]'
      }`}
    >
      <PenguinAvatar look={look} size={64} fluid />
      {/* '없음'은 글자 대신 표식으로 알려줍니다 */}
      {isNone && (
        <span
          aria-hidden
          className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold leading-none"
        >
          ✕
        </span>
      )}
    </button>
  )
}
