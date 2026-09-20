'use client'

import { useCallback, useEffect, useState } from 'react'
import PenguinAvatar from '@/components/PenguinAvatar'
import { birthYearLabel } from '@/lib/age'
import { profileLook } from '@/lib/profileLook'
import { fetchProfiles } from '@/lib/supabase'
import {
  ADMIN_PASSWORD_KEY,
  addMatchmaker,
  adminSetProfileActive,
  deleteMatchmaker,
  fetchAdminMatches,
  fetchMatchmakerStats,
  renameMatchmaker,
  setAdminMatchStatus,
  verifyAdminPassword,
  type AdminMatch,
  type MatchmakerStat,
  type MatchSide,
} from '@/lib/admin'
import type { Profile } from '@/types'

type Tab = 'matchmakers' | 'profiles' | 'matches'

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null)

  // 새로고침해도 탭 이동 정도는 유지되도록 sessionStorage 에서 복원합니다
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PASSWORD_KEY)
    if (saved) setPassword(saved)
  }, [])

  const signOut = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY)
    setPassword(null)
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(to bottom, #F7FBFF 0%, #E6F1FC 45%, #CFE3F7 100%)',
      }}
    >
      <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-md border-b border-peri-100 flex items-center justify-between gap-3 px-4 h-14">
        <h1 className="font-display text-xl text-slate-800">관리자 🔧</h1>
        {password && (
          <button
            type="button"
            onClick={signOut}
            className="min-h-[36px] px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
          >
            나가기
          </button>
        )}
      </header>

      <div className="max-w-sm mx-auto px-4 py-6">
        {password ? (
          <AdminPanel password={password} />
        ) : (
          <PasswordGate onUnlock={setPassword} />
        )}
        <div className="h-8" />
      </div>
    </main>
  )
}

/* ── 비밀번호 입력 ── */

