import { Link } from 'react-router-dom'
import { Heart, Play, Shuffle } from 'lucide-react'
import { TrackRow } from '@/components/track/TrackRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { usePlayer } from '@/features/player/store'
import { useFavorites } from '@/lib/hooks'
import { formatLongDuration, shuffleArray } from '@/lib/utils'

export function FavoritesPage() {
  const favorites = useFavorites()
  const playQueue = usePlayer((state) => state.playQueue)
  const totalDuration = favorites.reduce(
    (total, track) => total + (track.duration ?? 0),
    0,
  )

  return (
    <div className="animate-rise">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Ditandai dengan hati</p>
          <h1 className="title-xl mt-1">Favorites</h1>
          <p className="mt-1 text-sm text-muted">
            {favorites.length
              ? `${favorites.length} track · ${formatLongDuration(totalDuration)}`
              : 'Track favoritmu akan muncul di sini.'}
          </p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent shadow-card">
          <Heart className="h-5 w-5 fill-accent" />
        </span>
      </header>

      <section className="mt-6">
        <SectionHeader
          title="Semua favorit"
          subtitle="Tersimpan lokal di perangkat ini"
          action={
            favorites.length ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playQueue(favorites)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:opacity-75"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Putar
                </button>
                <button
                  type="button"
                  onClick={() => playQueue(shuffleArray(favorites))}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-ink"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Acak
                </button>
              </div>
            ) : undefined
          }
        />
        {favorites.length ? (
          <div className="rounded-card bg-white/60 p-2 shadow-card">
            {favorites.map((track, index) => (
              <TrackRow
                key={track.key}
                track={track}
                queue={favorites}
                index={index}
                showIndex
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Belum ada favorit"
            description="Ketuk ikon hati pada track mana pun. Favorit tersimpan di IndexedDB perangkat ini, tanpa akun."
            action={
              <Link to="/search" className="btn-accent">
                Cari musik
              </Link>
            }
          />
        )}
      </section>
    </div>
  )
}
