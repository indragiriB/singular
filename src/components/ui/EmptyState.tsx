import type { LucideIcon } from 'lucide-react'
import { Music2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Music2,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-card bg-surface px-6 py-12 text-center shadow-card ${className ?? ''}`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-7 w-7" strokeWidth={1.7} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
