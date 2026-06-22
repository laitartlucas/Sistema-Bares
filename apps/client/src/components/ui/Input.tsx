import React from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export function Input({ label, error, leftIcon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-pizza-dark">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pizza-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-pizza-dark placeholder-pizza-muted/60',
            'transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red',
            error ? 'border-red-400 bg-red-50' : 'border-gray-200',
            leftIcon !== undefined ? 'pl-10' : undefined,
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-pizza-dark">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={cn(
          'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-pizza-dark placeholder-pizza-muted/60 resize-none',
          'transition-all duration-150 outline-none',
          'focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red',
          error ? 'border-red-400 bg-red-50' : 'border-gray-200',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
