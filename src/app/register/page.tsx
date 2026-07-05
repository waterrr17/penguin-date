"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROFILE_IMAGES } from "@/config/profileAssets";
import { SAMPLE_MATCHMAKERS } from "@/data/sampleProfiles";
import { adjectives, nouns, generateNickname } from "@/data/nicknames";
import { fetchMatchmakers, insertProfile } from "@/lib/supabase";
import { assetPath } from "@/lib/paths";
import type { Matchmaker } from "@/types";

const RELATIONSHIP_OPTIONS = [
  "고등학교 친구",
  "대학교 친구",
  "직장 동료",
  "지인",
  "모르는 사이",
];
const DRINKING_OPTIONS = ["좋아해요", "보통이에요", "싫어해요"];
const SMOKING_OPTIONS = ["흡연자", "비흡연자"];
const RELIGION_OPTIONS = ["개신교", "가톨릭", "불교", "그 외 종교", "무교"];

type Gender = "male" | "female" | "";

interface FormState {
  name: string;
  birthYear: string;
  gender: Gender;
  height: string;
  job: string;
  mbti: string;
  residence: string;
  drinking: string;
  smoking: string;
  religion: string;
  matchmakerId: string;
  relationship: string;
  bio: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  // 닉네임 = 형용사 + 명사 조합
  const [selectedAdj, setSelectedAdj] = useState("");
  const [selectedNoun, setSelectedNoun] = useState("");
  const [matchmakers, setMatchmakers] = useState<Matchmaker[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    birthYear: "",
    gender: "",
    height: "",
    job: "",
    mbti: "",
    residence: "",
    drinking: "",
    smoking: "",
    religion: "",
    matchmakerId: "",
    relationship: "",
    bio: "",
  });

  // 첫 진입 시 프로필 사진 + 닉네임 랜덤 선택
  // (초기 state로 하면 프리렌더와 값이 달라져 hydration 오류가 나므로 effect에서 설정)
  useEffect(() => {
    if (PROFILE_IMAGES.length > 0) {
      setSelectedPhoto(
        PROFILE_IMAGES[Math.floor(Math.random() * PROFILE_IMAGES.length)],
      );
    }
    const nickname = generateNickname();
    const [adj, noun] = nickname.split(" ");
    setSelectedAdj(adj);
    setSelectedNoun(noun);
    set("name", nickname);
  }, []);

  // 주선자 목록 로드 (DB 미설정 시 샘플 주선자)
  useEffect(() => {
    let cancelled = false;
    fetchMatchmakers()
      .then((data) => {
        if (!cancelled) setMatchmakers(data ?? SAMPLE_MATCHMAKERS);
      })
      .catch(() => {
        if (!cancelled) setMatchmakers(SAMPLE_MATCHMAKERS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim() || !form.birthYear || !form.gender) {
      alert("출생연도, 성별은 꼭 입력해 주세요 🐧");
      return;
    }

    setSubmitting(true);
    try {
      const saved = await insertProfile({
        name: form.name.trim(),
        birthYear: Number(form.birthYear),
        gender: form.gender,
        height: form.height ? Number(form.height) : null,
        job: form.job.trim(),
        mbti: form.mbti.trim().toUpperCase(),
        residence: form.residence.trim(),
        drinking: form.drinking,
        smoking: form.smoking,
        religion: form.religion,
        matchmakerId: form.matchmakerId || null,
        relationship: form.relationship,
        bio: form.bio.trim(),
        photoUrl: selectedPhoto ? `/assets/profiles/${selectedPhoto}` : null,
      });

      if (!saved) {
        alert("아직 DB가 연결되지 않았어요. 관리자에게 문의해 주세요 🐧");
        return;
      }

      alert("프로필이 등록되었어요! 🎉");
      router.push("/browse");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "등록 중 문제가 생겼어요. 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#f0f9ff",
        backgroundImage: `radial-gradient(circle, #bae6fd 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
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
        <h1 className="font-display text-xl text-slate-800">
          프로필 등록하기 🐧
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-5"
      >
        {/* 필수 항목 안내 */}
        <p className="text-xs text-slate-400 text-right px-1 -mb-3">
          <span className="text-red-500">*</span> 필수 항목
        </p>

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
            <div className="flex justify-center py-2">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-white border border-sky-100 shadow-sm flex items-center justify-center">
                  {selectedPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetPath(`/assets/profiles/${selectedPhoto}`)}
                      alt="선택된 프로필 사진"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🐧</span>
                  )}
                </div>
                {/* 사진 변경 버튼 */}
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  aria-label="프로필 사진 바꾸기"
                  className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-sky-400 hover:bg-sky-500 active:scale-95 text-white text-base shadow-md shadow-sky-200 flex items-center justify-center transition-all duration-150"
                >
                  ✏️
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* ── 기본 정보 ── */}
        <Section title="기본 정보">
          <div className="bg-white rounded-2xl border border-sky-100 divide-y divide-sky-50 overflow-hidden">
            <Row label="닉네임" required>
              <div className="flex items-center justify-end gap-1.5">
                <select
                  value={selectedAdj}
                  onChange={(e) => {
                    setSelectedAdj(e.target.value);
                    set("name", `${e.target.value} ${selectedNoun}`);
                  }}
                  className="w-auto text-sm text-slate-700 text-right bg-transparent focus:outline-none appearance-none"
                >
                  {adjectives.map((adj) => (
                    <option key={adj} value={adj}>
                      {adj}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedNoun}
                  onChange={(e) => {
                    setSelectedNoun(e.target.value);
                    set("name", `${selectedAdj} ${e.target.value}`);
                  }}
                  className="w-auto text-sm text-slate-700 text-right bg-transparent focus:outline-none appearance-none"
                >
                  {nouns.map((noun) => (
                    <option key={noun} value={noun}>
                      {noun}
                    </option>
                  ))}
                </select>
              </div>
            </Row>

            <Row label="출생연도" required>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.birthYear}
                  onChange={(e) => set("birthYear", e.target.value)}
                  className={inputCls}
                />
                <span className="text-slate-300 text-sm shrink-0">년생</span>
              </div>
            </Row>

            <Row label="성별" required>
              <div className="flex gap-1.5">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set("gender", g)}
                    className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                      form.gender === g
                        ? g === "male"
                          ? "bg-sky-400 text-white shadow-sm"
                          : "bg-rose-300 text-white shadow-sm"
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {g === "male" ? "남성" : "여성"}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="키">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={form.height}
                  onChange={(e) => set("height", e.target.value)}
                  className={inputCls}
                />
                <span className="text-slate-300 text-sm shrink-0">cm</span>
              </div>
            </Row>

            <Row label="직업">
              <input
                type="text"
                value={form.job}
                onChange={(e) => set("job", e.target.value)}
                className={inputCls}
              />
            </Row>

            <Row label="MBTI">
              <input
                type="text"
                maxLength={4}
                value={form.mbti}
                onChange={(e) => set("mbti", e.target.value)}
                className={`${inputCls} uppercase`}
              />
            </Row>

            <Row label="거주지">
              <input
                type="text"
                value={form.residence}
                onChange={(e) => set("residence", e.target.value)}
                className={inputCls}
              />
            </Row>

            <Row label="음주">
              <select
                value={form.drinking}
                onChange={(e) => set("drinking", e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">선택</option>
                {DRINKING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Row>

            <Row label="흡연">
              <select
                value={form.smoking}
                onChange={(e) => set("smoking", e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">선택</option>
                {SMOKING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Row>

            <Row label="종교">
              <select
                value={form.religion}
                onChange={(e) => set("religion", e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">선택</option>
                {RELIGION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Row>
          </div>
        </Section>

        {/* ── 주선 정보 ── */}
        <Section title="주선 정보">
          <div className="bg-white rounded-2xl border border-sky-100 divide-y divide-sky-50 overflow-hidden">
            <Row label="주선자">
              <select
                value={form.matchmakerId}
                onChange={(e) => set("matchmakerId", e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">주선자 선택</option>
                {matchmakers.map((mm) => (
                  <option key={mm.id} value={mm.id}>
                    {mm.name}
                  </option>
                ))}
              </select>
            </Row>

            <Row label="관계">
              <select
                value={form.relationship}
                onChange={(e) => set("relationship", e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">관계 선택</option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
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
            onChange={(e) => set("bio", e.target.value)}
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
          {submitting ? "등록 중..." : "등록하기 🐧"}
        </button>

        <div className="h-6" />
      </form>

      {/* ── 프로필 사진 선택 모달 ── */}
      {photoModalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center px-6"
          onClick={() => setPhotoModalOpen(false)}
        >
          {/* 배경 */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          {/* 패널 */}
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-slate-800">
                프로필 사진 고르기 🐧
              </h2>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                aria-label="닫기"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5 max-h-80 overflow-y-auto">
              {PROFILE_IMAGES.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => {
                    setSelectedPhoto(img);
                    setPhotoModalOpen(false);
                  }}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-150 ${
                    selectedPhoto === img
                      ? "border-sky-400 shadow-lg shadow-sky-100 scale-[0.96]"
                      : "border-transparent hover:border-sky-200"
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
          </div>
        </div>
      )}
    </main>
  );
}

/* ── 내부 컴포넌트 ── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-lg text-sky-400 tracking-[0.1em] px-1">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-12 text-xs text-slate-400 shrink-0">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full text-sm text-slate-700 placeholder-slate-300 bg-transparent focus:outline-none";
