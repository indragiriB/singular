import { Heart } from 'lucide-react'
import { useLibrary } from '@/features/library/LibraryProvider'
import type { Track } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  track: Track
  className?: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({
  track,
  className,
  size = 'md',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useLibrary()
  const active = isFavorite(track.key)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        void toggleFavorite(track)
      }}
      aria-label={active ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
      aria-pressed={active}
      className={cn(
        'icon-btn shrink-0',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        className,
      )}
    >
      <Heart
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          'transition',
          active && 'fill-accent text-accent',
        )}
        strokeWidth={1.9}
      />
    </button>
  )
}
