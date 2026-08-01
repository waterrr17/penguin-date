// 펭귄 아바타 꾸미기 설정
// 에셋은 public/avatar/{category}-{name}.svg 규칙을 따릅니다 (32x32 도트, 투명 배경)

export const PENGUIN_LOOK_KEY = 'penguin-look'

// 아래 → 위 순서로 겹칩니다
export const LAYER_ORDER = ['body', 'neck', 'glasses', 'hat', 'item'] as const

export type LayerCategory = (typeof LAYER_ORDER)[number]

export interface PenguinLook {
  body: string // 몸 색은 필수
  hat: string | null
  glasses: string | null
  neck: string | null
  item: string | null
}

interface CategoryConfig {
  key: LayerCategory
  label: string
  /** 몸 색처럼 반드시 하나를 골라야 하면 false */
  optional: boolean
  options: { name: string; label: string }[]
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'body',
    label: '몸 색',
    optional: false,
    options: [
      { name: 'navy', label: '네이비' },
      { name: 'ice', label: '아이스' },
      { name: 'pink', label: '핑크' },
    ],
  },
  {
    key: 'hat',
    label: '모자',
    optional: true,
    options: [
      { name: 'beanie', label: '비니' },
      { name: 'straw', label: '밀짚모자' },
    ],
  },
  {
    key: 'glasses',
    label: '안경',
    optional: true,
    options: [
      { name: 'round', label: '둥근 안경' },
      { name: 'sun', label: '선글라스' },
    ],
  },
  {
    key: 'neck',
    label: '목',
    optional: true,
    options: [
      { name: 'tie', label: '넥타이' },
      { name: 'bowtie', label: '나비넥타이' },
    ],
  },
  {
    key: 'item',
    label: '소품',
    optional: true,
    options: [
      { name: 'pebble', label: '조약돌' },
      { name: 'coffee', label: '커피' },
    ],
  },
]

export const DEFAULT_LOOK: PenguinLook = {
  body: 'navy',
  hat: null,
  glasses: null,
  neck: null,
  item: null,
}

export const layerSrc = (category: LayerCategory, name: string) =>
  `/avatar/${category}-${name}.svg`

// 전 카테고리 조합 뽑기 (선택 항목은 '없음'도 후보에 포함)
function pickLook(rand: () => number): PenguinLook {
  const next = { ...DEFAULT_LOOK }
  for (const category of CATEGORIES) {
    const pool: (string | null)[] = category.options.map((o) => o.name)
    if (category.optional) pool.push(null)
    const value = pool[Math.floor(rand() * pool.length)]
    if (category.key === 'body') next.body = value ?? DEFAULT_LOOK.body
    else next[category.key] = value
  }
  return next
}

export const randomLook = () => pickLook(Math.random)

// 같은 시드는 항상 같은 펭귄이 나옵니다 (mulberry32)
function rngFrom(seed: string) {
  let a = 2166136261
  for (let i = 0; i < seed.length; i++) {
    a ^= seed.charCodeAt(i)
    a = Math.imul(a, 16777619)
  }
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 펭귄을 직접 고르기 전에 등록된 프로필은 id로 펭귄을 배정합니다
export const lookFromSeed = (seed: string) => pickLook(rngFrom(seed))

// localStorage 값이 깨졌거나 없는 옵션이면 기본값으로 되돌립니다
export function normalizeLook(value: unknown): PenguinLook {
  if (!value || typeof value !== 'object') return DEFAULT_LOOK
  const raw = value as Record<string, unknown>
  const next = { ...DEFAULT_LOOK }

  for (const category of CATEGORIES) {
    const picked = raw[category.key]
    const valid =
      typeof picked === 'string' &&
      category.options.some((o) => o.name === picked)

    if (category.key === 'body') {
      next.body = valid ? (picked as string) : DEFAULT_LOOK.body
    } else {
      next[category.key] = valid ? (picked as string) : null
    }
  }
  return next
}
