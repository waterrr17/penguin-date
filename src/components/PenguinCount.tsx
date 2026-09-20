'use client'

import { useEffect, useState } from 'react'
import { SAMPLE_PROFILES } from '@/data/sampleProfiles'
import { fetchProfiles } from '@/lib/supabase'

// 랜딩에 "지금 몇 마리가 돌아다니는지" 보여줍니다.
// 정적 배포라 빌드 시점에는 알 수 없어서 화면에서 불러옵니다
export default function PenguinCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchProfiles()
      .then((data) => {
        if (cancelled) return
        const list = data ?? SAMPLE_PROFILES
        setCount(list.filter((p) => p.isActive).length)
      })
      .catch(() => {
        // 실패하면 숫자를 감춥니다 (랜딩이 깨지는 것보다 낫습니다)
        if (!cancelled) setCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 자리를 미리 잡아둬서 숫자가 뜰 때 화면이 밀리지 않게 합니다
  return (
    <p className="h-5 text-xs text-slate-500">
      {count !== null && `지금 ${count}마리가 돌아다니는 중 🐧`}
    </p>
  )
}
