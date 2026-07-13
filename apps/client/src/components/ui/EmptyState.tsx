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
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6 gap-4',
      'bg-white border-2 border-dashed border-pizza-border rounded-4xl',
      className,
    )}>
      <div className="w-20 h-20 rounded-full bg-pizza-honey flex items-center justify-center text-pizza-red text-3xl">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-2xl text-pizza-dark">{title}</h3>
        {description && <p className="text-sm text-pizza-muted mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
