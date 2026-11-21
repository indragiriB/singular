import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Disc3, Search, X } from 'lucide-react'
import { AlbumCard } from '@/components/track/AlbumCard'
import { TrackRow } from '@/components/track/TrackRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  CardSkeleton,
  TrackRowSkeleton,
} from '@/components/ui/Skeleton'
import { useDebouncedValue } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { getTrendingTracks, searchAudiusTracks } from '@/sources/audius'
import { searchArchiveItems } from '@/sources/archive'

const suggestions = [
  'Lo-fi',
  'House',
  'Jazz',
  'Ambient',
  'Hip Hop',
  'Electronic',
  'Classical',
  'Rock',
]

const tabs = [
  { id: 'tracks', label: 'Tracks' },
  { id: 'albums', label: 'Albums' },
] as const

type TabId = (typeof tabs)[number]['id']

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [tab, setTab] = useState<TabId>('tracks')
  const debounced = useDebouncedValue(query, 400)
  const trimmed = debounced.trim()
  const isSearching = trimmed.length >= 2

  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (current === query.trim()) return
    const params = new URLSearchParams(searchParams)
    if (query.trim()) params.set('q', query)
    else params.delete('q')
    setSearchParams(params, { replace: true })
    // Hanya sinkronisasi saat query berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const trackQuery = useQuery({
    queryKey: ['audius', 'search', trimmed],
    queryFn: () => searchAudiusTracks(trimmed, 30),
    enabled: isSearching,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })

  const albumQuery = useQuery({
    queryKey: ['archive', 'search', trimmed],
    queryFn: () => searchArchiveItems(trimmed, 24),
    enabled: isSearching,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const trendingQuery = useQuery({
    queryKey: ['audius', 'trending'],
    queryFn: () => getTrendingTracks(12),
    enabled: !isSearching,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const featuredArchiveQuery = useQuery({
    queryKey: ['archive', 'featured'],
    queryFn: () => searchArchiveItems('', 12),
    enabled: !isSearching,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  const tracks = trackQuery.data ?? []
  const albums = albumQuery.data ?? []
  const discoveryTracks = trendingQuery.data ?? []
  const discoveryAlbums = featuredArchiveQuery.data ?? []

  const counts = useMemo(
    () => ({ tracks: tracks.length, albums: albums.length }),
    [tracks.length, albums.length],
  )

  return (
    <div className="animate-rise">
      <header>
        <p className="section-label">Find your sound</p>
        <h1 className="title-xl mt-1">Search</h1>
        <p className="mt-1 text-sm text-muted">
          Cari track dari Audius dan rilis dari Internet Archive.
        </p>
      </header>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari lagu, artist, atau album..."
          className="field py-4 pl-12 pr-12"
          autoFocus
          aria-label="Cari musik"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="icon-btn absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 bg-black/[0.04]"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isSearching ? (
        <div className="mt-8 space-y-9">
          <section>
            <SectionHeader
              title="Jelajahi genre"
              subtitle="Ketuk untuk mulai mencari"
            />
            <div className="flex flex-wrap gap-2">
              {suggestions.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setQuery(genre)}
                  className="chip px-4 py-2.5"
                >
                  {genre}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="Trending sekarang"
              subtitle="Dari Audius"
            />
            <div className="rounded-card bg-white/60 p-2 shadow-card">
              {trendingQuery.isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TrackRowSkeleton key={index} />
                ))
              ) : discoveryTracks.length ? (
                discoveryTracks.map((track, index) => (
                  <TrackRow
                    key={track.key}
                    track={track}
                    queue={discoveryTracks}
                    index={index}
                    showIndex
                  />
                ))
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  Trending sedang tidak tersedia.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionHeader
              title="Album pilihan"
              subtitle="Internet Archive"
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {featuredArchiveQuery.isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <CardSkeleton key={index} />
                  ))
                : discoveryAlbums.map((item) => (
                    <AlbumCard
                      key={item.identifier}
                      item={item}
                      className="w-full"
                    />
                  ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex gap-6 overflow-x-auto border-b border-black/[0.05] scrollbar-none">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'relative shrink-0 pb-3 text-sm font-medium transition',
                  tab === item.id ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {item.label}
                <span className="ml-1.5 text-[11px] text-muted">
                  {counts[item.id]}
                </span>
                {tab === item.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>

          {tab === 'tracks' && (
            <div className="mt-5">
              {trackQuery.isLoading ? (
                <div className="rounded-card bg-white/60 p-2 shadow-card">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TrackRowSkeleton key={index} />
                  ))}
                </div>
              ) : trackQuery.isError ? (
                <EmptyState
                  title="Gagal mencari track"
                  description="Audius sedang tidak bisa dihubungi. Periksa koneksi lalu coba lagi."
                  action={
                    <button
                      type="button"
                      onClick={() => void trackQuery.refetch()}
                      className="btn-accent"
                    >
                      Coba lagi
                    </button>
                  }
                />
              ) : tracks.length ? (
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
                  icon={Search}
                  title={`Tidak ada hasil untuk "${trimmed}"`}
                  description="Coba kata kunci lain, atau cari judul album di tab Albums."
                />
              )}
            </div>
          )}

          {tab === 'albums' && (
            <div className="mt-5">
              {albumQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : albumQuery.isError ? (
                <EmptyState
                  title="Gagal mencari album"
                  description="Internet Archive sedang tidak bisa dihubungi. Coba lagi sebentar."
                  action={
                    <button
                      type="button"
                      onClick={() => void albumQuery.refetch()}
                      className="btn-accent"
                    >
                      Coba lagi
                    </button>
                  }
                />
              ) : albums.length ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {albums.map((item) => (
                    <AlbumCard
                      key={item.identifier}
                      item={item}
                      className="w-full"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Disc3}
                  title={`Tidak ada album untuk "${trimmed}"`}
                  description="Internet Archive tidak menemukan rilis yang cocok. Coba kata kunci yang lebih umum."
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
