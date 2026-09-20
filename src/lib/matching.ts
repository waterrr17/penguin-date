import type { Profile } from '@/types'

// 내가 고른 펭귄은 기기에만 저장합니다 (아직 로그인 개념이 없습니다)
export const MY_PROFILE_KEY = 'penguin-my-profile'

export interface Compatibility {
  /** 지정된 조건이 모두 양방향으로 맞는지 */
  isMatch: boolean
  /** 맞은 조건 이름 (예: ['나이', '키']) */
  reasons: string[]
}

// 값이 없으면 판단할 수 없으므로 통과시킵니다 ("상관없음"으로 봅니다)
function inRange(
  value: number | null,
  min: number | null,
  max: number | null,
): boolean {
  if (value == null) return true
  if (min != null && value < min) return false
  if (max != null && value > max) return false
  return true
}

const specified = (...values: (number | null)[]) =>
  values.some((v) => v != null)

/**
 * 두 펭귄의 이상형 조건이 **양방향으로** 맞는지 봅니다.
 * (내 조건에 상대가 맞고, 상대 조건에도 내가 맞아야 합니다)
 *
 * 조건을 아무도 안 적었으면 "잘 맞는다"는 근거가 없으므로 매칭으로 치지 않습니다.
 * 이성끼리만 계산합니다.
 */
export function compatibility(me: Profile, other: Profile): Compatibility {
  const none: Compatibility = { isMatch: false, reasons: [] }

  if (me.id === other.id) return none
  if (me.gender === other.gender) return none
  if (!other.isActive) return none

  const reasons: string[] = []

  // ── 나이 ──
  const yearAsked = specified(
    me.idealBirthYearMin,
    me.idealBirthYearMax,
    other.idealBirthYearMin,
    other.idealBirthYearMax,
  )
  if (yearAsked) {
    const ok =
      inRange(other.birthYear, me.idealBirthYearMin, me.idealBirthYearMax) &&
      inRange(me.birthYear, other.idealBirthYearMin, other.idealBirthYearMax)
    if (!ok) return none
    reasons.push('나이')
  }

  // ── 키 ──
  const heightAsked = specified(
    me.idealHeightMin,
    me.idealHeightMax,
    other.idealHeightMin,
    other.idealHeightMax,
  )
  if (heightAsked) {
    const ok =
      inRange(other.height, me.idealHeightMin, me.idealHeightMax) &&
      inRange(me.height, other.idealHeightMin, other.idealHeightMax)
    if (!ok) return none
    reasons.push('키')
  }

  // 확인할 조건이 하나도 없었으면 근거가 없는 것으로 봅니다
  return reasons.length > 0 ? { isMatch: true, reasons } : none
}
