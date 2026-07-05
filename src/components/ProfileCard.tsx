import Link from "next/link";
import type { Profile } from "@/types";
import { birthYearLabel } from "@/lib/age";
import { assetPath } from "@/lib/paths";

const GENDER_STYLE = {
  male: { badge: "bg-peri-100 text-peri-500", avatar: "bg-peri-50" },
  female: { badge: "bg-rose-100 text-rose-400", avatar: "bg-rose-50" },
} as const;

export default function ProfileCard({ profile }: { profile: Profile }) {
  const style = GENDER_STYLE[profile.gender];

  return (
    <Link
      href={`/profile?id=${profile.id}`}
      className={`rounded-3xl border p-4 flex flex-col gap-3 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 ${
        profile.isActive
          ? "bg-white border-peri-100 hover:border-peri-300"
          : "bg-slate-100 border-slate-200 opacity-70 grayscale"
      }`}
    >
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
            "🐧"
          )}
        </div>

        {/* 이름 / 기본 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 truncate">
              {profile.name}
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}
            >
              {profile.gender === "male" ? "남성" : "여성"}
            </span>
            {!profile.isActive && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-slate-200 text-slate-500">
                쉬는 중
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 leading-snug">
            {birthYearLabel(profile.birthYear)}
            {profile.height ? ` · ${profile.height}cm` : ""}
            {profile.job ? ` · ${profile.job}` : ""}
            {profile.mbti ? ` · ${profile.mbti}` : ""}
          </p>
        </div>

        {/* 상세 이동 표시 */}
        <span className="text-peri-200 text-lg shrink-0">›</span>
      </div>

      {/* 한마디 */}
      {profile.bio && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {profile.bio}
        </p>
      )}

      {/* 주선자 */}
      {profile.matchmakerName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-peri-50/70 rounded-xl px-3 py-2">
          <span>💌</span>
          <span>
            <b className="text-peri-500 font-semibold">
              {profile.matchmakerName}
            </b>
            과 {profile.relationship ? `${profile.relationship}` : "..."}
          </span>
        </div>
      )}
    </Link>
  );
}
