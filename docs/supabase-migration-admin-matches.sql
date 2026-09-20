-- 펭귄팅 마이그레이션 — 매칭 3단계: 관리자가 매칭 현황을 보고 연결 완료 표시
--
-- '주선자가 확인'하는 주체는 아직 매칭마커 로그인이 없어서 관리자(/admin)가 대신합니다.
-- 관리자가 매칭 양쪽의 주선자 이름을 보고 오프라인(카톡 등)으로 연락처를 전달한 뒤
-- "연결 완료로 표시"를 누르면 상태가 바뀝니다. 앱이 연락처를 직접 주고받지는 않습니다.
--
-- Supabase 대시보드 > SQL Editor 에서 한 번에 실행하세요.

begin;

-- 1) 상태 값 정리 — 'connected'는 이름이 헷갈려서 'matched'로 바꿉니다.
--    (혹시 모를 다른 값도 전부 'matched'로 모아둡니다 — introduced만 예외)
update public.matches
set status = 'matched'
where status is distinct from 'introduced';

alter table public.matches alter column status set default 'matched';

-- 두 번 실행해도 안전하도록 기존 제약을 지우고 다시 겁니다
alter table public.matches drop constraint if exists matches_status_check;
alter table public.matches
  add constraint matches_status_check check (status in ('matched', 'introduced'));

-- 2) 매칭 전체 목록 (관리자용) — 양쪽 프로필 정보 + 각자의 주선자 이름
create or replace function public.admin_list_matches(p_password text)
returns table (
  match_id uuid,
  status text,
  created_at timestamptz,
  a_id uuid,
  a_name text,
  a_gender text,
  a_birth_year integer,
  a_is_active boolean,
  a_penguin_look jsonb,
  a_matchmaker_name text,
  b_id uuid,
  b_name text,
  b_gender text,
  b_birth_year integer,
  b_is_active boolean,
  b_penguin_look jsonb,
  b_matchmaker_name text
)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.assert_admin(p_password);

  return query
    select
      m.id, m.status, m.created_at,
      pa.id, pa.name, pa.gender, pa.birth_year, pa.is_active, pa.penguin_look, ma.name,
      pb.id, pb.name, pb.gender, pb.birth_year, pb.is_active, pb.penguin_look, mb.name
    from matches m
    join profiles pa on pa.id = m.profile_a
    join profiles pb on pb.id = m.profile_b
    left join matchmakers ma on ma.id = pa.matchmaker_id
    left join matchmakers mb on mb.id = pb.matchmaker_id
    order by m.created_at desc;
end $$;

-- 3) 매칭 상태 변경 (연결 완료로 표시)
create or replace function public.admin_set_match_status(
  p_password text, p_match_id uuid, p_status text
) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.assert_admin(p_password);

  if p_status not in ('matched', 'introduced') then
    raise exception '알 수 없는 상태예요: %', p_status using errcode = '22000';
  end if;

  update matches set status = p_status where id = p_match_id;
  return found;
end $$;

commit;
