import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 animate-fade bg-ink/30 backdrop-blur-[2px]"
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-2xl animate-sheet flex-col overflow-hidden rounded-t-[32px] bg-surface shadow-soft sm:bottom-4 sm:rounded-[32px]',
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" />
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-lg font-semibold tracking-[-0.02em]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="icon-btn h-9 w-9 shrink-0 bg-black/[0.04]"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-1 sm:px-6">
          {children}
        </div>
        {footer && (
          <div className="border-t border-line px-5 py-4 sm:px-6">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
