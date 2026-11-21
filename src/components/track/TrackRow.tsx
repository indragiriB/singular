import type { ReactNode } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pause,
  Play,
} from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import { usePlayer } from '@/features/player/store'
import { useTrackMenu } from '@/features/track-menu/TrackMenuProvider'
import type { Track } from '@/lib/types'
import { cn, formatTime } from '@/lib/utils'
import { DownloadButton } from './DownloadButton'
import { FavoriteButton } from './FavoriteButton'

interface TrackRowProps {
  track: Track
  queue?: Track[]
  index?: number
  showIndex?: boolean
  onRemove?: () => void
  removeLabel?: string
  onMoveUp?: () => void
  onMoveDown?: () => void
  rightSlot?: ReactNode
  className?: string
}

export function TrackRow({
  track,
  queue,
  index,
  showIndex = false,
  onRemove,
  removeLabel,
  onMoveUp,
  onMoveDown,
  rightSlot,
  className,
}: TrackRowProps) {
  const playTrack = usePlayer((state) => state.playTrack)
  const current = usePlayer((state) => state.queue[state.index])
  const isPlaying = usePlayer((state) => state.isPlaying)
  const toggle = usePlayer((state) => state.toggle)
  const { openMenu } = useTrackMenu()

  const isCurrent = current?.key === track.key

  const handlePlay = () => {
    if (isCurrent) {
      toggle()
      return
    }
    playTrack(track, queue)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handlePlay}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handlePlay()
        }
      }}
      aria-current={isCurrent ? 'true' : undefined}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 transition duration-200 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        isCurrent && 'bg-white/80',
        className,
      )}
    >
      {showIndex && (
        <span
          className={cn(
            'hidden w-5 shrink-0 text-center text-xs tabular-nums sm:block',
            isCurrent ? 'font-semibold text-accent' : 'text-muted',
          )}
        >
          {typeof index === 'number' ? index + 1 : ''}
        </span>
      )}

      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
        <Artwork
          src={track.artwork}
          alt={track.title}
          className="h-full w-full"
        />
        <div
          className={cn(
            'absolute inset-0 grid place-items-center bg-ink/35 text-white transition',
            isCurrent
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
          )}
        >
          {isCurrent && isPlaying ? (
            <span className="flex h-4 items-end gap-[2px]">
              <span
                className="eq-bar h-3 w-[3px] rounded-full bg-white"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="eq-bar h-4 w-[3px] rounded-full bg-white"
                style={{ animationDelay: '140ms' }}
              />
              <span
                className="eq-bar h-2.5 w-[3px] rounded-full bg-white"
                style={{ animationDelay: '280ms' }}
              />
            </span>
          ) : isCurrent ? (
            <Pause className="h-4 w-4 fill-white" />
          ) : (
            <Play className="h-4 w-4 fill-white" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium leading-snug',
            isCurrent && 'text-accent',
          )}
        >
          {track.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">{track.artist}</p>
      </div>

      {track.genre && (
        <span className="hidden max-w-[110px] truncate rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium text-muted lg:block">
          {track.genre.split(',')[0]}
        </span>
      )}

      <span className="hidden w-10 shrink-0 text-right text-xs tabular-nums text-muted sm:block">
        {formatTime(track.duration)}
      </span>

      <FavoriteButton track={track} size="sm" className="hidden sm:grid" />
      <DownloadButton track={track} size="sm" className="hidden md:grid" />

      {onMoveUp && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onMoveUp()
          }}
          className="icon-btn hidden h-8 w-8 opacity-0 group-hover:opacity-100 lg:grid"
          aria-label="Naikkan"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onMoveDown()
          }}
          className="icon-btn hidden h-8 w-8 opacity-0 group-hover:opacity-100 lg:grid"
          aria-label="Turunkan"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {rightSlot}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          openMenu(track, { onRemove, removeLabel })
        }}
        className="icon-btn h-8 w-8 shrink-0"
        aria-label="Opsi track"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  )
}
