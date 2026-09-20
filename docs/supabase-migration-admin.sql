-- 펭귄팅 마이그레이션 — 관리자 페이지(/admin) 용 테이블 + RPC
--
-- ⚠️ 실행 전에 아래 1) 의 '여기에_원하는_관리자_비밀번호' 를 원하는 값으로 바꾸세요.
--    (한 번 실행하면 해시로 저장되어 다시 볼 수 없습니다. 바꾸려면 맨 아래 안내 참고)
--
-- 보안 메모:
--   정적 배포라 anon key 가 브라우저 번들에 그대로 들어갑니다.
--   따라서 "화면에서 비밀번호를 물어보는 것"만으로는 아무 방어가 되지 않습니다.
--   실제 방어는 아래 RPC 안에서 이뤄집니다 —
--   주선자 추가/수정/삭제와 프로필 상태 변경은 전부 관리자 비밀번호를 함께 받아
--   서버에서 확인한 뒤에만 동작합니다. 테이블 직접 수정 권한은 주지 않습니다.

begin;

create extension if not exists pgcrypto;
set local search_path = public, extensions;

-- ── 1) 관리자 비밀번호 보관 ──────────────────────────────
-- 한 행만 존재하도록 강제합니다
create table if not exists public.admin_config (
  id boolean primary key default true check (id),
  password text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_config enable row level security;
-- 정책을 하나도 만들지 않습니다 → anon 은 이 테이블을 읽지도 쓰지도 못합니다.
-- 아래 RPC 들은 security definer 라 소유자 권한으로 접근합니다.
revoke all on public.admin_config from anon, authenticated;

-- 👇👇👇 여기 비밀번호를 바꾸세요 👇👇👇
insert into public.admin_config (id, password)
values (true, crypt('여기에_원하는_관리자_비밀번호', gen_salt('bf')))
on conflict (id) do nothing;
-- 👆👆👆 여기 비밀번호를 바꾸세요 👆👆👆

-- ── 2) 관리자 비밀번호 확인 ──────────────────────────────
create or replace function public.verify_admin_password(p_password text)
returns boolean
language sql security definer set search_path = public, extensions as $$
  select exists (
    select 1 from admin_config
    where id = true and password = crypt(p_password, password)
  );
$$;

-- 내부용: 비밀번호가 틀리면 예외를 던져 아래 함수들을 즉시 중단시킵니다
create or replace function public.assert_admin(p_password text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.verify_admin_password(p_password) then
    raise exception '관리자 비밀번호가 일치하지 않습니다' using errcode = '28000';
  end if;
end $$;

revoke execute on function public.assert_admin(text) from public, anon, authenticated;

-- ── 3) 주선자 관리 ───────────────────────────────────────
create or replace function public.admin_add_matchmaker(p_password text, p_name text)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare new_id uuid;
begin
  perform public.assert_admin(p_password);

  if p_name is null or btrim(p_name) = '' then
    raise exception '주선자 이름을 입력해 주세요' using errcode = '22000';
  end if;

  insert into matchmakers (name) values (btrim(p_name))
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.admin_rename_matchmaker(p_password text, p_id uuid, p_name text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.assert_admin(p_password);

  if p_name is null or btrim(p_name) = '' then
    raise exception '주선자 이름을 입력해 주세요' using errcode = '22000';
  end if;

  update matchmakers set name = btrim(p_name) where id = p_id;
  return found;
end $$;

create or replace function public.admin_delete_matchmaker(p_password text, p_id uuid)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare in_use integer;
begin
  perform public.assert_admin(p_password);

  -- 이 주선자를 쓰고 있는 프로필이 있으면 지우지 않습니다
  select count(*) into in_use from profiles where matchmaker_id = p_id;
  if in_use > 0 then
    raise exception '이 주선자가 연결된 프로필이 %건 있어 삭제할 수 없어요', in_use
      using errcode = '23503';
  end if;

  delete from matchmakers where id = p_id;
  return found;
end $$;

-- ── 4) 프로필 활성화/비활성화 (관리자 권한) ───────────────
-- 사용자 본인 비밀번호 없이도 관리자가 상태를 바꿀 수 있게 합니다
create or replace function public.admin_set_profile_active(
  p_password text, p_id uuid, p_active boolean
) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.assert_admin(p_password);
  update profiles set is_active = p_active where id = p_id;
  return found;
end $$;

-- ── 5) 주선자별 연결된 프로필 수 (관리 화면 표시용) ────────
create or replace function public.admin_matchmaker_stats(p_password text)
returns table (id uuid, name text, profile_count bigint)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.assert_admin(p_password);
  return query
    select m.id, m.name, count(p.id)
    from matchmakers m
    left join profiles p on p.matchmaker_id = m.id
    group by m.id, m.name
    order by m.name;
end $$;

commit;

-- ── 비밀번호를 바꾸고 싶을 때 ────────────────────────────
-- update public.admin_config
-- set password = crypt('새_비밀번호', gen_salt('bf')), updated_at = now()
-- where id = true;
