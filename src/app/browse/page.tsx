"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PenguinField from "@/components/PenguinField";
import { SAMPLE_PROFILES } from "@/data/sampleProfiles";
import { fetchProfiles } from "@/lib/supabase";
import type { Profile } from "@/types";

type GenderFilter = "all" | "male" | "female";

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);
  const [gender, setGender] = useState<GenderFilter>("all");

  useEffect(() => {
    let cancelled = false;
    fetchProfiles()
      .then((data) => {
        if (cancelled) return;
        // DB 미설정(null) 시 샘플 데이터로 대체
        setProfiles(data ?? SAMPLE_PROFILES);
        setIsSample(data === null);
      })
      .catch(() => {
        if (cancelled) return;
        setProfiles(SAMPLE_PROFILES);
        setIsSample(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => profiles.filter((p) => gender === "all" || p.gender === gender),
    [profiles, gender],
  );

  // 인원 수에는 비활성 프로필을 세지 않습니다
  const activeCount = useMemo(
    () => filtered.filter((p) => p.isActive).length,
    [filtered],
  );

  return (
    <main
      className="h-[100dvh] flex flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #F7FBFF 0%, #E6F1FC 45%, #CFE3F7 100%)",
      }}
    >
      {/* 상단 헤더 */}
      <header className="shrink-0 z-30 bg-white/75 backdrop-blur-md border-b border-peri-100 flex items-center gap-3 px-4 h-14">
        <Link
          href="/"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-peri-50 text-peri-500 hover:bg-peri-100 transition-colors text-lg"
        >
          ←
        </Link>
        <h1 className="font-display text-xl text-slate-800">
          프로필 둘러보기 💌
        </h1>
      </header>

      {/* ── 필터 ── */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex gap-1.5">
          <FilterChip
            active={gender === "all"}
            onClick={() => setGender("all")}
          >
            전체
          </FilterChip>
          <FilterChip
            active={gender === "male"}
            activeCls="bg-peri-400 text-white shadow-sm"
            onClick={() => setGender("male")}
          >
            남성
          </FilterChip>
          <FilterChip
            active={gender === "female"}
            activeCls="bg-rose-300 text-white shadow-sm"
            onClick={() => setGender("female")}
          >
            여성
          </FilterChip>
        </div>

        {/* 샘플 데이터 안내 */}
        {isSample && !loading && (
          <p className="text-[11px] text-amber-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            아직 DB가 연결되지 않아 샘플 프로필을 보여주고 있어요
          </p>
        )}

        {/* 인원 수 (비활성 프로필 제외) */}
        {!loading && activeCount > 0 && (
          <p className="self-start text-xs text-slate-500 bg-white/70 backdrop-blur-[2px] rounded-full px-3 py-1.5">
            {activeCount}마리의 외로운 펭귄이 돌아다니고 있어요 🐧
          </p>
        )}
      </div>

      {/* ── 펭귄들이 돌아다니는 화면 ── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <span className="text-4xl animate-bounce">🐧</span>
          <p className="text-sm">펭귄들을 불러오는 중...</p>
        </div>
      ) : (
        <PenguinField profiles={filtered} />
      )}
    </main>
  );
}

/* ── 내부 컴포넌트 ── */

function FilterChip({
  active,
  activeCls = "bg-slate-700 text-white shadow-sm",
  onClick,
  children,
}: {
  active: boolean;
  activeCls?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[36px] px-3.5 rounded-full text-sm font-medium transition-all duration-150 ${
        active
          ? activeCls
          : "bg-white text-slate-500 border border-peri-100 hover:bg-peri-50"
      }`}
    >
      {children}
    </button>
  );
}
