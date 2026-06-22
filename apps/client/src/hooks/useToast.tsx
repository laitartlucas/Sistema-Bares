import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: string) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev.slice(-3), { id, message, type }])
      const t = setTimeout(() => remove(id), 4000)
      timers.current.set(id, t)
    },
    [remove],
  )

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
    error:   <AlertCircle  size={18} className="text-red-400 shrink-0" />,
    info:    <Info         size={18} className="text-blue-500 shrink-0" />,
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-soft border border-gray-100 px-4 py-3 flex items-center gap-3 animate-slide-up"
          >
            {icons[t.type]}
            <span className="text-sm font-medium text-pizza-dark flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 ml-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
