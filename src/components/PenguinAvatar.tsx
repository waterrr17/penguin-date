import { LAYER_ORDER, layerSrc, type PenguinLook } from '@/config/penguinLook'
import { assetPath } from '@/lib/paths'

interface Props {
  look: PenguinLook
  /** 한 변의 픽셀 크기 (정사각형) */
  size?: number
  className?: string
}

// 32x32 도트 에셋을 같은 그리드 위에 겹쳐 하나의 펭귄으로 보여줍니다
export default function PenguinAvatar({ look, size = 240, className = '' }: Props) {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {LAYER_ORDER.map((category) => {
        const name = look[category]
        if (!name) return null
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={category}
            src={assetPath(layerSrc(category, name))}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 w-full h-full"
            // 도트 감성 유지 — 확대 시 블러 방지
            style={{ imageRendering: 'pixelated' }}
          />
        )
      })}
    </div>
  )
}
