import { normalizeLook, type PenguinLook } from '@/config/penguinLook'
import { supabase } from '@/lib/supabase'

// 관리자 비밀번호는 새로고침하면 다시 묻도록 sessionStorage 에만 둡니다
export const ADMIN_PASSWORD_KEY = 'penguin-admin-password'

export interface MatchmakerStat {
  id: string
  name: string
  profileCount: number
}

export type MatchStatus = 'matched' | 'introduced'

// 매칭 목록에서 쓰는 한쪽(펭귄) 요약 정보
export interface MatchSide {
  id: string
  name: string
  gender: 'male' | 'female'
  birthYear: number
  isActive: boolean
  penguinLook: PenguinLook
  matchmakerName: string | null
}

export interface AdminMatch {
  id: string
  status: MatchStatus
  createdAt: string
  a: MatchSide
  b: MatchSide
}

// ⚠️ 이 화면의 방어선은 DB 쪽입니다.
// 정적 배포라 anon key 가 번들에 들어가므로, 화면에서 막는 것만으로는 의미가 없습니다.
// 아래 함수들은 전부 관리자 비밀번호를 같이 보내고, 서버(RPC)에서 확인합니다.

export async function verifyAdminPassword(password: string): Promise<boolean | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('verify_admin_password', {
    p_password: password,
  })

  if (error) throw new Error(`관리자 확인 실패: ${error.message}`)
  return data === true
}

export async function fetchMatchmakerStats(
  password: string,
): Promise<MatchmakerStat[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('admin_matchmaker_stats', {
    p_password: password,
  })

  if (error) throw new Error(error.message)
  return (data as { id: string; name: string; profile_count: number }[]).map(
    (row) => ({
      id: row.id,
      name: row.name,
      profileCount: Number(row.profile_count),
    }),
  )
}

export async function addMatchmaker(password: string, name: string) {
  if (!supabase) return null

  const { error } = await supabase.rpc('admin_add_matchmaker', {
    p_password: password,
    p_name: name,
  })

  if (error) throw new Error(error.message)
}

export async function renameMatchmaker(
  password: string,
  id: string,
  name: string,
) {
  if (!supabase) return null

  const { error } = await supabase.rpc('admin_rename_matchmaker', {
    p_password: password,
    p_id: id,
    p_name: name,
  })

  if (error) throw new Error(error.message)
}

export async function deleteMatchmaker(password: string, id: string) {
  if (!supabase) return null

  const { error } = await supabase.rpc('admin_delete_matchmaker', {
    p_password: password,
    p_id: id,
  })

  if (error) throw new Error(error.message)
}

export async function adminSetProfileActive(
  password: string,
  id: string,
  active: boolean,
) {
  if (!supabase) return null

  const { error } = await supabase.rpc('admin_set_profile_active', {
    p_password: password,
    p_id: id,
    p_active: active,
  })

  if (error) throw new Error(error.message)
}

interface MatchRow {
  match_id: string
  status: MatchStatus
  created_at: string
  a_id: string
  a_name: string
  a_gender: 'male' | 'female'
  a_birth_year: number
  a_is_active: boolean
  a_penguin_look: unknown
  a_matchmaker_name: string | null
  b_id: string
  b_name: string
  b_gender: 'male' | 'female'
  b_birth_year: number
  b_is_active: boolean
  b_penguin_look: unknown
  b_matchmaker_name: string | null
}

const toAdminMatch = (row: MatchRow): AdminMatch => ({
  id: row.match_id,
  status: row.status,
  createdAt: row.created_at,
  a: {
    id: row.a_id,
    name: row.a_name,
    gender: row.a_gender,
    birthYear: row.a_birth_year,
    isActive: row.a_is_active,
    penguinLook: normalizeLook(row.a_penguin_look),
    matchmakerName: row.a_matchmaker_name,
  },
  b: {
    id: row.b_id,
    name: row.b_name,
    gender: row.b_gender,
    birthYear: row.b_birth_year,
    isActive: row.b_is_active,
    penguinLook: normalizeLook(row.b_penguin_look),
    matchmakerName: row.b_matchmaker_name,
  },
})

export async function fetchAdminMatches(
  password: string,
): Promise<AdminMatch[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('admin_list_matches', {
    p_password: password,
  })

  if (error) throw new Error(error.message)
  return (data as MatchRow[]).map(toAdminMatch)
}

export async function setAdminMatchStatus(
  password: string,
  matchId: string,
  status: MatchStatus,
) {
  if (!supabase) return null

  const { error } = await supabase.rpc('admin_set_match_status', {
    p_password: password,
    p_match_id: matchId,
    p_status: status,
  })

  if (error) throw new Error(error.message)
}
