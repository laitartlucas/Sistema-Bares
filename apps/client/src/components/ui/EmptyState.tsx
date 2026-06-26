import React from 'react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6 gap-4', className)}>
      <div className="w-24 h-24 rounded-4xl bg-brand-flame-soft flex items-center justify-center text-pizza-red text-4xl shadow-card">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-extrabold text-pizza-dark text-xl">{title}</h3>
        {description && <p className="text-sm text-pizza-muted mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
