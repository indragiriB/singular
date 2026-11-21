import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  href?: string
  actionLabel?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  href,
  actionLabel = 'Lihat semua',
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold tracking-[-0.025em]">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action ??
        (href ? (
          <Link
            to={href}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent transition hover:opacity-75"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null)}
    </div>
  )
}
