import { Play } from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import { usePlayer } from '@/features/player/store'
import type { Track } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FavoriteButton } from './FavoriteButton'

interface TrackCardProps {
  track: Track
  queue?: Track[]
  subtitle?: string
  className?: string
}

export function TrackCard({ track, queue, subtitle, className }: TrackCardProps) {
  const playTrack = usePlayer((state) => state.playTrack)
  const current = usePlayer((state) => state.queue[state.index])
  const isCurrent = current?.key === track.key

  return (
    <div className={cn('group w-[156px] shrink-0 sm:w-[176px]', className)}>
      <div className="relative aspect-square overflow-hidden rounded-[24px] bg-surface shadow-card">
        <Artwork
          src={track.artwork}
          alt={track.title}
          className="h-full w-full transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
        <FavoriteButton
          track={track}
          size="sm"
          className="absolute right-2 top-2 bg-white/90 backdrop-blur hover:bg-white"
        />
        <button
          type="button"
          onClick={() => playTrack(track, queue)}
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-accent text-white shadow-accent transition hover:bg-accent-dark active:scale-95"
          aria-label={`Putar ${track.title}`}
        >
          <Play className="ml-0.5 h-4 w-4 fill-white" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => playTrack(track, queue)}
        className="mt-3 block w-full text-left"
      >
        <p
          className={cn(
            'truncate text-sm font-semibold tracking-[-0.01em]',
            isCurrent && 'text-accent',
          )}
        >
          {track.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {subtitle ?? track.artist}
        </p>
      </button>
    </div>
  )
}
