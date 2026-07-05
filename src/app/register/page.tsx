'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PROFILE_IMAGES } from '@/config/profileAssets'
import { SAMPLE_MATCHMAKERS } from '@/data/sampleProfiles'
import { fetchMatchmakers, insertProfile } from '@/lib/supabase'
import { assetPath } from '@/lib/paths'
import type { Matchmaker } from '@/types'

const RELATIONSHIP_OPTIONS = ['친구', '직장동료', '학교동창', '동네친구', '지인', '기타']

type Gender = 'male' | 'female' | ''

interface FormState {
  name: string
  birthYear: string
  gender: Gender
  height: string
  job: string
  matchmakerId: string
  relationship: string
  bio: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [matchmakers, setMatchmakers] = useState<Matchmaker[]>([])
  const [form, setForm] = useState<FormState>({
    name: '',
    birthYear: '',
    gender: '',
    height: '',
    job: '',
    matchmakerId: '',
    relationship: '',
    bio: '',
  })

  // 주선자 목록 로드 (DB 미설정 시 샘플 주선자)
  useEffect(() => {
    let cancelled = false
    fetchMatchmakers()
      .then(data => {
        if (!cancelled) setMatchmakers(data ?? SAMPLE_MATCHMAKERS)
      })
      .catch(() => {
        if (!cancelled) setMatchmakers(SAMPLE_MATCHMAKERS)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!form.name.trim() || !form.birthYear || !form.gender) {
      alert('이름, 출생연도, 성별은 꼭 입력해 주세요 🐧')
      return
    }

    setSubmitting(true)
    try {
      const saved = await insertProfile({
        name: form.name.trim(),
        birthYear: Number(form.birthYear),
        gender: form.gender,
        height: form.height ? Number(form.height) : null,
        job: form.job.trim(),
        matchmakerId: form.matchmakerId || null,
        relationship: form.relationship,
        bio: form.bio.trim(),
        photoUrl: selectedPhoto ? `/assets/profiles/${selectedPhoto}` : null,
      })

      if (!saved) {
        alert('아직 DB가 연결되지 않았어요. 관리자에게 문의해 주세요 🐧')
        return
      }

      alert('프로필이 등록되었어요! 🎉')
      router.push('/browse')
    } catch (err) {
      alert(err instanceof Error ? err.message : '등록 중 문제가 생겼어요. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

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
        <h1
          className="text-xl font-bold text-slate-800"
          style={{ fontFamily: "'Gaegu', cursive" }}
        >
          프로필 등록하기 🐧
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-5">

        {/* ── 프로필 사진 ── */}
        <Section title="프로필 사진">
          {PROFILE_IMAGES.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-sky-200 p-6 flex flex-col items-center gap-2 text-center">
              <span className="text-5xl">🐧</span>
              <p className="text-sm text-slate-400 leading-relaxed">
                <code className="text-xs bg-sky-50 text-sky-500 px-1.5 py-0.5 rounded">
                  public/assets/profiles/
                </code>
                <br />에 이미지를 추가하면 선택할 수 있어요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {PROFILE_IMAGES.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedPhoto(selectedPhoto === img ? null : img)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-150 ${
                    selectedPhoto === img
                      ? 'border-sky-400 shadow-lg shadow-sky-100 scale-[0.96]'
                      : 'border-transparent hover:border-sky-200'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetPath(`/assets/profiles/${img}`)}
                    alt="프로필 사진 옵션"
                    className="w-full h-full object-cover"
                  />
                  {selectedPhoto === img && (
                    <div className="absolute inset-0 bg-sky-400/20 flex items-center justify-center">
                      <span className="text-xl">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* ── 기본 정보 ── */}
        <Section title="기본 정보">
          <div className="bg-white rounded-2xl border border-sky-100 divide-y divide-sky-50 overflow-hidden">

            <Row label="이름">
              <input
                type="text"
                placeholder="홍길동"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className={inputCls}
              />
            </Row>

            <Row label="출생연도">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="1998"
                  min={1950}
                  max={2010}
                  value={form.birthYear}
                  onChange={e => set('birthYear', e.target.value)}
                  className={inputCls}
                />
                <span className="text-slate-300 text-sm shrink-0">년생</span>
              </div>
            </Row>

            <Row label="성별">
              <div className="flex gap-1.5">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('gender', g)}
                    className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                      form.gender === g
                        ? g === 'male'
                          ? 'bg-sky-400 text-white shadow-sm'
                          : 'bg-rose-300 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'male' ? '남성' : '여성'}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="키">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="170"
                  min={140}
                  max={220}
                  value={form.height}
                  onChange={e => set('height', e.target.value)}
                  className={inputCls}
                />
                <span className="text-slate-300 text-sm shrink-0">cm</span>
              </div>
            </Row>

            <Row label="직업">
              <input
                type="text"
                placeholder="개발자"
                value={form.job}
                onChange={e => set('job', e.target.value)}
                className={inputCls}
              />
            </Row>

          </div>
        </Section>

        {/* ── 주선 정보 ── */}
        <Section title="주선 정보">
          <div className="bg-white rounded-2xl border border-sky-100 divide-y divide-sky-50 overflow-hidden">

            <Row label="주선자">
              <select
                value={form.matchmakerId}
                onChange={e => set('matchmakerId', e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">주선자 선택</option>
                {matchmakers.map(mm => (
                  <option key={mm.id} value={mm.id}>{mm.name}</option>
                ))}
              </select>
            </Row>

            <Row label="관계">
              <select
                value={form.relationship}
                onChange={e => set('relationship', e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">관계 선택</option>
                {RELATIONSHIP_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Row>

          </div>
        </Section>

        {/* ── 자기소개 ── */}
        <Section title="자기소개">
          <textarea
            placeholder="간단하게 자기소개를 적어주세요 🐧&#10;취미, 성격, 어떤 사람인지..."
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            rows={4}
            className="w-full bg-white rounded-2xl border border-sky-100 px-4 py-3.5 text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
          />
        </Section>

        {/* ── 등록 버튼 ── */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-sky-400 hover:bg-sky-500 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white font-bold text-base tracking-wide transition-all duration-150 shadow-md shadow-sky-200"
        >
          {submitting ? '등록 중...' : '등록하기 🐧'}
        </button>

        <div className="h-6" />
      </form>
    </main>
  )
}

/* ── 내부 컴포넌트 ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2
        className="text-xs font-bold text-sky-400 tracking-widest uppercase px-1"
        style={{ fontFamily: "'Gaegu', cursive", letterSpacing: '0.15em' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-12 text-xs text-slate-400 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

const inputCls =
  'w-full text-sm text-slate-700 placeholder-slate-300 bg-transparent focus:outline-none'
