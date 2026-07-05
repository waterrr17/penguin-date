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
  birth_year integer not null check (birth_year between 1900 and 2100),
  gender text not null check (gender in ('male', 'female')),
  height integer check (height between 100 and 250),
  job text not null default '',
  mbti text not null default '',
  residence text not null default '',
  drinking text not null default '',   -- 좋아해요 | 보통 | 싫어해요
  smoking text not null default '',    -- 흡연자 | 비흡연자
  religion text not null default '',   -- 개신교 | 가톨릭 | 불교 | 그 외 종교 | 무교
  -- 이상형
  ideal_birth_year_min integer,
  ideal_birth_year_max integer,
  ideal_height_min integer,
  ideal_height_max integer,
  ideal_appearance text not null default '',  -- 두부상 | 아랍상 | 고양이상 | 강아지상 | 토끼상 | 곰상 | 공룡상 | 직접 입력값
  ideal_must_have text not null default '',   -- 포기할 수 없는 한 가지
  -- 주선자 1 : 프로필 N
  matchmaker_id uuid references public.matchmakers (id),
  relationship text not null default '',
  bio text not null default '',
  photo_url text,
  -- 수정/삭제용 비밀번호 (숫자 4자리) + 활성화 여부
  password text not null default '',
  is_active boolean not null default true,
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

-- 프로필 수정/삭제/비활성화는 직접 update/delete 대신 아래 RPC 함수로만 가능합니다
-- (비밀번호 검증을 서버에서 수행하기 위함)

-- ── 수정/삭제용 RPC 함수 ──

-- 비밀번호 검증
create or replace function public.verify_profile_password(p_id uuid, p_password text)
returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from profiles where id = p_id and password = p_password);
$$;

-- 프로필 수정 (비밀번호 일치 시에만)
create or replace function public.update_profile(
  p_id uuid,
  p_password text,
  p_name text,
  p_birth_year integer,
  p_gender text,
  p_height integer,
  p_job text,
  p_mbti text,
  p_residence text,
  p_drinking text,
  p_smoking text,
  p_religion text,
  p_ideal_birth_year_min integer,
  p_ideal_birth_year_max integer,
  p_ideal_height_min integer,
  p_ideal_height_max integer,
  p_ideal_appearance text,
  p_ideal_must_have text,
  p_matchmaker_id uuid,
  p_relationship text,
  p_bio text,
  p_photo_url text
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update profiles set
    name = p_name,
    birth_year = p_birth_year,
    gender = p_gender,
    height = p_height,
    job = p_job,
    mbti = p_mbti,
    residence = p_residence,
    drinking = p_drinking,
    smoking = p_smoking,
    religion = p_religion,
    ideal_birth_year_min = p_ideal_birth_year_min,
    ideal_birth_year_max = p_ideal_birth_year_max,
    ideal_height_min = p_ideal_height_min,
    ideal_height_max = p_ideal_height_max,
    ideal_appearance = p_ideal_appearance,
    ideal_must_have = p_ideal_must_have,
    matchmaker_id = p_matchmaker_id,
    relationship = p_relationship,
    bio = p_bio,
    photo_url = p_photo_url
  where id = p_id and password = p_password;
  return found;
end $$;

-- 프로필 삭제 (비밀번호 일치 시에만)
create or replace function public.delete_profile(p_id uuid, p_password text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  delete from profiles where id = p_id and password = p_password;
  return found;
end $$;

-- 프로필 활성화/비활성화 (비밀번호 일치 시에만)
create or replace function public.set_profile_active(p_id uuid, p_password text, p_active boolean)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update profiles set is_active = p_active where id = p_id and password = p_password;
  return found;
end $$;