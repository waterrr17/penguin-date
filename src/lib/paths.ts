// next.config.ts의 basePath와 동일하게 유지해야 합니다
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/penguin-date' : ''

// public/ 아래 정적 자산 경로에 basePath를 붙여줍니다 (GitHub Pages 배포 대응)
export const assetPath = (path: string) => `${BASE_PATH}${path}`
