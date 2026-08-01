'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PenguinAvatar from '@/components/PenguinAvatar'
import ProfileBubble from '@/components/ProfileBubble'
import { profileLook } from '@/lib/profileLook'
import type { Profile } from '@/types'

const PENGUIN = 64 // 펭귄 한 마리 크기
const LABEL = 16 // 머리 위 닉네임 높이
const CELL_H = PENGUIN + LABEL
const BUBBLE_W = 220
const SPEED_MIN = 8 // px/초
const SPEED_MAX = 20
const MIN_GAP = 64 // 펭귄끼리 이 거리보다 가까워지지 않습니다
const SLEEP_COLS = 3 // 쉬는 중인 펭귄을 왼쪽 아래 구석에 몇 마리씩 눕힐지

interface Motion {
  x: number
  y: number
  vx: number
  vy: number
  t: number
  /** 쉬는 중이면 돌아다니지 않고 구석에 자리를 잡습니다 */
  sleeping: boolean
  /** 구석에서의 자리 번호 */
  slot: number
}

// 쉬는 중인 펭귄의 구석(왼쪽 아래) 자리
// 화면 크기가 바뀌어도 계속 구석에 있도록 매 프레임 다시 계산합니다
const sleepSpot = (slot: number, maxY: number) => ({
  x: 8 + (slot % SLEEP_COLS) * (PENGUIN + 6),
  y: Math.max(0, maxY - 10 - Math.floor(slot / SLEEP_COLS) * (CELL_H + 2)),
})

