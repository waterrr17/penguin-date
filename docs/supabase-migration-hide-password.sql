-- 펭귄팅 마이그레이션 — 프로필 비밀번호(password) 컬럼 조회 차단
--
-- 문제: profiles 조회 정책이 누구에게나 열려 있어서, anon 키(배포 번들에 포함)로
--       password 컬럼까지 그대로 읽을 수 있었습니다.
-- 해결: 테이블 전체 조회 권한을 회수하고, password 를 뺀 컬럼만 조회 권한을 다시 줍니다.
--       비밀번호 확인/수정/삭제/비활성화는 security definer RPC 함수 안에서만 password 를 읽으므로
--       비로그인 사용자의 비밀번호 방식은 그대로 동작합니다.
--
-- ⚠️ 적용 순서: 앱 코드(src/lib/supabase.ts 에서 select('*') 제거)를 먼저 배포한 뒤 실행하세요.
--    예전 코드가 배포된 상태에서 실행하면 프로필 조회가 권한 오류로 실패합니다.
--
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.

-- 1) 테이블 단위 조회 권한 회수 (anon: 비로그인, authenticated: 추후 로그인 사용자)
revoke select on public.profiles from anon, authenticated;

-- 2) password 를 제외한 컬럼만 조회 허용
--    ※ profiles 에 새 컬럼을 추가하면 여기에도 grant 를 추가해야 앱에서 읽을 수 있습니다
grant select (
  id,
  name,
  birth_year,
  gender,
  height,
  job,
  mbti,
  residence,
  hobbies,
  drinking,
  smoking,
  religion,
  ideal_birth_year_min,
  ideal_birth_year_max,
  ideal_height_min,
  ideal_height_max,
  ideal_appearance,
  ideal_must_have,
  matchmaker_id,
  relationship,
  bio,
  penguin_look,
  is_active,
  created_at
) on public.profiles to anon, authenticated;

-- 3) 확인용: 아래 쿼리 결과에 password 가 없어야 합니다
-- select column_name from information_schema.column_privileges
-- where table_name = 'profiles' and grantee = 'anon' and privilege_type = 'SELECT';
