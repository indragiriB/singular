import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Disc3, Play, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AlbumCard } from '@/components/track/AlbumCard'
import { PlaylistCard } from '@/components/track/PlaylistCard'
import { TrackCard } from '@/components/track/TrackCard'
import { TrackRow } from '@/components/track/TrackRow'
import { Artwork } from '@/components/ui/Artwork'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  CardSkeleton,
  Skeleton,
  TrackRowSkeleton,
} from '@/components/ui/Skeleton'
import { useHistory, usePlaylistsWithMeta } from '@/lib/hooks'
import { usePlayer } from '@/features/player/store'
import type { Track } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getTrendingTracks } from '@/sources/audius'
import { searchArchiveItems } from '@/sources/archive'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'songs', label: 'Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
] as const

type TabId = (typeof tabs)[number]['id']

function HeroCard({ track, queue }: { track: Track; queue: Track[] }) {
  const playTrack = usePlayer((state) => state.playTrack)

  return (
    <div className="relative overflow-hidden rounded-panel bg-surface p-4 shadow-card sm:p-6">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent-soft blur-3xl" />
      <div className="absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-amber-100/70 blur-3xl" />
      <div className="relative flex items-center gap-4 sm:gap-6">
        <Artwork
          src={track.artwork}
          alt={track.title}
          className="h-28 w-28 shrink-0 rounded-[26px] shadow-card sm:h-36 sm:w-36"
        />
        <div className="min-w-0 flex-1">
          <p className="section-label text-accent">Trending this week</p>
          <h2 className="mt-1.5 line-clamp-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
            {track.title}
          </h2>
          <p className="mt-1 truncate text-sm text-muted">{track.artist}</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => playTrack(track, queue)}
              className="btn-accent"
            >
              <Play className="h-4 w-4 fill-white" />
              Putar
            </button>
            <span className="hidden rounded-full bg-black/[0.04] px-3 py-2 text-[11px] text-muted sm:inline-flex">
              {track.genre?.split(',')[0] ?? 'Music'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card bg-surface p-6 text-center shadow-card">
      <p className="text-sm text-muted">
        Gagal memuat musik. Periksa koneksi lalu coba lagi.
      </p>
      <button type="button" onClick={onRetry} className="btn-accent mt-4">
        Coba lagi
      </button>
    </div>
  )
}

