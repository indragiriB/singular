import { Link } from 'react-router-dom'
import { ArrowUpRight, Disc3 } from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import type { ArchiveItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AlbumCardProps {
  item: ArchiveItem
  className?: string
}

export function AlbumCard({ item, className }: AlbumCardProps) {
  return (
    <Link
      to={`/album/${encodeURIComponent(item.identifier)}`}
      className={cn('group block w-[156px] shrink-0 sm:w-[176px]', className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-[24px] bg-surface shadow-card">
        <Artwork
          src={item.artwork}
          alt={item.title}
          className="h-full w-full transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink opacity-0 backdrop-blur transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink backdrop-blur">
          <Disc3 className="h-3 w-3 text-accent" />
          Album
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold tracking-[-0.01em]">
        {item.title}
      </p>
      <p className="mt-0.5 truncate text-xs text-muted">
        {item.creator}
        {item.year ? ` · ${item.year}` : ''}
      </p>
    </Link>
  )
}
