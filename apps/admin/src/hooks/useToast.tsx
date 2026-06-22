import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; type: ToastType }
interface ToastContextValue { toast: (msg: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: string) => {
    clearTimeout(timers.current.get(id)); timers.current.delete(id)
    setToasts((p) => p.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((p) => [...p.slice(-4), { id, message, type }])
    timers.current.set(id, setTimeout(() => remove(id), 5000))
  }, [remove])

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} className="text-emerald-500 shrink-0" />,
    error:   <AlertCircle size={16} className="text-red-400 shrink-0" />,
    info:    <Info        size={16} className="text-blue-400 shrink-0" />,
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-80">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3 flex items-center gap-3 animate-slide-in">
            {icons[t.type]}
            <span className="text-sm font-medium text-slate-800 flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }
