import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Play,
  Shuffle,
} from 'lucide-react'
import { TrackRow } from '@/components/track/TrackRow'
import { Artwork } from '@/components/ui/Artwork'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton, TrackRowSkeleton } from '@/components/ui/Skeleton'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import { usePlayer } from '@/features/player/store'
import {
  formatLongDuration,
  shuffleArray,
} from '@/lib/utils'
import { getArchiveItem, getArchiveItemUrl } from '@/sources/archive'

export function AlbumPage() {
  const { identifier } = useParams<{ identifier: string }>()
  const playQueue = usePlayer((state) => state.playQueue)
  const { downloadMany } = useDownloadManager()

  const query = useQuery({
    queryKey: ['archive', 'item', identifier],
    queryFn: () => getArchiveItem(identifier as string),
    enabled: Boolean(identifier),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  const tracks = query.data?.tracks ?? []
  const totalDuration = useMemo(
    () => tracks.reduce((total, track) => total + (track.duration ?? 0), 0),
    [tracks],
  )

  if (query.isLoading) {
    return (
      <div className="animate-rise">
        <Skeleton className="h-5 w-24 rounded-full" />
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-44 w-44 rounded-[32px]" />
          <div className="w-full space-y-3">
            <Skeleton className="mx-auto h-4 w-24 rounded-full sm:mx-0" />
            <Skeleton className="mx-auto h-8 w-2/3 rounded-full sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-1/2 rounded-full sm:mx-0" />
          </div>
        </div>
        <div className="mt-8 rounded-card bg-white/60 p-2 shadow-card">
          {Array.from({ length: 8 }).map((_, index) => (
            <TrackRowSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Rilis tidak bisa dimuat"
        description="Internet Archive tidak merespons, atau rilis ini sudah tidak tersedia. Coba lagi nanti."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="btn-accent"
            >
              Coba lagi
            </button>
            <Link to="/search" className="btn-ghost">
              Kembali mencari
            </Link>
          </div>
        }
      />
    )
  }

  const { item } = query.data

  return (
    <div className="animate-rise">
      <Link
        to="/search"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Search
      </Link>

      <header className="relative mt-5 overflow-hidden rounded-panel bg-surface p-5 shadow-card sm:p-7">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent-soft blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-[32px] shadow-card sm:h-44 sm:w-44">
            <Artwork
              src={item.artwork}
              alt={item.title}
              className="h-full w-full"
            />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="section-label text-accent">Internet Archive</p>
            <h1 className="mt-1.5 break-words text-[26px] font-semibold leading-tight tracking-[-0.04em] sm:text-[34px]">
              {item.title}
            </h1>
            <p className="mt-1.5 truncate text-sm text-muted">
              {item.creator}
              {item.year ? ` · ${item.year}` : ''}
            </p>
            <p className="mt-1 text-xs text-muted">
              {tracks.length} track
              {totalDuration > 0
                ? ` · ${formatLongDuration(totalDuration)}`
                : ''}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={() => playQueue(tracks)}
                disabled={!tracks.length}
                className="btn-accent"
              >
                <Play className="h-4 w-4 fill-white" />
                Putar semua
              </button>
              <button
                type="button"
                onClick={() => playQueue(shuffleArray(tracks))}
                disabled={!tracks.length}
                className="btn-ghost bg-white/70 shadow-card"
              >
                <Shuffle className="h-4 w-4" />
                Acak
              </button>
              <button
                type="button"
                onClick={() => void downloadMany(tracks)}
                disabled={!tracks.length}
                className="btn-ghost bg-white/70 shadow-card"
              >
                <Download className="h-4 w-4" />
                Unduh semua
              </button>
              <a
                href={getArchiveItemUrl(item.identifier)}
                target="_blank"
                rel="noreferrer"
                className="icon-btn h-10 w-10 bg-white/70 shadow-card"
                aria-label="Buka di Internet Archive"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {item.license && (
        <p className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-[11px] leading-relaxed text-muted shadow-card">
          Lisensi:{' '}
          <a
            href={item.license}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            {item.license}
          </a>
          . File audio dialirkan langsung dari Internet Archive.
        </p>
      )}

      <section className="mt-5">
        {tracks.length ? (
          <div className="rounded-card bg-white/60 p-2 shadow-card">
            {tracks.map((track, index) => (
              <TrackRow
                key={track.key}
                track={track}
                queue={tracks}
                index={index}
                showIndex
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tidak ada file MP3"
            description="Rilis ini tidak punya file MP3 yang bisa diputar di browser."
          />
        )}
      </section>
    </div>
  )
}
