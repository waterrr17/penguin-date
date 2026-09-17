-- 펭귄팅 마이그레이션 — update_profile 함수에 빠져 있던 p_hobbies 추가
--
-- 증상: 프로필 수정 시
--   "Could not find the function public.update_profile(..., p_hobbies, ...) in the schema cache"
-- 원인: 앱(src/lib/supabase.ts)은 p_hobbies 를 보내는데 DB 함수에는 그 파라미터가 없었습니다.
--       (스키마 문서에 처음부터 빠져 있던 항목이 그대로 이어져 왔습니다)
--
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.

-- 0) 취미 컬럼이 없다면 만들어 줍니다
alter table public.profiles
  add column if not exists hobbies text;

-- 1) 이름이 같은 update_profile 을 시그니처와 상관없이 전부 지웁니다
--    (파라미터 목록을 일일이 맞춰 drop 하면 하나라도 어긋날 때 옛 함수가 남아
--     오버로드가 중복되므로, 아래처럼 싹 정리한 뒤 하나만 다시 만듭니다)
do $$
declare fn record;
begin
  for fn in
    select oid::regprocedure as sig
    from pg_proc
    where proname = 'update_profile'
      and pronamespace = 'public'::regnamespace
  loop
    execute 'drop function ' || fn.sig;
  end loop;
end $$;

-- 2) 앱이 보내는 파라미터와 정확히 일치하는 함수를 새로 만듭니다
create function public.update_profile(
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
  where id = p_id and password = p_password;
  return found;
end $$;
