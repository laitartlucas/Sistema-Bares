import { cn } from '../../utils/cn'

type BadgeVariant = 'gray' | 'blue' | 'amber' | 'green' | 'red' | 'purple'

interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string }

const styles: Record<BadgeVariant, string> = {
  gray:   'bg-slate-100 text-slate-600',
  blue:   'bg-blue-100 text-blue-700',
  amber:  'bg-amber-100 text-amber-700',
  green:  'bg-emerald-100 text-emerald-700',
  red:    'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-700',
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', styles[variant], className)}>
      {children}
    </span>
  )
}
