'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { SAMPLE_PROFILES } from '@/data/sampleProfiles'
import {
  deleteProfile,
  fetchProfileById,
  setProfileActive,
  verifyProfilePassword,
} from '@/lib/supabase'
import { EDIT_PASSWORD_KEY } from '@/lib/editAuth'
import { birthYearLabel } from '@/lib/age'
import { assetPath } from '@/lib/paths'
import type { Profile } from '@/types'

type ManageAction = 'edit' | 'delete' | 'toggle'

const ACTION_LABEL: Record<ManageAction, string> = {
  edit: '수정하기',
  delete: '삭제하기',
  toggle: '상태 변경',
}

const GENDER_STYLE = {
  male: { badge: 'bg-peri-100 text-peri-500', avatar: 'bg-peri-50' },
  female: { badge: 'bg-rose-100 text-rose-400', avatar: 'bg-rose-50' },
} as const

export default function ProfileDetailPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: '#FFEABB',
        backgroundImage: `radial-gradient(circle, #FD7979 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-peri-100 flex items-center gap-3 px-4 h-14">
        <Link
          href="/browse"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-peri-50 text-peri-500 hover:bg-peri-100 transition-colors text-lg"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') ?? null

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // 수정/삭제/비활성화 비밀번호 모달
  const [action, setAction] = useState<ManageAction | null>(null)
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)

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

  const closeModal = () => {
    setAction(null)
    setPassword('')
  }

  // 비밀번호 확인 후 액션 실행
  const handleConfirm = async () => {
    if (!profile || processing) return
    if (!/^\d{4}$/.test(password)) {
      alert('비밀번호는 숫자 4자리예요 🐧')
      return
    }

    setProcessing(true)
    try {
      const verified = await verifyProfilePassword(profile.id, password)
      if (verified === null) {
        alert('아직 DB가 연결되지 않았어요 🐧')
        return
      }
      if (!verified) {
        alert('비밀번호가 일치하지 않아요 🐧')
        return
      }

      if (action === 'edit') {
        sessionStorage.setItem(EDIT_PASSWORD_KEY, password)
        closeModal()
        router.push(`/register?edit=${profile.id}`)
        return
      }

      if (action === 'delete') {
        if (!confirm('정말 삭제할까요? 삭제하면 되돌릴 수 없어요 🐧')) return
        await deleteProfile(profile.id, password)
        closeModal()
        alert('프로필이 삭제되었어요')
        router.push('/browse')
        return
      }

      // 활성화/비활성화 토글
      const nextActive = !profile.isActive
      await setProfileActive(profile.id, password, nextActive)
      setProfile({ ...profile, isActive: nextActive })
      closeModal()
      alert(nextActive ? '프로필을 다시 활성화했어요 🎉' : '프로필을 비활성화했어요 💤')
    } catch (err) {
      alert(err instanceof Error ? err.message : '처리 중 문제가 생겼어요. 다시 시도해 주세요.')
    } finally {
      setProcessing(false)
    }
  }

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
          className="mt-1 px-5 py-2 rounded-full bg-peri-400 hover:bg-peri-500 text-white text-sm font-semibold transition-colors"
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
      <section className="bg-white rounded-3xl border border-peri-100 p-6 flex flex-col items-center gap-3 shadow-sm">
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
          {!profile.isActive && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-500">
              쉬는 중
            </span>
          )}
        </div>

        <p className="text-sm text-slate-400">
          {birthYearLabel(profile.birthYear)}
        </p>
      </section>

      {/* ── 주선자 표시 ── */}
      {profile.matchmakerName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-peri-50/70 rounded-xl px-3 py-2">
          <span>💌</span>
          <span>
            <b className="text-peri-500 font-semibold">{profile.matchmakerName}</b>
            과 {profile.relationship ? `${profile.relationship}` : '...'}
          </span>
        </div>
      )}

      {/* ── 기본 정보 ── */}
      <Section title="기본 정보">
        <div className="bg-white rounded-2xl border border-peri-100 divide-y divide-peri-50 overflow-hidden">
          <InfoRow label="출생연도" value={`${profile.birthYear}년`} />
          <InfoRow label="키" value={profile.height ? `${profile.height}cm` : '미입력'} />
          <InfoRow label="직업" value={profile.job || '미입력'} />
          <InfoRow label="MBTI" value={profile.mbti || '미입력'} />
          <InfoRow label="거주지" value={profile.residence || '미입력'} />
          <InfoRow label="음주" value={profile.drinking || '미입력'} />
          <InfoRow label="흡연" value={profile.smoking || '미입력'} />
          <InfoRow label="종교" value={profile.religion || '미입력'} />
        </div>
      </Section>

      {/* ── 이상형 ── */}
      <Section title="이상형">
        <div className="bg-white rounded-2xl border border-peri-100 divide-y divide-peri-50 overflow-hidden">
          <InfoRow
            label="출생연도"
            value={rangeLabel(profile.idealBirthYearMin, profile.idealBirthYearMax, '년생')}
          />
          <InfoRow
            label="키"
            value={rangeLabel(profile.idealHeightMin, profile.idealHeightMax, 'cm')}
          />
          <InfoRow label="외모" value={profile.idealAppearance || '미입력'} />
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xs text-slate-400 shrink-0 leading-relaxed">
              포기할 수 없는
              <br />한 가지
            </span>
            <span className="flex-1 text-sm text-slate-700">
              {profile.idealMustHave || '미입력'}
            </span>
          </div>
        </div>
      </Section>

      {/* ── 한마디 ── */}
      <Section title="한마디">
        <div className="bg-white rounded-2xl border border-peri-100 px-4 py-3.5">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {profile.bio || '아직 한마디가 없어요'}
          </p>
        </div>
      </Section>

      {/* ── 관리 버튼 ── */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAction('edit')}
          className="flex-1 py-3 rounded-2xl bg-peri-400 hover:bg-peri-500 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150"
        >
          수정하기
        </button>
        <button
          type="button"
          onClick={() => setAction('toggle')}
          className="flex-1 py-3 rounded-2xl bg-slate-400 hover:bg-slate-500 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150"
        >
          {profile.isActive ? '비활성화' : '활성화'}
        </button>
        <button
          type="button"
          onClick={() => setAction('delete')}
          className="flex-1 py-3 rounded-2xl bg-rose-400 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150"
        >
          삭제하기
        </button>
      </div>

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

      {/* ── 비밀번호 확인 모달 ── */}
      {action && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center px-6"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-xl flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-display text-lg text-slate-800">
              비밀번호 확인 🔒
            </h2>
            <p className="text-xs text-slate-400 -mt-2">
              {ACTION_LABEL[action]}에는 등록할 때 입력한 비밀번호가 필요해요
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              placeholder="숫자 4자리"
              value={password}
              onChange={e => setPassword(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirm()
              }}
              className="w-full bg-peri-50 rounded-2xl px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-700 placeholder-slate-300 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-peri-200"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-semibold transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={processing}
                className="flex-1 py-3 rounded-2xl bg-peri-400 hover:bg-peri-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {processing ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 이상형 범위 표시: 둘 다 있으면 "A ~ B", 한쪽만 있으면 "이상/이하"
function rangeLabel(min: number | null, max: number | null, unit: string) {
  if (min === null && max === null) return '미입력'
  if (min !== null && max !== null) return `${min}${unit} ~ ${max}${unit}`
  if (min !== null) return `${min}${unit} 이상`
  return `${max}${unit} 이하`
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
      <h2 className="font-display text-xs text-peri-400 tracking-[0.15em] uppercase px-1">
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
