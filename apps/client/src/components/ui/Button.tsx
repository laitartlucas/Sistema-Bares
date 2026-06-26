import React from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-display font-bold rounded-2xl press-effect transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-pizza-cream disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary:   'bg-brand-flame text-white shadow-brand hover:shadow-brand-lg focus:ring-pizza-red',
    secondary: 'bg-brand-50 text-pizza-red border border-brand-200 hover:bg-brand-100 focus:ring-brand-300',
    ghost:     'text-pizza-muted hover:bg-brand-50 hover:text-pizza-red focus:ring-brand-200',
    danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-300',
    dark:      'bg-pizza-dark text-white shadow-card-lg hover:bg-black focus:ring-pizza-dark',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
