import { lookFromSeed, type PenguinLook } from '@/config/penguinLook'
import type { Profile } from '@/types'

// 프로필의 '내 펭귄'. 아직 직접 고르지 않았다면 id로 항상 같은 펭귄을 배정합니다
export const profileLook = (profile: Profile): PenguinLook =>
  profile.penguinLook ?? lookFromSeed(profile.id)
