'use client'

import { useEffect, useState } from 'react'

type ToastTone = 'default' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

let nextId = 1
let listeners: ((items: ToastItem[]) => void)[] = []
let items: ToastItem[] = []

const emit = () => listeners.forEach((listen) => listen(items))

// 다른 화면 어디서든 `toast('저장했어요')` 처럼 부르면 됩니다 (alert 대체).
// 에러 메시지는 `toast(message, 'error')`
export function toast(message: string, tone: ToastTone = 'default') {
  const id = nextId++
  items = [...items, { id, message, tone }]
  emit()
  setTimeout(() => {
    items = items.filter((item) => item.id !== id)
    emit()
  }, 2600)
}

// 루트 레이아웃에 한 번만 넣어두면 어디서든 toast()가 화면에 보입니다
export default function ToastHost() {
  const [visible, setVisible] = useState<ToastItem[]>([])

  useEffect(() => {
    listeners.push(setVisible)
    return () => {
      listeners = listeners.filter((listen) => listen !== setVisible)
    }
  }, [])

  if (visible.length === 0) return null

  return (
    <div className="fixed bottom-5 inset-x-4 z-[70] flex flex-col items-center gap-2 pointer-events-none">
      {visible.map((item) => (
        <div
          key={item.id}
          className={`animate-toast-in max-w-sm w-full sm:w-auto px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-center backdrop-blur-sm ${
            item.tone === 'error'
              ? 'bg-rose-500/95 text-white'
              : 'bg-slate-800/95 text-white'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  )
}
