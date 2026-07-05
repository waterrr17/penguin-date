import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Matchmaker, Profile } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// env 미설정 시 null — 호출하는 쪽에서 샘플 데이터로 대체합니다
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// profiles 테이블 row (snake_case) ↔ 앱 타입 (camelCase) 변환
interface ProfileRow {
  id: string
  name: string
  birth_year: number
  gender: 'male' | 'female'
  height: number | null
  job: string
  mbti: string
  residence: string
  drinking: string
  smoking: string
  religion: string
  matchmaker_id: string | null
  relationship: string
  bio: string
  photo_url: string | null
  created_at: string
  matchmakers: { name: string } | null // 주선자 조인 결과
}

const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  name: row.name,
  birthYear: row.birth_year,
  gender: row.gender,
  height: row.height,
  job: row.job,
  mbti: row.mbti,
  residence: row.residence,
  drinking: row.drinking,
  smoking: row.smoking,
  religion: row.religion,
  matchmakerId: row.matchmaker_id,
  matchmakerName: row.matchmakers?.name ?? '',
  relationship: row.relationship,
  bio: row.bio,
  photoUrl: row.photo_url,
  createdAt: row.created_at,
})

// 전체 프로필 목록 조회 (최신 등록 순, 주선자 이름 포함). DB 미설정 시 null 반환
export async function fetchProfiles(): Promise<Profile[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*, matchmakers(name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`프로필 조회 실패: ${error.message}`)
  return (data as unknown as ProfileRow[]).map(toProfile)
}

// 단일 프로필 조회 (주선자 이름 포함). DB 미설정이거나 없는 id면 null 반환
export async function fetchProfileById(id: string): Promise<Profile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*, matchmakers(name)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`프로필 조회 실패: ${error.message}`)
  return data ? toProfile(data as unknown as ProfileRow) : null
}

// 주선자 목록 조회 (이름순). DB 미설정 시 null 반환
export async function fetchMatchmakers(): Promise<Matchmaker[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('matchmakers')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) throw new Error(`주선자 목록 조회 실패: ${error.message}`)
  return data as Matchmaker[]
}

// 프로필 등록. DB 미설정 시 false 반환
export async function insertProfile(
  profile: Omit<Profile, 'id' | 'createdAt' | 'matchmakerName'>,
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase.from('profiles').insert({
    name: profile.name,
    birth_year: profile.birthYear,
    gender: profile.gender,
    height: profile.height,
    job: profile.job,
    mbti: profile.mbti,
    residence: profile.residence,
    drinking: profile.drinking,
    smoking: profile.smoking,
    religion: profile.religion,
    matchmaker_id: profile.matchmakerId,
    relationship: profile.relationship,
    bio: profile.bio,
    photo_url: profile.photoUrl,
  })

  if (error) throw new Error(`프로필 등록 실패: ${error.message}`)
  return true
}
