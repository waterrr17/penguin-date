'use client'

import { useState } from 'react'
import PenguinAvatar from '@/components/PenguinAvatar'
import { profileLook } from '@/lib/profileLook'
import type { Profile } from '@/types'

interface Props {
  profiles: Profile[]
  /** 지금 고른 내 펭귄 */
  me: Profile | null
  onSelect: (id: string | null) => void
}

// 궁합을 보려면 "내가 누구인지" 알아야 해서 목록에서 고르게 합니다.
// 1단계에서는 공개된 정보로 계산만 하므로 비밀번호를 묻지 않습니다
// (관심 보내기를 붙일 때 비밀번호 확인이 들어갑니다)
export default function MyPenguinPicker({ profiles, me, onSelect }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start min-h-[36px] pl-1.5 pr-3 flex items-center gap-1.5 rounded-full bg-white/80 border border-peri-200 hover:bg-white text-xs font-medium text-slate-600 transition-colors"
      >
        {me ? (
          <>
            <PenguinAvatar look={profileLook(me)} size={24} />
            <span className="font-semibold text-peri-600">{me.name}</span>
            <span className="text-slate-400">· 내 펭귄 바꾸기</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none pl-1">🐧</span>
            <span>내 펭귄 고르고 궁합 보기</span>
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-6"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-slate-800">
                내 펭귄은? 🐧
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-peri-50 text-peri-500 hover:bg-peri-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 -mt-2">
              고르면 이상형 조건이 서로 맞는 펭귄에 ✨ 표시가 붙어요
            </p>

            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    onSelect(profile.id)
                    setOpen(false)
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all duration-150 ${
                    me?.id === profile.id
                      ? 'bg-peri-50 border-peri-400'
                      : 'bg-white border-peri-100 hover:border-peri-200 active:scale-[0.97]'
                  }`}
                >
                  <PenguinAvatar look={profileLook(profile)} size={48} fluid />
                  <span className="text-[11px] text-slate-600 truncate w-full text-center">
                    {profile.name}
                  </span>
                </button>
              ))}
            </div>

            {me && (
              <button
                type="button"
                onClick={() => {
                  onSelect(null)
                  setOpen(false)
                }}
                className="min-h-[40px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-semibold transition-colors"
              >
                선택 해제
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
