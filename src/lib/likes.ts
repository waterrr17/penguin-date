import { supabase } from '@/lib/supabase'

export type SendLikeResult =
  | 'liked'
  | 'matched'
  | 'already-liked'
  | 'wrong-password'
  | 'no-db'

// 관심 보내기. 서로 관심을 보내면 그 자리에서 매칭이 성사됩니다.
// 서버(RPC)가 비밀번호와 이성 여부를 확인하므로, 화면에서는 결과만 보여주면 됩니다
export async function sendLike(
  fromId: string,
  password: string,
  toId: string,
): Promise<SendLikeResult> {
  if (!supabase) return 'no-db'

  const { data, error } = await supabase.rpc('send_like', {
    p_from_id: fromId,
    p_password: password,
    p_to_id: toId,
  })

  if (error) throw new Error(error.message)
  return data as SendLikeResult
}

// 내가 관심을 보낸 상대 id 목록
export async function fetchLikesSent(
  id: string,
  password: string,
): Promise<string[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('fetch_likes_sent', {
    p_id: id,
    p_password: password,
  })

  if (error) throw new Error(error.message)
  return (data as string[]) ?? []
}

// 나에게 관심을 보낸 상대 id 목록
export async function fetchLikesReceived(
  id: string,
  password: string,
): Promise<string[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('fetch_likes_received', {
    p_id: id,
    p_password: password,
  })

  if (error) throw new Error(error.message)
  return (data as string[]) ?? []
}

// 매칭 성사된 상대 id 목록
export async function fetchMyMatches(
  id: string,
  password: string,
): Promise<string[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('fetch_my_matches', {
    p_id: id,
    p_password: password,
  })

  if (error) throw new Error(error.message)
  return (data as string[]) ?? []
}
