-- 펭귄팅 마이그레이션 — 매칭 2단계: 관심 보내기 / 상호 매칭
--
-- 서로 관심을 보내면(상호 좋아요) matches 에 자동으로 기록됩니다.
-- 누가 누구를 좋아하는지는 민감한 정보라 anon 은 테이블을 직접 읽지도 쓰지도
-- 못하게 막고, 전부 비밀번호를 같이 받는 security definer RPC 로만 처리합니다
-- (관리자 페이지, 프로필 비밀번호 검증과 같은 패턴입니다).
--
-- Supabase 대시보드 > SQL Editor 에서 한 번에 실행하세요.

begin;

-- ── 1) 테이블 ──────────────────────────────────────────
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles (id) on delete cascade,
  to_profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (from_profile_id, to_profile_id),
  check (from_profile_id <> to_profile_id)
);

-- profile_a 가 항상 profile_b 보다 작은 uuid 가 되도록 저장해서
-- (A,B) / (B,A) 가 서로 다른 행으로 중복 저장되는 걸 막습니다
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles (id) on delete cascade,
  profile_b uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'connected', -- 3단계(주선자 연결)에서 상태를 더 씁니다
  created_at timestamptz not null default now(),
  unique (profile_a, profile_b),
  check (profile_a < profile_b)
);

alter table public.likes enable row level security;
alter table public.matches enable row level security;
-- 정책을 하나도 안 만듭니다 → anon 은 테이블에 직접 접근 못 합니다.
-- 아래 RPC(security definer) 를 통해서만 읽고 씁니다
revoke all on public.likes from anon, authenticated;
revoke all on public.matches from anon, authenticated;

-- ── 2) 관심 보내기 ─────────────────────────────────────
-- 반환값: 'liked' 좋아요만 기록됨 / 'matched' 상호 매칭 성사
--        'already-liked' 이미 보낸 상태 / 'wrong-password' 비밀번호 불일치
create or replace function public.send_like(
  p_from_id uuid, p_password text, p_to_id uuid
) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  from_gender text;
  to_gender text;
  reverse_exists boolean;
  a uuid;
  b uuid;
begin
  if not public.password_matches(
    (select password from profiles where id = p_from_id), p_password
  ) then
    return 'wrong-password';
  end if;

  if p_from_id = p_to_id then
    raise exception '본인에게는 관심을 보낼 수 없어요' using errcode = '22000';
  end if;

  select gender into from_gender from profiles where id = p_from_id;
  select gender into to_gender from profiles where id = p_to_id;
  if to_gender is null then
    raise exception '상대 프로필을 찾을 수 없어요' using errcode = '22000';
  end if;
  if from_gender = to_gender then
    raise exception '이성에게만 관심을 보낼 수 있어요' using errcode = '22000';
  end if;

  insert into likes (from_profile_id, to_profile_id)
  values (p_from_id, p_to_id)
  on conflict (from_profile_id, to_profile_id) do nothing;

  if not found then
    return 'already-liked';
  end if;

  select exists (
    select 1 from likes
    where from_profile_id = p_to_id and to_profile_id = p_from_id
  ) into reverse_exists;

  if reverse_exists then
    a := least(p_from_id, p_to_id);
    b := greatest(p_from_id, p_to_id);
    insert into matches (profile_a, profile_b)
    values (a, b)
    on conflict (profile_a, profile_b) do nothing;
    return 'matched';
  end if;

  return 'liked';
end $$;

-- ── 3) 조회 (전부 비밀번호 확인 후에만) ────────────────
create or replace function public.fetch_likes_sent(p_id uuid, p_password text)
returns setof uuid
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.password_matches(
    (select password from profiles where id = p_id), p_password
  ) then
    raise exception '비밀번호가 일치하지 않아요' using errcode = '28000';
  end if;
  return query select to_profile_id from likes where from_profile_id = p_id;
end $$;

create or replace function public.fetch_likes_received(p_id uuid, p_password text)
returns setof uuid
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.password_matches(
    (select password from profiles where id = p_id), p_password
  ) then
    raise exception '비밀번호가 일치하지 않아요' using errcode = '28000';
  end if;
  return query select from_profile_id from likes where to_profile_id = p_id;
end $$;

-- 매칭 성사된 "상대방" id 목록을 돌려줍니다
create or replace function public.fetch_my_matches(p_id uuid, p_password text)
returns setof uuid
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.password_matches(
    (select password from profiles where id = p_id), p_password
  ) then
    raise exception '비밀번호가 일치하지 않아요' using errcode = '28000';
  end if;
  return query
    select case when profile_a = p_id then profile_b else profile_a end
    from matches
    where profile_a = p_id or profile_b = p_id;
end $$;

commit;
