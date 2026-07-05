'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ProfileCard from '@/components/ProfileCard'
import { SAMPLE_PROFILES } from '@/data/sampleProfiles'
import { fetchProfiles } from '@/lib/supabase'
import { ageFromBirthYear } from '@/lib/age'
import type { Profile } from '@/types'

type GenderFilter = 'all' | 'male' | 'female'
type AgeFilter = 'all' | '20-24' | '25-29' | '30+'

const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: 'all', label: '전체 나이' },
  { value: '20-24', label: '20~24세' },
  { value: '25-29', label: '25~29세' },
  { value: '30+', label: '30세 이상' },
]

const matchAge = (birthYear: number, filter: AgeFilter) => {
  const age = ageFromBirthYear(birthYear)
  if (filter === '20-24') return age >= 20 && age <= 24
  if (filter === '25-29') return age >= 25 && age <= 29
  if (filter === '30+') return age >= 30
  return true
}

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isSample, setIsSample] = useState(false)
  const [gender, setGender] = useState<GenderFilter>('all')
  const [ageRange, setAgeRange] = useState<AgeFilter>('all')

  useEffect(() => {
    let cancelled = false
    fetchProfiles()
      .then(data => {
        if (cancelled) return
        // DB 미설정(null) 시 샘플 데이터로 대체
        setProfiles(data ?? SAMPLE_PROFILES)
        setIsSample(data === null)
      })
      .catch(() => {
        if (cancelled) return
        setProfiles(SAMPLE_PROFILES)
        setIsSample(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () =>
      profiles.filter(
        p => (gender === 'all' || p.gender === gender) && matchAge(p.birthYear, ageRange),
      ),
    [profiles, gender, ageRange],
  )

  return (
    <main
      className="min-h-screen"
      style={{
        background: '#f0f9ff',
        backgroundImage: `radial-gradient(circle, #bae6fd 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-sky-100 flex items-center gap-3 px-4 h-14">
        <Link
          href="/"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors text-lg"
        >
          ←
        </Link>
        <h1 className="font-display text-xl text-slate-800">
          프로필 둘러보기 💌
        </h1>
      </header>

      <div className="max-w-sm mx-auto px-4 py-5 flex flex-col gap-4">

        {/* ── 필터 ── */}
        <div className="flex flex-col gap-2">
          {/* 성별 필터 */}
          <div className="flex gap-1.5">
            <FilterChip active={gender === 'all'} onClick={() => setGender('all')}>
              전체
            </FilterChip>
            <FilterChip
              active={gender === 'male'}
              activeCls="bg-sky-400 text-white shadow-sm"
              onClick={() => setGender('male')}
            >
              남성
            </FilterChip>
            <FilterChip
              active={gender === 'female'}
              activeCls="bg-rose-300 text-white shadow-sm"
              onClick={() => setGender('female')}
            >
              여성
            </FilterChip>
          </div>

          {/* 나이 필터 */}
          <div className="flex gap-1.5 flex-wrap">
            {AGE_OPTIONS.map(opt => (
              <FilterChip
                key={opt.value}
                active={ageRange === opt.value}
                onClick={() => setAgeRange(opt.value)}
              >
                {opt.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* 샘플 데이터 안내 */}
        {isSample && !loading && (
          <p className="text-[11px] text-amber-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            아직 DB가 연결되지 않아 샘플 프로필을 보여주고 있어요
          </p>
        )}

        {/* 인원 수 */}
        <p className="text-xs text-slate-400 px-1">
          {!loading && filtered.length > 0
            ? `${filtered.length}명의 외로운 영혼이 기다리고 있어요 🐧`
            : ''}
        </p>

        {/* ── 프로필 목록 ── */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <span className="text-4xl animate-bounce">🐧</span>
            <p className="text-sm">펭귄들을 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-sky-200 px-6 py-12 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🐧</span>
            <p className="text-sm text-slate-400 leading-relaxed">
              조건에 맞는 펭귄이 아직 없어요
              <br />
              필터를 바꾸거나, 친구를 등록해 보세요!
            </p>
            <Link
              href="/register"
              className="mt-1 px-5 py-2 rounded-full bg-sky-400 hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
            >
              프로필 등록하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>
    </main>
  )
}

/* ── 내부 컴포넌트 ── */

function FilterChip({
  active,
  activeCls = 'bg-slate-700 text-white shadow-sm',
  onClick,
  children,
}: {
  active: boolean
  activeCls?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
        active
          ? activeCls
          : 'bg-white text-slate-400 border border-sky-100 hover:bg-sky-50'
      }`}
    >
      {children}
    </button>
  )
}
