import React from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, leftIcon, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary:   'bg-brand-flame text-white hover:shadow-brand focus:ring-pizza-red shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-200',
    danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-300',
    success:   'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400 shadow-sm',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm', xl: 'px-6 py-3 text-base' }

  return (
    <button disabled={disabled || loading} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : leftIcon}
      {children}
    </button>
  )
}
