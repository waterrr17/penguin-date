import type { Profile } from '@/types'
import { ageFromBirthYear, birthYearLabel } from '@/lib/age'
import { assetPath } from '@/lib/paths'

const GENDER_STYLE = {
  male: { badge: 'bg-sky-100 text-sky-500', avatar: 'bg-sky-50' },
  female: { badge: 'bg-rose-100 text-rose-400', avatar: 'bg-rose-50' },
} as const

export default function ProfileCard({ profile }: { profile: Profile }) {
  const style = GENDER_STYLE[profile.gender]

  return (
    <article className="bg-white rounded-3xl border border-sky-100 p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* 아바타 */}
        <div
          className={`w-14 h-14 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center text-3xl ${style.avatar}`}
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

        {/* 이름 / 기본 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 truncate">{profile.name}</h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}
            >
              {profile.gender === 'male' ? '남성' : '여성'}
            </span>
          </div>
          <p className="text-sm text-slate-400 truncate">
            {birthYearLabel(profile.birthYear)}({ageFromBirthYear(profile.birthYear)}세)
            {profile.height ? ` · ${profile.height}cm` : ''}
            {profile.job ? ` · ${profile.job}` : ''}
          </p>
        </div>
      </div>

      {/* 자기소개 */}
      {profile.bio && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{profile.bio}</p>
      )}

      {/* 주선자 */}
      {profile.matchmakerName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-sky-50/70 rounded-xl px-3 py-2">
          <span>💌</span>
          <span>
            <b className="text-sky-500 font-semibold">{profile.matchmakerName}</b>
            {profile.relationship ? `(${profile.relationship})` : ''} 님의 소개예요
          </span>
        </div>
      )}
    </article>
  )
}
