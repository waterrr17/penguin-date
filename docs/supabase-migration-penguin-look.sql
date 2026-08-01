-- 펭귄팅 마이그레이션 — 프로필 사진(photo_url)을 '내 펭귄'(penguin_look)으로 교체
-- 이미 운영 중인 DB에 적용할 때 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- (새로 만드는 DB라면 docs/supabase-schema.sql 만 실행하면 됩니다)

-- 1) 펭귄 조합을 담을 컬럼 추가 {body,hat,glasses,neck,item}
alter table public.profiles
  add column if not exists penguin_look jsonb;

-- 2) update_profile RPC를 새 시그니처로 교체
--    (파라미터가 바뀌므로 replace가 아니라 기존 함수를 지우고 다시 만듭니다)
drop function if exists public.update_profile(
  uuid, text, text, integer, text, integer, text, text, text, text, text, text,
  integer, integer, integer, integer, text, text, uuid, text, text, text
);

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

-- 3) (선택) 더 이상 쓰지 않는 프로필 사진 컬럼 정리
--    기존 사진을 보관하고 싶으면 이 줄은 실행하지 마세요.
--    penguin_look 이 비어 있는 프로필은 앱에서 id 기반 랜덤 펭귄이 자동 배정됩니다.
-- alter table public.profiles drop column photo_url;
