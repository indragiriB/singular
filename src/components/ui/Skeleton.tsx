import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-black/[0.06]', className)}
    />
  )
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5 rounded-full" />
        <Skeleton className="h-3 w-1/4 rounded-full" />
      </div>
      <Skeleton className="h-3 w-8 rounded-full" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-[24px]" />
      <Skeleton className="h-3.5 w-4/5 rounded-full" />
      <Skeleton className="h-3 w-1/2 rounded-full" />
    </div>
  )
}
