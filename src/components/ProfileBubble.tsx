import Link from 'next/link'
import { birthYearLabel } from '@/lib/age'
import { compatibility } from '@/lib/matching'
import type { Profile } from '@/types'

const GENDER_BADGE = {
  male: 'bg-peri-100 text-peri-500',
  female: 'bg-rose-100 text-rose-400',
} as const

// 펭귄을 터치했을 때 머리 위에 뜨는 말풍선.
// 기존 프로필 카드 디자인을 그대로 쓰되 화면에 맞게 작게 줄였습니다
export default function ProfileBubble({
  profile,
  me = null,
}: {
  profile: Profile
  me?: Profile | null
}) {
  const match = me ? compatibility(me, profile) : null

  return (
    <div className="rounded-2xl bg-white border border-peri-100 shadow-lg shadow-peri-200/50 p-3 flex flex-col gap-2">
      {/* 이름 / 기본 정보 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-slate-800 truncate">
            {profile.name}
          </h3>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${GENDER_BADGE[profile.gender]}`}
          >
            {profile.gender === 'male' ? '남성' : '여성'}
          </span>
          {!profile.isActive && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 bg-slate-200 text-slate-500">
              쉬는 중
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          {birthYearLabel(profile.birthYear)}
          {profile.height ? ` · ${profile.height}cm` : ''}
          {profile.job ? ` · ${profile.job}` : ''}
          {profile.mbti ? ` · ${profile.mbti}` : ''}
        </p>
      </div>

      {/* 한마디 */}
      {profile.bio && (
        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
          {profile.bio}
        </p>
      )}

      {/* 이상형 궁합 */}
      {match?.isMatch && (
        <div className="flex items-center gap-1 text-[10px] text-peri-600 bg-peri-50 border border-peri-100 rounded-lg px-2 py-1.5">
          <span>✨</span>
          <span>
            <b className="font-semibold">{match.reasons.join('·')}</b> 조건이 서로
            맞아요
          </span>
        </div>
      )}

      {/* 주선자 */}
      {profile.matchmakerName && (
        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-peri-50/70 rounded-lg px-2 py-1.5">
          <span>💌</span>
          <span className="truncate">
            <b className="text-peri-500 font-semibold">
              {profile.matchmakerName}
            </b>
            과 {profile.relationship || '...'}
          </span>
        </div>
      )}

      <Link
        href={`/profile?id=${profile.id}`}
        className="min-h-[36px] flex items-center justify-center rounded-xl bg-peri-400 hover:bg-peri-500 active:scale-[0.98] text-white text-xs font-semibold transition-all duration-150"
      >
        상세보기
      </Link>
    </div>
  )
}
