import { ListMusic, X } from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import { EmptyState } from '@/components/ui/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import { usePlayer } from '@/features/player/store'
import { cn, formatTime } from '@/lib/utils'

export function QueueSheet() {
  const open = usePlayer((state) => state.queueOpen)
  const setOpen = usePlayer((state) => state.setQueueOpen)
  const queue = usePlayer((state) => state.queue)
  const index = usePlayer((state) => state.index)
  const playQueue = usePlayer((state) => state.playQueue)
  const removeFromQueue = usePlayer((state) => state.removeFromQueue)
  const clearQueue = usePlayer((state) => state.clearQueue)

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title="Antrian"
      subtitle={`${queue.length} track`}
      footer={
        queue.length > 1 ? (
          <button
            type="button"
            onClick={clearQueue}
            className="btn-ghost w-full text-accent hover:bg-accent-soft"
          >
            Bersihkan antrian, sisakan track ini
          </button>
        ) : undefined
      }
    >
      {queue.length ? (
        <div className="space-y-0.5">
          {queue.map((track, itemIndex) => {
            const isCurrent = itemIndex === index
            return (
              <div
                key={`${track.key}-${itemIndex}`}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-2 py-2 transition',
                  isCurrent ? 'bg-accent-soft/70' : 'hover:bg-black/[0.035]',
                )}
              >
                <button
                  type="button"
                  onClick={() => playQueue(queue, itemIndex)}
                  className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl"
                  aria-label={`Putar ${track.title}`}
                >
                  <Artwork
                    src={track.artwork}
                    alt={track.title}
                    className="h-full w-full"
                  />
                  {isCurrent && (
                    <span className="absolute inset-0 grid place-items-center bg-ink/30 text-[10px] font-semibold text-white">
                      Now
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => playQueue(queue, itemIndex)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      isCurrent && 'text-accent',
                    )}
                  >
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-muted">{track.artist}</p>
                </button>
                <span className="hidden w-9 text-right text-[11px] tabular-nums text-muted sm:block">
                  {formatTime(track.duration)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromQueue(itemIndex)}
                  className="icon-btn h-8 w-8"
                  aria-label="Hapus dari antrian"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={ListMusic}
          title="Antrian kosong"
          description="Pilih track dari halaman mana pun untuk mulai memutar musik."
        />
      )}
    </Sheet>
  )
}
