"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MyPenguinPicker from "@/components/MyPenguinPicker";
import PenguinField from "@/components/PenguinField";
import { SAMPLE_PROFILES } from "@/data/sampleProfiles";
import { MY_PROFILE_KEY, getMySession } from "@/lib/matching";
import {
  fetchLikesSent,
  fetchMyMatches,
  type SendLikeResult,
} from "@/lib/likes";
import { fetchProfiles } from "@/lib/supabase";
import type { Profile } from "@/types";

type GenderFilter = "all" | "male" | "female";

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);
  const [gender, setGender] = useState<GenderFilter>("all");
  // 궁합을 보려면 "내가 누구인지" 알아야 합니다 (기기에만 저장)
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    setMyId(localStorage.getItem(MY_PROFILE_KEY));
  }, []);

  const selectMe = (id: string | null) => {
    setMyId(id);
    if (id) localStorage.setItem(MY_PROFILE_KEY, id);
    else localStorage.removeItem(MY_PROFILE_KEY);
  };

  // 내가 보낸 관심 / 매칭 성사 목록 (비밀번호로 확인된 경우에만 불러옵니다)
  const [sentLikes, setSentLikes] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<Set<string>>(new Set());

  // 이미 비밀번호를 확인한 적 있는 펭귄이면(같은 탭 안에서) 목록을 미리 불러옵니다.
  // 아직 확인 전이면 조용히 넘어가고, 관심 보내기를 처음 누를 때 물어봅니다
  useEffect(() => {
    if (!myId) {
      setSentLikes(new Set());
      setMatches(new Set());
      return;
    }
    const session = getMySession();
    if (!session || session.id !== myId) return;

    let cancelled = false;
    Promise.all([
      fetchLikesSent(myId, session.password),
      fetchMyMatches(myId, session.password),
    ])
      .then(([sent, matched]) => {
        if (cancelled) return;
        if (sent) setSentLikes(new Set(sent));
        if (matched) setMatches(new Set(matched));
      })
      .catch(() => {
        // 비밀번호가 바뀌었거나 문제가 있으면 다음 관심 보내기에서 다시 묻습니다
      });
    return () => {
      cancelled = true;
    };
  }, [myId]);

  const handleLikeSent = (toId: string, result: SendLikeResult) => {
    if (result === "wrong-password" || result === "no-db") return;

    setSentLikes((prev) => new Set(prev).add(toId));
    if (result === "matched") {
      setMatches((prev) => new Set(prev).add(toId));
      alert("매칭이 성사됐어요! 🎉 서로 관심을 보냈어요");
    } else if (result === "liked") {
      alert("관심을 보냈어요 💌 상대도 관심을 보내면 매칭돼요");
    }
  };

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

  // 고른 내 펭귄 (목록에서 사라졌으면 null)
  const me = useMemo(
    () => profiles.find((p) => p.id === myId) ?? null,
    [profiles, myId],
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

        {/* 내 펭귄 고르기 — 고르면 궁합 표시 */}
        {!loading && profiles.length > 0 && (
          <MyPenguinPicker profiles={profiles} me={me} onSelect={selectMe} />
        )}
      </div>

      {/* ── 펭귄들이 돌아다니는 화면 ── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <span className="text-4xl animate-bounce">🐧</span>
          <p className="text-sm">펭귄들을 불러오는 중...</p>
        </div>
      ) : (
        <PenguinField
          profiles={filtered}
          me={me}
          sentLikes={sentLikes}
          matches={matches}
          onLikeSent={handleLikeSent}
        />
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
