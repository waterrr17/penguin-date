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
  ideal_birth_year_min: number | null
  ideal_birth_year_max: number | null
  ideal_height_min: number | null
  ideal_height_max: number | null
  ideal_appearance: string
  ideal_must_have: string
  matchmaker_id: string | null
  relationship: string
  bio: string
  photo_url: string | null
  is_active: boolean
  created_at: string
  matchmakers: { name: string } | null // 주선자 조인 결과
}

// 수정/삭제 폼에서 다루는 프로필 필드 (id, 등록일, 조인 결과, 활성화 여부 제외)
type ProfileInput = Omit<Profile, 'id' | 'createdAt' | 'matchmakerName' | 'isActive'>

type MutationResult = 'ok' | 'wrong-password' | 'no-db'

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
  idealBirthYearMin: row.ideal_birth_year_min,
  idealBirthYearMax: row.ideal_birth_year_max,
  idealHeightMin: row.ideal_height_min,
  idealHeightMax: row.ideal_height_max,
  idealAppearance: row.ideal_appearance,
  idealMustHave: row.ideal_must_have,
  matchmakerId: row.matchmaker_id,
  matchmakerName: row.matchmakers?.name ?? '',
  relationship: row.relationship,
  bio: row.bio,
  photoUrl: row.photo_url,
  isActive: row.is_active,
  createdAt: row.created_at,
})

// 전체 프로필 목록 조회 (최신 등록 순, 주선자 이름 포함). DB 미설정 시 null 반환
export async function fetchProfiles(): Promise<Profile[] | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*, matchmakers(name)')
    .order('is_active', { ascending: false }) // 비활성 프로필은 아래로
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
  profile: ProfileInput,
  password: string,
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase.from('profiles').insert({
    password,
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
    ideal_birth_year_min: profile.idealBirthYearMin,
    ideal_birth_year_max: profile.idealBirthYearMax,
    ideal_height_min: profile.idealHeightMin,
    ideal_height_max: profile.idealHeightMax,
    ideal_appearance: profile.idealAppearance,
    ideal_must_have: profile.idealMustHave,
    matchmaker_id: profile.matchmakerId,
    relationship: profile.relationship,
    bio: profile.bio,
    photo_url: profile.photoUrl,
  })

  if (error) throw new Error(`프로필 등록 실패: ${error.message}`)
  return true
}

// 비밀번호 검증 (RPC). DB 미설정 시 null 반환
export async function verifyProfilePassword(
  id: string,
  password: string,
): Promise<boolean | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('verify_profile_password', {
    p_id: id,
    p_password: password,
  })

  if (error) throw new Error(`비밀번호 확인 실패: ${error.message}`)
  return data === true
}

// 프로필 수정 (RPC, 비밀번호 일치 시에만 서버에서 수정됨)
export async function updateProfile(
  id: string,
  password: string,
  profile: ProfileInput,
): Promise<MutationResult> {
  if (!supabase) return 'no-db'

  const { data, error } = await supabase.rpc('update_profile', {
    p_id: id,
    p_password: password,
    p_name: profile.name,
    p_birth_year: profile.birthYear,
    p_gender: profile.gender,
    p_height: profile.height,
    p_job: profile.job,
    p_mbti: profile.mbti,
    p_residence: profile.residence,
    p_drinking: profile.drinking,
    p_smoking: profile.smoking,
    p_religion: profile.religion,
    p_ideal_birth_year_min: profile.idealBirthYearMin,
    p_ideal_birth_year_max: profile.idealBirthYearMax,
    p_ideal_height_min: profile.idealHeightMin,
    p_ideal_height_max: profile.idealHeightMax,
    p_ideal_appearance: profile.idealAppearance,
    p_ideal_must_have: profile.idealMustHave,
    p_matchmaker_id: profile.matchmakerId,
    p_relationship: profile.relationship,
    p_bio: profile.bio,
    p_photo_url: profile.photoUrl,
  })

  if (error) throw new Error(`프로필 수정 실패: ${error.message}`)
  return data === true ? 'ok' : 'wrong-password'
}

// 프로필 삭제 (RPC, 비밀번호 일치 시에만)
export async function deleteProfile(
  id: string,
  password: string,
): Promise<MutationResult> {
  if (!supabase) return 'no-db'

  const { data, error } = await supabase.rpc('delete_profile', {
    p_id: id,
    p_password: password,
  })

  if (error) throw new Error(`프로필 삭제 실패: ${error.message}`)
  return data === true ? 'ok' : 'wrong-password'
}

// 프로필 활성화/비활성화 (RPC, 비밀번호 일치 시에만)
export async function setProfileActive(
  id: string,
  password: string,
  active: boolean,
): Promise<MutationResult> {
  if (!supabase) return 'no-db'

  const { data, error } = await supabase.rpc('set_profile_active', {
    p_id: id,
    p_password: password,
    p_active: active,
  })

  if (error) throw new Error(`상태 변경 실패: ${error.message}`)
  return data === true ? 'ok' : 'wrong-password'
}
