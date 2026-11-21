import { Link } from 'react-router-dom'
import { ListMusic, Plus } from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import type { Playlist } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PlaylistCardProps {
  playlist: Playlist
  count?: number
  cover?: string
  className?: string
}

export function PlaylistCard({
  playlist,
  count = 0,
  cover,
  className,
}: PlaylistCardProps) {
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className={cn('group block w-[156px] shrink-0 sm:w-[176px]', className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-[24px] bg-surface shadow-card">
        {cover ? (
          <Artwork
            src={cover}
            alt={playlist.name}
            className="h-full w-full transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffe3e3,transparent_60%),linear-gradient(135deg,#ffffff,#f0f0f3)] text-accent/70">
            <ListMusic className="h-12 w-12" strokeWidth={1.4} />
          </div>
        )}
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-ink backdrop-blur">
          {count} track
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold tracking-[-0.01em]">
        {playlist.name}
      </p>
      <p className="mt-0.5 truncate text-xs text-muted">Playlist pribadi</p>
    </Link>
  )
}

export function CreatePlaylistCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-[156px] shrink-0 text-left sm:w-[176px]"
    >
      <div className="grid aspect-square place-items-center rounded-[24px] border-2 border-dashed border-black/10 bg-white/40 transition group-hover:border-accent/30 group-hover:bg-accent-soft/40">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-accent shadow-card">
          <Plus className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold tracking-[-0.01em]">
        Playlist baru
      </p>
      <p className="mt-0.5 truncate text-xs text-muted">Kumpulkan track favoritmu</p>
    </button>
  )
}
