-- 펭귄팅 DB 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
--
-- 이전 버전 스키마(age, matchmaker 텍스트 필드)를 이미 적용했다면
-- 아래 주석을 해제해서 기존 테이블을 지운 뒤 실행하세요:
-- drop table if exists public.profiles;

-- ── 주선자 테이블 ──
create table public.matchmakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ── 프로필 테이블 ──
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_year integer not null check (birth_year between 1950 and 2010),
  gender text not null check (gender in ('male', 'female')),
  height integer check (height between 140 and 220),
  job text not null default '',
  -- 주선자 1 : 프로필 N
  matchmaker_id uuid references public.matchmakers (id),
  relationship text not null default '',
  bio text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);

-- ── RLS 정책 ──
-- 비공개 친구 그룹 서비스이므로 anon 키로는 아래 정책만 허용합니다

alter table public.matchmakers enable row level security;

-- 주선자는 앱에서 조회만 가능. 추가/수정은 대시보드(Table Editor)에서 직접 합니다
create policy "누구나 주선자 조회 가능"
  on public.matchmakers for select
  to anon
  using (true);

alter table public.profiles enable row level security;

create policy "누구나 프로필 조회 가능"
  on public.profiles for select
  to anon
  using (true);

create policy "누구나 프로필 등록 가능"
  on public.profiles for insert
  to anon
  with check (true);

-- 프로필 수정/삭제는 정책이 없으므로 anon 키로는 불가능합니다 (대시보드에서만 관리)

-- ── 초기 주선자 등록 예시 ──
-- insert into public.matchmakers (name) values ('이민지'), ('최우진');
