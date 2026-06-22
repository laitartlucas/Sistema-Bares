import { cn } from '../../utils/cn'

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }
  return (
    <div className={cn('rounded-full border-slate-200 border-t-pizza-red animate-spin', sizes[size], className)} />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Spinner size="lg" />
    </div>
  )
}