export function HomePage() {
  const [tab, setTab] = useState<TabId>('overview')
  const navigate = useNavigate()
  const playTrack = usePlayer((state) => state.playTrack)

  const trendingQuery = useQuery({
    queryKey: ['audius', 'trending'],
    queryFn: () => getTrendingTracks(24),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const archiveQuery = useQuery({
    queryKey: ['archive', 'featured'],
    queryFn: () => searchArchiveItems('', 12),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  const history = useHistory(5)
  const playlists = usePlaylistsWithMeta()

  const trending = trendingQuery.data ?? []
  const archive = archiveQuery.data ?? []
  const hero = trending[0]
  const recent = history.length
    ? history.map((entry) => entry.track)
    : trending.slice(0, 4)

  const artists = useMemo(() => {
    const map = new Map<
      string,
      { name: string; avatar?: string; count: number }
    >()
    for (const track of trending) {
      const current = map.get(track.artist)
      if (current) current.count += 1
      else
        map.set(track.artist, {
          name: track.artist,
          avatar: track.artistAvatar ?? track.artwork,
          count: 1,
        })
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 12)
  }, [trending])

  return (
    <div className="animate-rise">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Your daily mix</p>
          <h1 className="title-xl mt-1">Listening</h1>
          <p className="mt-1 text-sm text-muted">
            Musik tanpa iklan, dari sumber yang legal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info('Belum ada notifikasi baru.')}
            className="icon-btn h-10 w-10 bg-white shadow-card"
            aria-label="Notifikasi"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-[11px] font-semibold text-white shadow-card">
            IB
          </span>
        </div>
      </header>

      <button
        type="button"
        onClick={() => navigate('/search')}
        className="mt-5 flex w-full items-center gap-3 rounded-full bg-surface px-5 py-3.5 text-left text-sm text-muted shadow-card transition hover:shadow-soft"
      >
        <Search className="h-4 w-4" />
        Search Music
        <span className="ml-auto hidden rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-semibold text-accent sm:block">
          Audius + Archive
        </span>
      </button>

      <div className="mt-5 flex gap-6 overflow-x-auto border-b border-black/[0.05] scrollbar-none">
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
            {tab === item.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overview' && (
          <div className="space-y-8">
            {trendingQuery.isLoading ? (
              <Skeleton className="h-44 w-full rounded-panel sm:h-48" />
            ) : trendingQuery.isError ? (
              <ErrorCard onRetry={() => void trendingQuery.refetch()} />
            ) : hero ? (
              <HeroCard track={hero} queue={trending} />
            ) : (
              <EmptyState
                title="Belum ada track"
                description="Coba muat ulang untuk mengambil musik terbaru."
              />
            )}

            <section>
              <SectionHeader
                title="Recommended for you"
                subtitle="Dari Audius, diperbarui tiap minggu"
                href="/search"
              />
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-7 sm:px-7">
                {trendingQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="w-[156px] shrink-0 sm:w-[176px]">
                        <CardSkeleton />
                      </div>
                    ))
                  : trending.slice(1, 9).map((track) => (
                      <TrackCard
                        key={track.key}
                        track={track}
                        queue={trending}
                        subtitle={track.artist}
                      />
                    ))}
              </div>
            </section>

            <section>
              <SectionHeader
                title="From Internet Archive"
                subtitle="Album dan rilisan berlisensi"
                href="/search"
              />
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-7 sm:px-7">
                {archiveQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="w-[156px] shrink-0 sm:w-[176px]">
                        <CardSkeleton />
                      </div>
                    ))
                  : archive.slice(0, 8).map((item) => (
                      <AlbumCard key={item.identifier} item={item} />
                    ))}
                {archiveQuery.isError && (
                  <p className="py-8 text-sm text-muted">
                    Internet Archive sedang tidak bisa dihubungi.
                  </p>
                )}
              </div>
            </section>

            {playlists.length > 0 && (
              <section>
                <SectionHeader
                  title="Your playlists"
                  subtitle="Koleksi pribadimu"
                  href="/library"
                />
                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-7 sm:px-7">
                  {playlists.slice(0, 6).map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      count={playlist.count}
                      cover={playlist.cover}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHeader
                title={history.length ? 'Recently played' : 'Start here'}
                subtitle={
                  history.length
                    ? 'Lanjutkan dari yang terakhir kamu dengar'
                    : 'Pilihan cepat untuk menemukan suara barumu'
                }
                href={history.length ? '/history' : undefined}
              />
              <div className="rounded-card bg-white/60 p-2 shadow-card">
                {recent.length ? (
                  recent.map((track, index) => (
                    <TrackRow
                      key={track.key}
                      track={track}
                      queue={recent}
                      index={index}
                      showIndex
                    />
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-muted">
                    Belum ada yang diputar.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {tab === 'songs' && (
          <section>
            <SectionHeader
              title="Trending songs"
              subtitle="Full track, tanpa iklan"
            />
            <div className="rounded-card bg-white/60 p-2 shadow-card">
              {trendingQuery.isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TrackRowSkeleton key={index} />
                ))
              ) : trendingQuery.isError ? (
                <ErrorCard onRetry={() => void trendingQuery.refetch()} />
              ) : (
                trending.map((track, index) => (
                  <TrackRow
                    key={track.key}
                    track={track}
                    queue={trending}
                    index={index}
                    showIndex
                  />
                ))
              )}
            </div>
          </section>
        )}

        {tab === 'albums' && (
          <section>
            <SectionHeader
              title="Internet Archive"
              subtitle="Album, netlabel, dan rekaman public domain"
            />
            {archiveQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            ) : archiveQuery.isError ? (
              <ErrorCard onRetry={() => void archiveQuery.refetch()} />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {archive.map((item) => (
                  <AlbumCard key={item.identifier} item={item} className="w-full" />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'artists' && (
          <section>
            <SectionHeader
              title="Artists"
              subtitle="Nama-nama yang sedang naik di Audius"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {artists.map((artist) => (
                <button
                  key={artist.name}
                  type="button"
                  onClick={() =>
                    navigate(`/search?q=${encodeURIComponent(artist.name)}`)
                  }
                  className="group flex items-center gap-3 rounded-card bg-white/70 p-3 text-left shadow-card transition hover:bg-white"
                >
                  <Artwork
                    src={artist.avatar}
                    alt={artist.name}
                    className="h-14 w-14 shrink-0 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{artist.name}</p>
                    <p className="text-xs text-muted">{artist.count} track</p>
                  </div>
                  <Disc3 className="ml-auto h-4 w-4 text-muted transition group-hover:text-accent" />
                </button>
              ))}
              {!artists.length && (
                <p className="text-sm text-muted">Belum ada artist untuk ditampilkan.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