export default function PenguinField({ profiles }: { profiles: Profile[] }) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLElement>())
  const motions = useRef(new Map<string, Motion>())
  const selectedRef = useRef<string | null>(null)
  const reduced = useRef(false)

  const [size, setSize] = useState({ w: 0, h: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 말풍선은 선택 당시 위치에 고정합니다 (선택된 펭귄은 멈춥니다)
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  // 한마디 길이에 따라 높이가 달라져서 붙는 순간 실제 높이를 잽니다
  const [bubbleH, setBubbleH] = useState(0)

  useEffect(() => {
    selectedRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // 필드 크기 측정 (회전/리사이즈 대응)
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 목록에서 빠진 펭귄의 위치 정보 정리
  useEffect(() => {
    const ids = new Set(profiles.map((p) => p.id))
    motions.current.forEach((_, id) => {
      if (!ids.has(id)) motions.current.delete(id)
    })
    if (selectedId && !ids.has(selectedId)) setSelectedId(null)
  }, [profiles, selectedId])

  // 펭귄이 화면에 붙는 순간 위치를 정해 바로 그려줍니다 (좌상단에서 튀는 것 방지)
  const registerNode = useCallback(
    (id: string, sleeping: boolean, slot: number) =>
      (node: HTMLElement | null) => {
        if (!node) {
          nodes.current.delete(id)
          return
        }
        nodes.current.set(id, node)

        let motion = motions.current.get(id)
        if (!motion) {
          const box = fieldRef.current?.getBoundingClientRect()
          const maxX = Math.max(0, (box?.width ?? 0) - PENGUIN)
          const maxY = Math.max(0, (box?.height ?? 0) - CELL_H)

          if (sleeping) {
            const spot = sleepSpot(slot, maxY)
            motion = { ...spot, vx: 0, vy: 0, t: Math.random() * 10, sleeping, slot }
          } else {
            // 처음부터 겹쳐 나오지 않도록 빈자리를 몇 번 찾아봅니다
            let x = 0
            let y = 0
            for (let attempt = 0; attempt < 40; attempt++) {
              x = Math.random() * maxX
              y = Math.random() * maxY
              let clear = true
              for (const other of motions.current.values()) {
                if (Math.hypot(other.x - x, other.y - y) < MIN_GAP) {
                  clear = false
                  break
                }
              }
              if (clear) break
            }

            const angle = Math.random() * Math.PI * 2
            const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)
            motion = {
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              t: Math.random() * 10,
              sleeping,
              slot,
            }
          }
          motions.current.set(id, motion)
        } else {
          // 활성/비활성이 바뀌었을 수 있으니 맞춰줍니다
          motion.sleeping = sleeping
          motion.slot = slot
        }
        node.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0)`
      },
    [],
  )

  // 펭귄들이 둥둥 돌아다니는 루프 (리렌더 없이 transform만 갱신)
  useEffect(() => {
    if (size.w === 0 || size.h === 0) return
    const maxX = Math.max(0, size.w - PENGUIN)
    const maxY = Math.max(0, size.h - CELL_H)
    let frame = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const ids = [...nodes.current.keys()]

      // 1) 이동 (쉬는 중이거나 선택된 펭귄은 제자리)
      for (const id of ids) {
        const m = motions.current.get(id)
        if (!m) continue
        if (m.sleeping) {
          // 화면 크기가 바뀌어도 계속 구석에 있도록 매 프레임 자리를 잡아줍니다
          const spot = sleepSpot(m.slot, maxY)
          m.x = spot.x
          m.y = spot.y
          m.t += dt
          continue
        }
        if (id === selectedRef.current || reduced.current) continue
        m.t += dt
        m.x += m.vx * dt
        m.y += m.vy * dt
      }

      // 2) 펭귄끼리 겹치지 않게 밀어냅니다 (같은 무게로 튕기는 탄성 충돌)
      for (let i = 0; i < ids.length; i++) {
        const a = motions.current.get(ids[i])
        if (!a) continue
        // 자는 펭귄은 밀리지 않는 장애물이 됩니다
        const aFixed = ids[i] === selectedRef.current || a.sleeping

        for (let j = i + 1; j < ids.length; j++) {
          const b = motions.current.get(ids[j])
          if (!b) continue
          const bFixed = ids[j] === selectedRef.current || b.sleeping
          if (aFixed && bFixed) continue

          let dx = b.x - a.x
          let dy = b.y - a.y
          let dist = Math.hypot(dx, dy)

          // 완전히 같은 자리면 살짝 흔들어 방향을 만들어 줍니다
          if (dist === 0) {
            dx = Math.random() - 0.5
            dy = Math.random() - 0.5
            dist = Math.hypot(dx, dy) || 1
          }
          if (dist >= MIN_GAP) continue

          const nx = dx / dist
          const ny = dy / dist
          const push = MIN_GAP - dist

          // 위치 분리 — 멈춰 있는 펭귄은 밀리지 않고 상대만 비켜갑니다
          if (aFixed) {
            b.x += nx * push
            b.y += ny * push
          } else if (bFixed) {
            a.x -= nx * push
            a.y -= ny * push
          } else {
            a.x -= nx * push * 0.5
            a.y -= ny * push * 0.5
            b.x += nx * push * 0.5
            b.y += ny * push * 0.5
          }

          // 서로 다가오는 중일 때만 속도를 교환해 튕겨 나가게 합니다
          const approach = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
          if (approach <= 0) continue
          if (aFixed) {
            b.vx += approach * nx
            b.vy += approach * ny
          } else if (bFixed) {
            a.vx -= approach * nx
            a.vy -= approach * ny
          } else {
            a.vx -= approach * nx
            a.vy -= approach * ny
            b.vx += approach * nx
            b.vy += approach * ny
          }
        }
      }

      // 3) 벽 튕김 + 화면 밖으로 나가지 않게 정리
      for (const id of ids) {
        const m = motions.current.get(id)
        if (!m || m.sleeping) continue
        if (m.x <= 0) {
          m.x = 0
          m.vx = Math.abs(m.vx)
        } else if (m.x >= maxX) {
          m.x = maxX
          m.vx = -Math.abs(m.vx)
        }
        if (m.y <= 0) {
          m.y = 0
          m.vy = Math.abs(m.vy)
        } else if (m.y >= maxY) {
          m.y = maxY
          m.vy = -Math.abs(m.vy)
        }
      }

      // 4) 화면에 반영
      nodes.current.forEach((node, id) => {
        const m = motions.current.get(id)
        if (!m) return
        // 자는 펭귄은 CSS로 천천히 숨만 쉬므로 통통 튀지 않게 합니다
        const bob = reduced.current || m.sleeping ? 0 : Math.sin(m.t * 4) * 2
        node.style.transform = `translate3d(${m.x}px, ${m.y + bob}px, 0)`
      })

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [size])

  const select = (id: string) => {
    const m = motions.current.get(id)
    setAnchor(m ? { x: m.x, y: m.y } : null)
    setSelectedId(id)
  }

  const selected = profiles.find((p) => p.id === selectedId) ?? null

  // 쉬는 중인 펭귄에게 구석 자리 번호를 붙여줍니다
  let sleepCount = 0
  const withSlot = profiles.map((profile) => ({
    profile,
    slot: profile.isActive ? -1 : sleepCount++,
  }))

  // 말풍선은 펭귄 위/아래 중 자리가 있는 쪽에 붙이고, 그래도 넘치면 화면 안으로 밀어 넣습니다
  // (높이는 한마디 길이에 따라 달라지므로 붙는 순간 실제로 재서 계산합니다)
  const bubble = (() => {
    if (!anchor) return null
    const left = Math.min(
      Math.max(anchor.x + PENGUIN / 2 - BUBBLE_W / 2, 8),
      Math.max(8, size.w - BUBBLE_W - 8),
    )
    const roomAbove = anchor.y - 8
    const roomBelow = size.h - (anchor.y + CELL_H) - 8

    let above: boolean
    if (bubbleH === 0) above = roomBelow >= roomAbove
    else if (roomBelow >= bubbleH) above = false
    else if (roomAbove >= bubbleH) above = true
    else above = roomAbove > roomBelow

    const wanted = above ? anchor.y - bubbleH - 8 : anchor.y + CELL_H + 8
    const top = Math.min(Math.max(wanted, 8), Math.max(8, size.h - bubbleH - 8))
    // 자리가 모자라 밀어 넣은 경우엔 꼬리가 엉뚱한 곳을 가리키므로 숨깁니다
    const showTail = bubbleH > 0 && Math.abs(top - wanted) < 1

    const tailX = Math.min(
      Math.max(anchor.x + PENGUIN / 2 - left - 6, 14),
      BUBBLE_W - 26,
    )
    return {
      above,
      tailX,
      showTail,
      style: { left, top, width: BUBBLE_W, maxHeight: Math.max(120, size.h - 16) },
    }
  })()

  return (
    <div ref={fieldRef} className="relative flex-1 overflow-hidden">
      {profiles.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <span className="text-5xl">🐧</span>
          <p className="text-sm text-slate-500 leading-relaxed">
            조건에 맞는 펭귄이 아직 없어요
          </p>
        </div>
      ) : (
        size.w > 0 &&
        withSlot.map(({ profile, slot }) => {
          const sleeping = !profile.isActive
          return (
            <button
              key={profile.id}
              ref={registerNode(profile.id, sleeping, slot)}
              type="button"
              onClick={() => select(profile.id)}
              aria-label={`${profile.name} 프로필 보기${sleeping ? ' (쉬는 중)' : ''}`}
              style={{ width: PENGUIN, willChange: 'transform' }}
              className={`absolute left-0 top-0 flex flex-col items-center ${
                selectedId === profile.id ? 'z-20' : 'z-0'
              }`}
            >
              {/* 머리 위 닉네임 */}
              <span
                className={`text-[10px] font-semibold whitespace-nowrap leading-none px-1.5 py-0.5 rounded-full bg-white/70 ${
                  sleeping ? 'text-slate-400' : 'text-slate-600'
                }`}
                style={{ height: LABEL }}
              >
                {profile.name}
              </span>

              <div className="relative">
                {/* 흑백 처리는 펭귄에만 — 💤 는 색을 유지합니다 */}
                <PenguinAvatar
                  look={profileLook(profile)}
                  size={PENGUIN}
                  className={`${sleeping ? 'animate-sleep opacity-70 grayscale' : ''} ${
                    selectedId === profile.id
                      ? 'drop-shadow-[0_2px_6px_rgba(91,132,228,0.8)]'
                      : ''
                  }`}
                />
                {/* 쉬는 중이면 머리맡에 💤 */}
                {sleeping && (
                  <span
                    aria-hidden
                    className="animate-zzz absolute -top-1 -right-1 text-sm pointer-events-none"
                  >
                    💤
                  </span>
                )}
              </div>
            </button>
          )
        })
      )}

      {/* ── 말풍선 ── */}
      {selected && bubble && (
        <>
          {/* 바깥을 누르면 닫힙니다 */}
          <button
            type="button"
            aria-label="말풍선 닫기"
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 z-10 cursor-default"
          />
          <div
            // 프로필이 바뀌면 다시 붙어서 높이를 새로 잽니다
            key={selected.id}
            ref={(node) => setBubbleH(node?.offsetHeight ?? 0)}
            className="absolute z-30 overflow-y-auto"
            style={bubble.style}
          >
            <div className="relative">
              <ProfileBubble profile={selected} />
              {/* 펭귄을 가리키는 꼬리 */}
              {bubble.showTail && (
                <span
                  className="absolute w-3 h-3 bg-white border-peri-100 rotate-45"
                  style={
                    bubble.above
                      ? {
                          left: bubble.tailX,
                          bottom: -7,
                          borderRightWidth: 1,
                          borderBottomWidth: 1,
                        }
                      : {
                          left: bubble.tailX,
                          top: -7,
                          borderLeftWidth: 1,
                          borderTopWidth: 1,
                        }
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
