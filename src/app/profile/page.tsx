'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SAMPLE_PROFILES } from '@/data/sampleProfiles'
import { fetchProfileById } from '@/lib/supabase'
import { ageFromBirthYear, birthYearLabel } from '@/lib/age'
import { assetPath } from '@/lib/paths'
import type { Profile } from '@/types'

const GENDER_STYLE = {
  male: { badge: 'bg-sky-100 text-sky-500', avatar: 'bg-sky-50' },
  female: { badge: 'bg-rose-100 text-rose-400', avatar: 'bg-rose-50' },
} as const

export default function ProfileDetailPage() {
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
          href="/browse"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors text-lg"
        >
          ←
        </Link>
        <h1 className="font-display text-xl text-slate-800">
          프로필 상세 🐧
        </h1>
      </header>

      {/* useSearchParams는 정적 빌드에서 Suspense 경계가 필요합니다 */}
      <Suspense fallback={<LoadingPenguin />}>
        <ProfileDetail />
      </Suspense>
    </main>
  )
}

function ProfileDetail() {
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') ?? null

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    fetchProfileById(id)
      .then(data => {
        if (cancelled) return
        // DB 미설정 시 샘플 데이터에서 조회
        setProfile(data ?? SAMPLE_PROFILES.find(p => p.id === id) ?? null)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LoadingPenguin />

  if (!profile) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 flex flex-col items-center gap-3 text-center">
        <span className="text-5xl">🐧</span>
        <p className="text-sm text-slate-400 leading-relaxed">
          프로필을 찾을 수 없어요
          <br />
          삭제되었거나 잘못된 주소일 수 있어요
        </p>
        <Link
          href="/browse"
          className="mt-1 px-5 py-2 rounded-full bg-sky-400 hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
        >
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const style = GENDER_STYLE[profile.gender]

  return (
    <div className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── 프로필 요약 카드 ── */}
      <section className="bg-white rounded-3xl border border-sky-100 p-6 flex flex-col items-center gap-3 shadow-sm">
        <div
          className={`w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center text-6xl ${style.avatar}`}
        >
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetPath(profile.photoUrl)}
              alt={`${profile.name} 프로필 사진`}
              className="w-full h-full object-cover"
            />
          ) : (
            '🐧'
          )}
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
            {profile.gender === 'male' ? '남성' : '여성'}
          </span>
        </div>

        <p className="text-sm text-slate-400">
          {birthYearLabel(profile.birthYear)}({ageFromBirthYear(profile.birthYear)}세)
        </p>
      </section>

      {/* ── 주선자 표시 ── */}
      {profile.matchmakerName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-sky-50/70 rounded-xl px-3 py-2">
          <span>💌</span>
          <span>
            <b className="text-sky-500 font-semibold">{profile.matchmakerName}</b>
            과 {profile.relationship ? `${profile.relationship}` : '...'}
          </span>
        </div>
      )}

      {/* ── 기본 정보 ── */}
      <Section title="기본 정보">
        <div className="bg-white rounded-2xl border border-sky-100 divide-y divide-sky-50 overflow-hidden">
          <InfoRow label="출생연도" value={`${profile.birthYear}년 (${ageFromBirthYear(profile.birthYear)}세)`} />
          <InfoRow label="키" value={profile.height ? `${profile.height}cm` : '미입력'} />
          <InfoRow label="직업" value={profile.job || '미입력'} />
          <InfoRow label="MBTI" value={profile.mbti || '미입력'} />
          <InfoRow label="거주지" value={profile.residence || '미입력'} />
          <InfoRow label="음주" value={profile.drinking || '미입력'} />
          <InfoRow label="흡연" value={profile.smoking || '미입력'} />
          <InfoRow label="종교" value={profile.religion || '미입력'} />
        </div>
      </Section>

      {/* ── 자기소개 ── */}
      <Section title="자기소개">
        <div className="bg-white rounded-2xl border border-sky-100 px-4 py-3.5">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {profile.bio || '아직 자기소개가 없어요'}
          </p>
        </div>
      </Section>

      {/* ── 등록일 ── */}
      <p className="text-center text-xs text-slate-300">
        {new Date(profile.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}{' '}
        등록
      </p>

      <div className="h-6" />
    </div>
  )
}

/* ── 내부 컴포넌트 ── */

function LoadingPenguin() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
      <span className="text-4xl animate-bounce">🐧</span>
      <p className="text-sm">프로필을 불러오는 중...</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-xs text-sky-400 tracking-[0.15em] uppercase px-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-14 text-xs text-slate-400 shrink-0">{label}</span>
      <span className="flex-1 text-sm text-slate-700">{value}</span>
    </div>
  )
}
