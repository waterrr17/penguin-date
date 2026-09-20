'use client'

import { useState } from 'react'
import { getMySession, setMySession } from '@/lib/matching'
import { sendLike, type SendLikeResult } from '@/lib/likes'
import type { Profile } from '@/types'

interface Props {
  me: Profile
  profile: Profile
  liked: boolean
  matched: boolean
  onResult: (result: SendLikeResult) => void
  className?: string
}

// 관심 보내기 버튼 + 비밀번호 확인 모달.
// 말풍선(ProfileBubble)과 상세 페이지에서 함께 씁니다
export default function LikeButton({
  me,
  profile,
  liked,
  matched,
  onResult,
  className = '',
}: Props) {
  const [askPassword, setAskPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (pw: string) => {
    if (sending || !pw) return
    setSending(true)
    setError(null)
    try {
      const result = await sendLike(me.id, pw, profile.id)
      if (result === 'wrong-password') {
        setError('비밀번호가 일치하지 않아요')
        return
      }
      if (result === 'no-db') {
        setError('아직 DB가 연결되지 않았어요')
        return
      }
      // 성공했으니 이 비밀번호를 기억해 뒀다가 다음 관심 보내기에는 다시 묻지 않습니다
      setMySession(me.id, pw)
      setAskPassword(false)
      setPassword('')
      onResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 문제가 생겼어요')
    } finally {
      setSending(false)
    }
  }

  const handleClick = () => {
    const session = getMySession()
    if (session && session.id === me.id) {
      submit(session.password)
    } else {
      setError(null)
      setAskPassword(true)
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={matched || liked || sending}
        onClick={handleClick}
        className={`disabled:pointer-events-none transition-all duration-150 ${
          matched
            ? 'bg-amber-100 text-amber-600'
            : liked
              ? 'bg-slate-100 text-slate-400'
              : 'bg-rose-400 hover:bg-rose-500 active:scale-[0.98] text-white'
        } ${className}`}
      >
        {matched
          ? '매칭 성사! 🎉'
          : liked
            ? '관심 보냈어요 ✓'
            : sending
              ? '보내는 중...'
              : '관심 보내기 💌'}
      </button>

      {/* ── 비밀번호 확인 (첫 관심 보내기에만, 이후엔 기억해 둔 값을 씁니다) ── */}
      {askPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={() => setAskPassword(false)}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg text-slate-800">
              비밀번호 확인 🔒
            </h2>
            <p className="text-xs text-slate-400 -mt-2">
              관심을 보내려면 내 펭귄({me.name}) 비밀번호가 필요해요
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              placeholder="숫자 4자리"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit(password)
              }}
              className="w-full bg-peri-50 rounded-2xl px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-700 placeholder-slate-300 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-peri-200"
            />
            {error && (
              <p className="text-xs text-rose-500 text-center -mt-2">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAskPassword(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-semibold transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => submit(password)}
                disabled={sending}
                className="flex-1 py-3 rounded-2xl bg-peri-400 hover:bg-peri-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {sending ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
