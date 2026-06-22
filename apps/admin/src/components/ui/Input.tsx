import React from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: { value: string; label: string }[]
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <input id={inputId} className={cn(
        'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 bg-white outline-none transition-all',
        'placeholder-slate-400 focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red',
        error ? 'border-red-400 bg-red-50' : 'border-slate-200',
        className,
      )} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint  && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <select id={inputId} className={cn(
        'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 bg-white outline-none transition-all',
        'focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red',
        error ? 'border-red-400' : 'border-slate-200',
        className,
      )} {...props}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={cn('w-10 h-5 rounded-full transition-colors duration-200', checked ? 'bg-emerald-500' : 'bg-slate-200')} />
        <div className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0')} />
      </div>
      {label && <span className="text-sm text-slate-700 font-medium">{label}</span>}
    </label>
  )
}
