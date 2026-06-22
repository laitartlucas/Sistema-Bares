import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  )
}
