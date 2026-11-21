import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Disc3,
  ListMusic,
  Pencil,
  Play,
  Shuffle,
  Trash2,
} from 'lucide-react'
import { TrackRow } from '@/components/track/TrackRow'
import { Artwork } from '@/components/ui/Artwork'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Skeleton, TrackRowSkeleton } from '@/components/ui/Skeleton'
import { usePlayer } from '@/features/player/store'
import { usePlaylistDetail } from '@/lib/hooks'
import {
  deletePlaylist,
  movePlaylistTrack,
  removeTrackFromPlaylist,
  renamePlaylist,
} from '@/lib/library'
import { formatLongDuration, shuffleArray } from '@/lib/utils'

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const detail = usePlaylistDetail(id)
  const playQueue = usePlayer((state) => state.playQueue)

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (renameOpen && detail?.playlist) setName(detail.playlist.name)
  }, [renameOpen, detail?.playlist])

  const tracks = detail?.tracks ?? []
  const totalDuration = useMemo(
    () => tracks.reduce((total, track) => total + (track.duration ?? 0), 0),
    [tracks],
  )

  const handleRename = async () => {
    if (!id || !name.trim() || saving) return
    setSaving(true)
    try {
      await renamePlaylist(id, name)
      setRenameOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || saving) return
    setSaving(true)
    try {
      await deletePlaylist(id)
      navigate('/library')
    } finally {
      setSaving(false)
    }
  }

  if (detail === undefined) {
    return (
      <div className="animate-rise">
        <Skeleton className="h-5 w-24 rounded-full" />
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-44 w-44 rounded-[32px]" />
          <div className="w-full space-y-3">
            <Skeleton className="mx-auto h-4 w-20 rounded-full sm:mx-0" />
            <Skeleton className="mx-auto h-8 w-2/3 rounded-full sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-1/2 rounded-full sm:mx-0" />
          </div>
        </div>
        <div className="mt-8 rounded-card bg-white/60 p-2 shadow-card">
          {Array.from({ length: 6 }).map((_, index) => (
            <TrackRowSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (detail === null) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Playlist tidak ditemukan"
        description="Playlist ini mungkin sudah dihapus, atau tautannya tidak valid."
        action={
          <Link to="/library" className="btn-accent">
            Kembali ke Library
          </Link>
        }
      />
    )
  }

  const { playlist } = detail
  const cover = tracks.find((track) => track.artwork)?.artwork

  return (
    <div className="animate-rise">
      <Link
        to="/library"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Library
      </Link>

      <header className="relative mt-5 overflow-hidden rounded-panel bg-surface p-5 shadow-card sm:p-7">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent-soft blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-[32px] bg-surface-soft shadow-card sm:h-44 sm:w-44">
            {cover ? (
              <Artwork
                src={cover}
                alt={playlist.name}
                className="h-full w-full"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffe3e3,transparent_60%),linear-gradient(135deg,#ffffff,#f0f0f3)] text-accent/70">
                <ListMusic className="h-14 w-14" strokeWidth={1.4} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="section-label text-accent">Playlist</p>
            <h1 className="mt-1.5 break-words text-[26px] font-semibold leading-tight tracking-[-0.04em] sm:text-[34px]">
              {playlist.name}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {tracks.length} track
              {totalDuration > 0 ? ` · ${formatLongDuration(totalDuration)}` : ''}
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
                onClick={() => setRenameOpen(true)}
                className="icon-btn h-10 w-10 bg-white/70 shadow-card"
                aria-label="Ubah nama playlist"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="icon-btn h-10 w-10 bg-white/70 text-red-500 shadow-card hover:bg-red-50 hover:text-red-600"
                aria-label="Hapus playlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6">
        {tracks.length ? (
          <div className="rounded-card bg-white/60 p-2 shadow-card">
            {tracks.map((track, index) => (
              <TrackRow
                key={track.key}
                track={track}
                queue={tracks}
                index={index}
                showIndex
                onMoveUp={
                  index > 0 && id
                    ? () => void movePlaylistTrack(id, track.key, -1)
                    : undefined
                }
                onMoveDown={
                  index < tracks.length - 1 && id
                    ? () => void movePlaylistTrack(id, track.key, 1)
                    : undefined
                }
                onRemove={
                  id ? () => void removeTrackFromPlaylist(id, track.key) : undefined
                }
                removeLabel="Hapus dari playlist"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Disc3}
            title="Playlist masih kosong"
            description="Tambahkan track dari hasil pencarian, favorit, atau album Internet Archive."
            action={
              <Link to="/search" className="btn-accent">
                Cari musik
              </Link>
            }
          />
        )}
      </section>

      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Ubah nama playlist"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRenameOpen(false)}
              className="btn-ghost"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleRename()}
              disabled={!name.trim() || saving}
              className="btn-accent"
            >
              Simpan
            </button>
          </>
        }
      >
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleRename()
          }}
          className="field"
          placeholder="Nama playlist"
        />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Hapus playlist?"
        description={`"${playlist.name}" akan dihapus dari perangkat ini. Track aslinya tidak terpengaruh.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="btn-ghost"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving}
              className="btn-accent bg-red-500 shadow-none hover:bg-red-600"
            >
              Hapus playlist
            </button>
          </>
        }
      >
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-600">
          Tindakan ini tidak bisa dibatalkan.
        </p>
      </Modal>
    </div>
  )
}
