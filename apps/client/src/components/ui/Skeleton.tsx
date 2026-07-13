import { cn } from '../../utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-2xl bg-pizza-line', className)} />
}

export function FlavorCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-card flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-card flex flex-col gap-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}
