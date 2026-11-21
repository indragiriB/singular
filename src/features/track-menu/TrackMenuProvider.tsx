import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  ChevronLeft,
  Disc3,
  Download,
  ExternalLink,
  FolderDown,
  Heart,
  ListEnd,
  ListPlus,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Artwork } from '@/components/ui/Artwork'
import { Sheet } from '@/components/ui/Sheet'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import { useLibrary } from '@/features/library/LibraryProvider'
import { usePlayer } from '@/features/player/store'
import type { Track } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MenuOptions {
  onRemove?: () => void
  removeLabel?: string
}

interface TrackMenuContextValue {
  openMenu: (track: Track, options?: MenuOptions) => void
}

const TrackMenuContext = createContext<TrackMenuContextValue | null>(null)

interface MenuRowProps {
  icon: typeof Download
  label: string
  description?: string
  onClick?: () => void
  href?: string
  danger?: boolean
}

function MenuRow({
  icon: Icon,
  label,
  description,
  onClick,
  href,
  danger,
}: MenuRowProps) {
  const content = (
    <>
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-full',
          danger ? 'bg-red-50 text-red-500' : 'bg-accent-soft text-accent',
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium">{label}</span>
        {description && (
          <span className="block truncate text-xs text-muted">
            {description}
          </span>
        )}
      </span>
    </>
  )

  const className =
    'flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-black/[0.035] active:scale-[0.995]'

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export function TrackMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [track, setTrack] = useState<Track | null>(null)
  const [options, setOptions] = useState<MenuOptions>({})
  const [view, setView] = useState<'menu' | 'playlist'>('menu')
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const { isFavorite, toggleFavorite, playlists, createPlaylist, addToPlaylist } =
    useLibrary()
  const { download, downloadedKeys, remove, saveToDevice } = useDownloadManager()
  const addToQueue = usePlayer((state) => state.addToQueue)

  const openMenu = (nextTrack: Track, nextOptions?: MenuOptions) => {
    setTrack(nextTrack)
    setOptions(nextOptions ?? {})
    setView('menu')
    setNewName('')
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setView('menu')
  }

  const handleShare = async () => {
    if (!track) return
    const url = track.permalink ?? window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `${track.title} — ${track.artist}`,
          url,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast.success('Link disalin')
      }
      close()
    } catch {
      // Pengguna membatalkan share.
    }
  }

  const handleCreateAndAdd = async () => {
    if (!track || !newName.trim() || saving) return
    setSaving(true)
    try {
      const playlist = await createPlaylist(newName)
      await addToPlaylist(playlist.id, track)
      close()
    } finally {
      setSaving(false)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!track || saving) return
    setSaving(true)
    try {
      await addToPlaylist(playlistId, track)
      close()
    } finally {
      setSaving(false)
    }
  }

  return (
    <TrackMenuContext.Provider value={{ openMenu }}>
      {children}
      <Sheet
        open={open}
        onClose={close}
        title={view === 'playlist' ? 'Tambah ke playlist' : 'Opsi track'}
        subtitle={
          view === 'playlist' ? 'Pilih playlist tujuan' : 'Putar, simpan, atau bagikan'
        }
      >
        {track && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-surface-soft p-3">
            <Artwork
              src={track.artwork}
              alt={track.title}
              className="h-14 w-14 shrink-0 rounded-2xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{track.title}</p>
              <p className="truncate text-xs text-muted">{track.artist}</p>
            </div>
            <button
              type="button"
              onClick={() => void toggleFavorite(track)}
              className="icon-btn h-10 w-10"
              aria-label={
                isFavorite(track.key)
                  ? 'Hapus dari favorit'
                  : 'Tambahkan ke favorit'
              }
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  isFavorite(track.key) && 'fill-accent text-accent',
                )}
              />
            </button>
          </div>
        )}

        {view === 'menu' ? (
          <div className="space-y-0.5">
            <MenuRow
              icon={ListPlus}
              label="Putar berikutnya"
              onClick={() => {
                if (!track) return
                addToQueue(track, true)
                toast.success('Ditambahkan ke antrian berikutnya')
                close()
              }}
            />
            <MenuRow
              icon={ListEnd}
              label="Tambah ke antrian"
              onClick={() => {
                if (!track) return
                addToQueue(track, false)
                toast.success('Ditambahkan ke antrian')
                close()
              }}
            />
            <MenuRow
              icon={Plus}
              label="Tambah ke playlist"
              onClick={() => setView('playlist')}
            />
            {track && downloadedKeys.has(track.key) ? (
              <MenuRow
                icon={Trash2}
                label="Hapus unduhan offline"
                danger
                onClick={() => {
                  void remove(track)
                  close()
                }}
              />
            ) : (
              <MenuRow
                icon={Download}
                label="Simpan offline"
                description="Diputar tanpa internet"
                onClick={() => {
                  if (!track) return
                  void download(track)
                  close()
                }}
              />
            )}
            <MenuRow
              icon={FolderDown}
              label="Simpan ke perangkat"
              description="Unduh file audio ke folder Downloads"
              onClick={() => {
                if (!track) return
                void saveToDevice(track)
                close()
              }}
            />
            <MenuRow icon={Share2} label="Bagikan" onClick={() => void handleShare()} />
            {track?.permalink && (
              <MenuRow
                icon={ExternalLink}
                label={
                  track.source === 'archive'
                    ? 'Buka di Internet Archive'
                    : 'Buka sumber asli'
                }
                href={track.permalink}
              />
            )}
            {options.onRemove && (
              <MenuRow
                icon={Trash2}
                label={options.removeLabel ?? 'Hapus dari playlist'}
                danger
                onClick={() => {
                  options.onRemove?.()
                  close()
                }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setView('menu')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali
            </button>

            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Nama playlist baru"
                className="field flex-1 py-3"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleCreateAndAdd()
                }}
              />
              <button
                type="button"
                onClick={() => void handleCreateAndAdd()}
                disabled={!newName.trim() || saving}
                className="btn-accent shrink-0 px-4 py-3"
              >
                Buat
              </button>
            </div>

            <div className="space-y-0.5">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => void handleAddToPlaylist(playlist.id)}
                  disabled={saving}
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-black/[0.035] disabled:opacity-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Disc3 className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {playlist.name}
                  </span>
                  <Plus className="h-4 w-4 text-muted" />
                </button>
              ))}
              {!playlists.length && (
                <p className="rounded-2xl bg-surface-soft px-4 py-5 text-center text-sm text-muted">
                  Belum ada playlist. Buat yang pertama di atas.
                </p>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </TrackMenuContext.Provider>
  )
}

export function useTrackMenu() {
  const context = useContext(TrackMenuContext)
  if (!context) {
    throw new Error('useTrackMenu harus dipakai di dalam TrackMenuProvider.')
  }
  return context
}
