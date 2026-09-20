'use client'

import { useEffect, useState } from 'react'

interface Request {
  id: number
  message: string
  danger: boolean
  confirmText: string
  cancelText: string
  resolve: (ok: boolean) => void
}

let nextId = 1
let listener: ((req: Request | null) => void) | null = null

// window.confirm 대체. `if (await confirmDialog('정말 삭제할까요?')) { ... }` 처럼 씁니다
export function confirmDialog(
  message: string,
  options?: { danger?: boolean; confirmText?: string; cancelText?: string },
): Promise<boolean> {
  return new Promise((resolve) => {
    listener?.({
      id: nextId++,
      message,
      danger: options?.danger ?? false,
      confirmText: options?.confirmText ?? '확인',
      cancelText: options?.cancelText ?? '취소',
      resolve,
    })
  })
}

// 루트 레이아웃에 한 번만 넣어두면 어디서든 confirmDialog()를 쓸 수 있습니다
export default function ConfirmHost() {
  const [request, setRequest] = useState<Request | null>(null)

  useEffect(() => {
    listener = setRequest
    return () => {
      listener = null
    }
  }, [])

  if (!request) return null

  const close = (ok: boolean) => {
    request.resolve(ok)
    setRequest(null)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      onClick={() => close(false)}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {request.message}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => close(false)}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-semibold transition-colors"
          >
            {request.cancelText}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-colors ${
              request.danger
                ? 'bg-rose-400 hover:bg-rose-500'
                : 'bg-peri-400 hover:bg-peri-500'
            }`}
          >
            {request.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
