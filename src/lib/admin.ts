import { supabase } from '@/lib/supabase'

// 관리자 비밀번호는 새로고침하면 다시 묻도록 sessionStorage 에만 둡니다
export const ADMIN_PASSWORD_KEY = 'penguin-admin-password'

export interface MatchmakerStat {
  id: string
  name: string
  profileCount: number
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
