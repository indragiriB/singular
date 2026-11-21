import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mic2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePlayer } from '@/features/player/store'
import {
  fetchLyrics,
  findActiveLyricLine,
  parseSyncedLyrics,
} from '@/lib/lyrics'
import { cn } from '@/lib/utils'

export function LyricsSheet() {
  const open = usePlayer((state) => state.lyricsOpen)
  const setOpen = usePlayer((state) => state.setLyricsOpen)
  const track = usePlayer((state) => state.queue[state.index])
  const currentTime = usePlayer((state) => state.currentTime)

  const { data, isLoading } = useQuery({
    queryKey: ['lyrics', track?.key],
    queryFn: () => (track ? fetchLyrics(track) : Promise.resolve(null)),
    enabled: open && Boolean(track),
    staleTime: 60 * 60 * 1000,
    retry: false,
  })

  const lines = useMemo(() => parseSyncedLyrics(data?.synced), [data?.synced])
  const activeLine = findActiveLyricLine(lines, currentTime)
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([])

  useEffect(() => {
    if (!open || activeLine < 0) return
    lineRefs.current[activeLine]?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }, [activeLine, open])

  if (!open) return null

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title="Lirik"
      subtitle={track ? `${track.title} — ${track.artist}` : undefined}
      footer={
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted">
          <span>Lirik disediakan oleh LRCLIB</span>
          <a
            href="https://lrclib.net"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent transition hover:opacity-75"
          >
            lrclib.net
          </a>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4 py-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                'mx-auto h-4 rounded-full',
                index % 3 === 0 ? 'w-3/5' : index % 2 === 0 ? 'w-4/5' : 'w-2/3',
              )}
            />
          ))}
        </div>
      ) : lines.length ? (
        <div className="space-y-1 py-12 text-center">
          {lines.map((line, index) => (
            <p
              key={`${line.time}-${index}`}
              ref={(element) => {
                lineRefs.current[index] = element
              }}
              className={cn(
                'px-2 text-[15px] leading-8 transition duration-300',
                index === activeLine
                  ? 'scale-[1.02] font-semibold text-accent'
                  : 'text-muted/75',
              )}
            >
              {line.text}
            </p>
          ))}
        </div>
      ) : data?.plain ? (
        <div className="whitespace-pre-line py-4 text-center text-[15px] leading-8 text-ink-soft">
          {data.plain}
        </div>
      ) : (
        <EmptyState
          icon={Mic2}
          title="Lirik tidak tersedia"
          description="LRCLIB belum punya lirik untuk track ini. Coba track lain atau cari versi yang berbeda."
        />
      )}
    </Sheet>
  )
}
