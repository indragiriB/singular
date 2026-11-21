import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  Heart,
  History,
  Library,
  ListMusic,
  Plus,
  Shuffle,
} from 'lucide-react'
import { PlaylistCard, CreatePlaylistCard } from '@/components/track/PlaylistCard'
import { TrackRow } from '@/components/track/TrackRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDownloads, useFavorites, useHistory, usePlaylistsWithMeta } from '@/lib/hooks'
import { useLibrary } from '@/features/library/LibraryProvider'
import { usePlayer } from '@/features/player/store'
import { formatBytes, shuffleArray } from '@/lib/utils'

export function LibraryPage() {
  const playlists = usePlaylistsWithMeta()
  const favorites = useFavorites()
  const downloads = useDownloads()
  const history = useHistory(100)
  const recent = history.slice(0, 5)
  const { createPlaylist } = useLibrary()
  const playQueue = usePlayer((state) => state.playQueue)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const downloadSize = downloads.reduce((total, entry) => total + entry.size, 0)

  const handleCreate = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await createPlaylist(name)
      setName('')
      setCreateOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-rise">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Koleksi pribadimu</p>
          <h1 className="title-xl mt-1">My Music</h1>
          <p className="mt-1 text-sm text-muted">
            Playlist, favorit, dan unduhan — semuanya tersimpan di perangkat ini.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="btn-accent hidden shrink-0 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Playlist
        </button>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          to="/favorites"
          className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
            <Heart className="h-[18px] w-[18px]" />
          </span>
          <span className="text-2xl font-semibold tracking-[-0.03em]">
            {favorites.length}
          </span>
          <span className="text-[11px] font-medium text-muted">Favorit</span>
        </Link>
        <Link
          to="/downloads"
          className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
            <Download className="h-[18px] w-[18px]" />
          </span>
          <span className="text-2xl font-semibold tracking-[-0.03em]">
            {downloads.length}
          </span>
          <span className="text-[11px] font-medium text-muted">
            Offline · {formatBytes(downloadSize)}
          </span>
        </Link>
        <Link
          to="/library"
          className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
            <ListMusic className="h-[18px] w-[18px]" />
          </span>
          <span className="text-2xl font-semibold tracking-[-0.03em]">
            {playlists.length}
          </span>
          <span className="text-[11px] font-medium text-muted">Playlist</span>
        </Link>
        <Link
          to="/history"
          className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
            <History className="h-[18px] w-[18px]" />
          </span>
          <span className="text-2xl font-semibold tracking-[-0.03em]">
            {history.length}
          </span>
          <span className="text-[11px] font-medium text-muted">Riwayat</span>
        </Link>
      </div>

      <section className="mt-9">
        <SectionHeader
          title="Your playlists"
          subtitle="Susun musik sesuai suasana hatimu"
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:opacity-75 sm:hidden"
            >
              <Plus className="h-3.5 w-3.5" />
              Baru
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <CreatePlaylistCard onClick={() => setCreateOpen(true)} />
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              count={playlist.count}
              cover={playlist.cover}
              className="w-full"
            />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHeader
          title="Favorites"
          subtitle="Track yang kamu tandai hati"
          href="/favorites"
        />
        {favorites.length ? (
          <>
            <div className="rounded-card bg-white/60 p-2 shadow-card">
              {favorites.slice(0, 5).map((track, index) => (
                <TrackRow
                  key={track.key}
                  track={track}
                  queue={favorites}
                  index={index}
                  showIndex
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => playQueue(favorites)}
                className="btn-accent"
              >
                Putar semua
              </button>
              <button
                type="button"
                onClick={() => playQueue(shuffleArray(favorites))}
                className="btn-ghost bg-white/70 shadow-card"
              >
                <Shuffle className="h-4 w-4" />
                Acak
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Heart}
            title="Belum ada favorit"
            description="Ketuk ikon hati pada track mana pun untuk menyimpannya di sini."
            action={
              <Link to="/search" className="btn-accent">
                Cari musik
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-9">
        <SectionHeader
          title="Recently played"
          subtitle="Lanjutkan dari yang terakhir kamu dengar"
          href="/history"
        />
        {recent.length ? (
          <div className="rounded-card bg-white/60 p-2 shadow-card">
            {recent.map((entry, index) => (
              <TrackRow
                key={`${entry.track.key}-${entry.playedAt}`}
                track={entry.track}
                queue={recent.map((item) => item.track)}
                index={index}
                showIndex
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Library}
            title="Riwayat masih kosong"
            description="Track yang kamu putar akan muncul di sini secara otomatis."
          />
        )}
      </section>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Playlist baru"
        description="Beri nama playlist ini. Kamu bisa mengubahnya nanti."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="btn-ghost"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!name.trim() || saving}
              className="btn-accent"
            >
              Buat playlist
            </button>
          </>
        }
      >
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleCreate()
          }}
          placeholder="Contoh: Late night drive"
          className="field"
        />
      </Modal>
    </div>
  )
}