function PasswordGate({ onUnlock }: { onUnlock: (pw: string) => void }) {
  const [value, setValue] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checking || !value) return

    setChecking(true)
    setError(null)
    try {
      const ok = await verifyAdminPassword(value)
      if (ok === null) {
        setError('아직 DB가 연결되지 않았어요')
        return
      }
      if (!ok) {
        setError('비밀번호가 일치하지 않아요')
        return
      }
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, value)
      onUnlock(value)
    } catch (err) {
      setError(err instanceof Error ? err.message : '확인 중 문제가 생겼어요')
    } finally {
      setChecking(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-3xl border border-peri-100 p-6 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-4xl">🔒</span>
        <p className="text-sm text-slate-500">
          관리자 비밀번호를 입력해 주세요
        </p>
      </div>

      <input
        type="password"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="관리자 비밀번호"
        className="w-full bg-peri-50 rounded-2xl px-4 py-3 text-center text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-peri-200"
      />

      {error && (
        <p className="text-xs text-rose-500 text-center -mt-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={checking || !value}
        className="w-full min-h-[44px] rounded-2xl bg-peri-400 hover:bg-peri-500 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold transition-all duration-150"
      >
        {checking ? '확인 중...' : '들어가기'}
      </button>
    </form>
  )
}

/* ── 관리 패널 ── */

function AdminPanel({ password }: { password: string }) {
  const [tab, setTab] = useState<Tab>('matchmakers')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        <TabButton active={tab === 'matchmakers'} onClick={() => setTab('matchmakers')}>
          주선자 관리
        </TabButton>
        <TabButton active={tab === 'profiles'} onClick={() => setTab('profiles')}>
          사용자 목록
        </TabButton>
        <TabButton active={tab === 'matches'} onClick={() => setTab('matches')}>
          매칭 현황
        </TabButton>
      </div>

      {tab === 'matchmakers' && <MatchmakerSection password={password} />}
      {tab === 'profiles' && <ProfileSection password={password} />}
      {tab === 'matches' && <MatchSection password={password} />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-h-[40px] rounded-full text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-slate-700 text-white shadow-sm'
          : 'bg-white text-slate-500 border border-peri-100 hover:bg-peri-50'
      }`}
    >
      {children}
    </button>
  )
}

/* ── 주선자 관리 ── */

function MatchmakerSection({ password }: { password: string }) {
  const [list, setList] = useState<MatchmakerStat[] | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setList(await fetchMatchmakerStats(password))
    } catch (err) {
      setError(err instanceof Error ? err.message : '불러오지 못했어요')
    }
  }, [password])

  useEffect(() => {
    load()
  }, [load])

  // 실패 사유를 그대로 보여줍니다 (연결된 프로필이 있어 못 지우는 경우 등)
  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await fn()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 문제가 생겼어요')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 추가 */}
      <div className="bg-white rounded-2xl border border-peri-100 p-3 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 주선자 이름"
          className="flex-1 min-w-0 px-3 text-sm text-slate-700 placeholder-slate-300 bg-transparent focus:outline-none"
        />
        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={() =>
            run(async () => {
              await addMatchmaker(password, name)
              setName('')
            })
          }
          className="min-h-[40px] px-4 rounded-xl bg-peri-400 hover:bg-peri-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold transition-all duration-150"
        >
          추가
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* 목록 */}
      {list === null ? (
        <p className="text-sm text-slate-500 text-center py-8">불러오는 중...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          등록된 주선자가 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((mm) => (
            <MatchmakerRow
              key={mm.id}
              stat={mm}
              busy={busy}
              onRename={(next) =>
                run(() => renameMatchmaker(password, mm.id, next))
              }
              onDelete={() => run(() => deleteMatchmaker(password, mm.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchmakerRow({
  stat,
  busy,
  onRename,
  onDelete,
}: {
  stat: MatchmakerStat
  busy: boolean
  onRename: (name: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(stat.name)

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-peri-300 p-3 flex gap-2">
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 min-w-0 px-2 text-sm text-slate-700 bg-transparent focus:outline-none"
        />
        <button
          type="button"
          disabled={busy || !value.trim()}
          onClick={() => {
            onRename(value)
            setEditing(false)
          }}
          className="min-h-[36px] px-3 rounded-xl bg-peri-400 hover:bg-peri-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(stat.name)
            setEditing(false)
          }}
          className="min-h-[36px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-peri-100 p-3 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">
          {stat.name}
        </p>
        <p className="text-[11px] text-slate-400">
          연결된 프로필 {stat.profileCount}명
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => setEditing(true)}
        className="min-h-[36px] px-3 rounded-xl bg-peri-50 hover:bg-peri-100 text-peri-600 text-xs font-semibold transition-colors"
      >
        이름 변경
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirm(`'${stat.name}' 주선자를 삭제할까요?`)) onDelete()
        }}
        className="min-h-[36px] px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-semibold transition-colors"
      >
        삭제
      </button>
    </div>
  )
}

/* ── 사용자 목록 ── */

function ProfileSection({ password }: { password: string }) {
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setProfiles((await fetchProfiles()) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '불러오지 못했어요')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (profile: Profile) => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await adminSetProfileActive(password, profile.id, !profile.isActive)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 문제가 생겼어요')
    } finally {
      setBusy(false)
    }
  }

  if (profiles === null) {
    return <p className="text-sm text-slate-500 text-center py-8">불러오는 중...</p>
  }

  const activeCount = profiles.filter((p) => p.isActive).length

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        전체 {profiles.length}명 · 활동 중 {activeCount}명
      </p>

      {error && (
        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {profiles.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          등록된 프로필이 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`rounded-2xl border p-3 flex items-center gap-3 ${
                profile.isActive
                  ? 'bg-white border-peri-100'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <PenguinAvatar
                look={profileLook(profile)}
                size={40}
                className={profile.isActive ? '' : 'opacity-60 grayscale'}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {profile.name}
                  </p>
                  {!profile.isActive && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 bg-slate-200 text-slate-500">
                      쉬는 중
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {birthYearLabel(profile.birthYear)}
                  {profile.gender === 'male' ? ' · 남성' : ' · 여성'}
                  {profile.matchmakerName ? ` · ${profile.matchmakerName}` : ''}
                </p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => toggle(profile)}
                className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold shrink-0 transition-colors disabled:opacity-50 ${
                  profile.isActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    : 'bg-peri-400 hover:bg-peri-500 text-white'
                }`}
              >
                {profile.isActive ? '비활성화' : '활성화'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── 매칭 현황 ── */

function MatchSection({ password }: { password: string }) {
  const [list, setList] = useState<AdminMatch[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setList(await fetchAdminMatches(password))
    } catch (err) {
      setError(err instanceof Error ? err.message : '불러오지 못했어요')
    }
  }, [password])

  useEffect(() => {
    load()
  }, [load])

  const markIntroduced = async (matchId: string) => {
    if (busy) return
    setBusy(matchId)
    setError(null)
    try {
      await setAdminMatchStatus(password, matchId, 'introduced')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 문제가 생겼어요')
    } finally {
      setBusy(null)
    }
  }

  if (list === null) {
    return <p className="text-sm text-slate-500 text-center py-8">불러오는 중...</p>
  }

  const pendingCount = list.filter((m) => m.status === 'matched').length

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        전체 {list.length}건 · 연결 대기 {pendingCount}건
      </p>

      {error && (
        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          아직 성사된 매칭이 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-peri-100 p-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-center gap-3">
                <MatchSideCard side={m.a} />
                <span className="text-rose-300 text-lg shrink-0">💕</span>
                <MatchSideCard side={m.b} />
              </div>

              <button
                type="button"
                disabled={m.status === 'introduced' || busy === m.id}
                onClick={() => markIntroduced(m.id)}
                className={`min-h-[40px] rounded-xl text-xs font-semibold transition-all duration-150 disabled:pointer-events-none ${
                  m.status === 'introduced'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-peri-400 hover:bg-peri-500 active:scale-[0.98] text-white'
                }`}
              >
                {m.status === 'introduced'
                  ? '연결 완료 ✓'
                  : busy === m.id
                    ? '처리 중...'
                    : '연결 완료로 표시'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchSideCard({ side }: { side: MatchSide }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center gap-1 text-center">
      <PenguinAvatar
        look={side.penguinLook}
        size={40}
        className={side.isActive ? '' : 'opacity-60 grayscale'}
      />
      <p className="text-xs font-semibold text-slate-700 truncate w-full">
        {side.name}
      </p>
      <p className="text-[10px] text-slate-400 truncate w-full">
        {side.matchmakerName ? `주선자: ${side.matchmakerName}` : '주선자 없음'}
      </p>
    </div>
  )
}
