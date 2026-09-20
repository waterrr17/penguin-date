-- 펭귄팅 마이그레이션 — 프로필 비밀번호를 평문 대신 해시(bcrypt)로 저장
--
-- 문제: profiles.password 가 평문이라 DB 접근 권한이 있으면 그대로 읽힙니다.
--       (조회 권한은 이미 막았지만 저장 자체는 평문이었습니다)
-- 해결: pgcrypto 의 crypt() + bcrypt 로 해시해서 저장하고, 비교도 crypt() 로 합니다.
--
-- ✅ 앱 코드는 바꿀 필요가 없습니다.
--    등록은 트리거가 자동으로 해시하고, 검증은 RPC 안에서 처리합니다.
--
-- ⚠️ 한 번에 전부 실행하세요. 중간까지만 실행하면 기존 사용자가 잠깁니다.
--    (해시는 됐는데 RPC 는 아직 평문 비교 → 비밀번호가 안 맞음)
--
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 한 번에 실행하세요.

begin;

-- 0) pgcrypto 준비
--    Supabase 는 보통 extensions 스키마에 설치되어 있지만, public 에 있는 경우도 있어서
--    스키마를 하드코딩하지 않고 search_path 로 찾게 합니다
create extension if not exists pgcrypto;
set local search_path = public, extensions;

-- 1) 기존 평문 비밀번호를 해시로 변환
--    이미 bcrypt 해시($2a$/$2b$/$2y$ 로 시작)인 값은 건드리지 않습니다 —
--    이 스크립트를 실수로 두 번 실행해도 안전합니다
update public.profiles
set password = crypt(password, gen_salt('bf'))
where password is not null
  and password <> ''
  and password !~ '^\$2[aby]\$';

-- 2) 앞으로 들어오는 비밀번호는 트리거가 자동으로 해시합니다
--    (앱은 PostgREST 로 직접 insert 하므로 트리거가 없으면 평문이 그대로 저장됩니다)
create or replace function public.hash_profile_password()
returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  -- 비밀번호가 실제로 바뀐 경우에만 해시합니다.
  -- ※ 이 조건이 없으면 프로필을 수정할 때마다 해시를 또 해시해서 로그인이 막힙니다
  if new.password is null or new.password = '' then
    return new;
  end if;

  -- INSERT 와 UPDATE 를 나눠서 씁니다.
  -- 한 줄로 'tg_op = INSERT or ...old.password' 라고 쓰면 INSERT 때 OLD 가 없어서 터질 수 있습니다
  if tg_op = 'INSERT' then
    if new.password !~ '^\$2[aby]\$' then
      new.password := crypt(new.password, gen_salt('bf'));
    end if;
  elsif new.password is distinct from old.password then
    -- 이미 해시된 값이면 그대로 둡니다
    if new.password !~ '^\$2[aby]\$' then
      new.password := crypt(new.password, gen_salt('bf'));
    end if;
  end if;

  return new;
end $$;

drop trigger if exists profiles_hash_password on public.profiles;
create trigger profiles_hash_password
  before insert or update of password on public.profiles
  for each row execute function public.hash_profile_password();

-- 3) 비밀번호 비교 헬퍼
--    저장값이 비어 있거나 bcrypt 형식이 아니면 crypt() 가 예외를 던지므로,
--    형식을 먼저 확인하고 아니면 그냥 false 를 돌려줍니다
create or replace function public.password_matches(p_stored text, p_input text)
returns boolean
language sql immutable security definer set search_path = public, extensions as $$
  select case
    when p_stored is null or p_stored !~ '^\$2[aby]\$' then false
    else p_stored = crypt(p_input, p_stored)
  end;
$$;

-- 헬퍼는 아래 RPC 안에서만 쓰면 되므로 외부 호출은 막습니다
-- (security definer 함수 안에서는 소유자 권한으로 실행되어 영향받지 않습니다)
revoke execute on function public.password_matches(text, text) from public, anon, authenticated;

-- 4) 비밀번호를 비교하는 RPC 4개를 해시 비교로 교체

create or replace function public.verify_profile_password(p_id uuid, p_password text)
returns boolean
language sql security definer set search_path = public, extensions as $$
  select exists (
    select 1 from profiles
    where id = p_id
      and public.password_matches(password, p_password)
  );
$$;

create or replace function public.delete_profile(p_id uuid, p_password text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from profiles
  where id = p_id
    and public.password_matches(password, p_password);
  return found;
end $$;

create or replace function public.set_profile_active(p_id uuid, p_password text, p_active boolean)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  update profiles set is_active = p_active
  where id = p_id
    and public.password_matches(password, p_password);
  return found;
end $$;

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
  where id = p_id
    and public.password_matches(password, p_password);
  return found;
end $$;

commit;

-- ── 확인용 ──────────────────────────────────────────────
-- 아래 쿼리의 plaintext_left 가 0 이어야 합니다
--
-- select
--   count(*) filter (where password ~ '^\$2[aby]\$') as hashed,
--   count(*) filter (where password <> '' and password !~ '^\$2[aby]\$') as plaintext_left
-- from public.profiles;
