import { useMemo, useRef, useState } from 'react'
import { clamp, cn, hashString } from '@/lib/utils'

interface WaveformProps {
  progress: number
  onSeek?: (ratio: number) => void
  seed?: string
  bars?: number
  className?: string
  interactive?: boolean
}

export function Waveform({
  progress,
  onSeek,
  seed = 'singular',
  bars = 52,
  className,
  interactive = true,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const heights = useMemo(() => {
    const hash = hashString(seed)
    return Array.from({ length: bars }, (_, index) => {
      const mixed = (hash >> (index % 24)) ^ (index * 2654435761)
      return 22 + (Math.abs(mixed) % 66)
    })
  }, [seed, bars])

  const safeProgress = clamp(progress, 0, 1)

  const seek = (clientX: number) => {
    if (!interactive || !onSeek) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    onSeek(clamp((clientX - rect.left) / rect.width, 0, 1))
  }

  return (
    <div
      ref={containerRef}
      role={interactive ? 'slider' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? 'Posisi lagu' : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeProgress * 100)}
      onPointerDown={(event) => {
        if (!interactive) return
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
        seek(event.clientX)
      }}
      onPointerMove={(event) => {
        if (dragging) seek(event.clientX)
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        if (!interactive || !onSeek) return
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          onSeek(clamp(safeProgress + 0.05, 0, 1))
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          onSeek(clamp(safeProgress - 0.05, 0, 1))
        }
      }}
      className={cn(
        'flex h-10 items-center gap-[2px] outline-none',
        interactive && 'cursor-pointer touch-none',
        className,
      )}
    >
      {heights.map((height, index) => {
        const played = (index + 0.5) / bars <= safeProgress
        return (
          <span
            key={index}
            style={{ height: `${height}%` }}
            className={cn(
              'flex-1 rounded-full transition-colors duration-150',
              played ? 'bg-accent' : 'bg-ink/10',
            )}
          />
        )
      })}
    </div>
  )
}
