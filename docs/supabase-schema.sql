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
  hobbies text,
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
  -- 프로필 사진 대신 쓰는 '내 펭귄' 조합 {body,hat,glasses,neck,item}
  penguin_look jsonb,
  -- 수정/삭제용 비밀번호 (숫자 4자리, bcrypt 해시로 저장됨) + 활성화 여부
  -- 평문으로 넣어도 아래 트리거가 자동으로 해시합니다
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

-- password 컬럼은 anon 이 읽지 못하도록 컬럼 단위로만 조회 권한을 줍니다
-- (새 컬럼을 추가하면 아래 grant 에도 추가해야 합니다)
revoke select on public.profiles from anon, authenticated;
grant select (
  id, name, birth_year, gender, height, job, mbti, residence, hobbies,
  drinking, smoking, religion,
  ideal_birth_year_min, ideal_birth_year_max, ideal_height_min, ideal_height_max,
  ideal_appearance, ideal_must_have,
  matchmaker_id, relationship, bio, penguin_look, is_active, created_at
) on public.profiles to anon, authenticated;

-- 프로필 수정/삭제/비활성화는 직접 update/delete 대신 아래 RPC 함수로만 가능합니다
-- (비밀번호 검증을 서버에서 수행하기 위함)

-- ── 비밀번호 해시 ──
-- 평문 저장을 막기 위해 bcrypt 로 해시합니다 (pgcrypto)

create extension if not exists pgcrypto;

-- 앱은 PostgREST 로 직접 insert 하므로, 트리거가 저장 직전에 해시합니다
create or replace function public.hash_profile_password()
returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  if new.password is null or new.password = '' then
    return new;
  end if;

  -- 비밀번호가 실제로 바뀐 경우에만 해시합니다
  -- ※ 이 조건이 없으면 프로필 수정 때마다 해시를 또 해시해서 로그인이 막힙니다
  -- ※ INSERT 때는 OLD 가 없으므로 분기를 나눠서 참조합니다
  if tg_op = 'INSERT' then
    if new.password !~ '^\$2[aby]\$' then
      new.password := crypt(new.password, gen_salt('bf'));
    end if;
  elsif new.password is distinct from old.password then
    if new.password !~ '^\$2[aby]\$' then
      new.password := crypt(new.password, gen_salt('bf'));
    end if;
  end if;

  return new;
end $$;

create trigger profiles_hash_password
  before insert or update of password on public.profiles
  for each row execute function public.hash_profile_password();

-- 비밀번호 비교 헬퍼 (저장값이 비었거나 형식이 다르면 예외 없이 false)
create or replace function public.password_matches(p_stored text, p_input text)
returns boolean
language sql immutable security definer set search_path = public, extensions as $$
  select case
    when p_stored is null or p_stored !~ '^\$2[aby]\$' then false
    else p_stored = crypt(p_input, p_stored)
  end;
$$;

revoke execute on function public.password_matches(text, text) from public, anon, authenticated;

-- ── 수정/삭제용 RPC 함수 ──

-- 비밀번호 검증
create or replace function public.verify_profile_password(p_id uuid, p_password text)
returns boolean
language sql security definer set search_path = public, extensions as $$
  select exists (
    select 1 from profiles
    where id = p_id and public.password_matches(password, p_password)
  );
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
  p_hobbies text,
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
  p_penguin_look jsonb
) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  update profiles set
    name = p_name,
    birth_year = p_birth_year,
    gender = p_gender,
    height = p_height,
    job = p_job,
    mbti = p_mbti,
    residence = p_residence,
    hobbies = p_hobbies,
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
    penguin_look = p_penguin_look
  where id = p_id and public.password_matches(password, p_password);
  return found;
end $$;

-- 프로필 삭제 (비밀번호 일치 시에만)
create or replace function public.delete_profile(p_id uuid, p_password text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from profiles where id = p_id and public.password_matches(password, p_password);
  return found;
end $$;

-- 프로필 활성화/비활성화 (비밀번호 일치 시에만)
create or replace function public.set_profile_active(p_id uuid, p_password text, p_active boolean)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  update profiles set is_active = p_active where id = p_id and public.password_matches(password, p_password);
  return found;
end $$;