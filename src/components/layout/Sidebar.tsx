import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Compass,
  Disc3,
  Download,
  Heart,
  Home,
  Library,
  ListMusic,
  Plus,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import { useLibrary } from '@/features/library/LibraryProvider'
import { cn, formatBytes } from '@/lib/utils'

const mainNav = [
  { to: '/', label: 'Listening', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'My Music', icon: Library },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/downloads', label: 'Downloads', icon: Download },
]

export function Sidebar() {
  const { playlists, createPlaylist } = useLibrary()
  const { count, usage, quota } = useDownloadManager()
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

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

  const usagePercent =
    quota > 0 ? Math.min(100, (usage / quota) * 100) : Math.min(100, usage / (1024 * 1024 * 1024) * 100)

  return (
    <aside className="fixed bottom-3 left-3 top-3 z-30 hidden w-[252px] flex-col rounded-[32px] bg-white/80 p-4 shadow-card backdrop-blur-xl lg:flex">
      <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white shadow-accent">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-[22px] font-semibold tracking-[-0.055em]">
          singular<span className="text-accent">.</span>
        </span>
      </Link>

      <nav className="mt-5 space-y-1">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Menu
        </p>
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-soft hover:bg-black/[0.04] hover:text-ink',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
            <span className="flex-1">{item.label}</span>
            {item.to === '/downloads' && count > 0 && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-accent">
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between px-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Playlists
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="icon-btn h-7 w-7 bg-white"
          aria-label="Playlist baru"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1 scrollbar-none">
        {playlists.slice(0, 7).map((playlist) => (
          <Link
            key={playlist.id}
            to={`/playlists/${playlist.id}`}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft transition hover:bg-black/[0.04] hover:text-ink"
          >
            <Disc3 className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">{playlist.name}</span>
          </Link>
        ))}
        {!playlists.length && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-muted transition hover:bg-black/[0.04] hover:text-ink"
          >
            <ListMusic className="h-4 w-4" />
            Buat playlist pertama
          </button>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-surface-soft p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-ink-soft">Offline</span>
          <span className="text-muted">{formatBytes(usage)}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${usage > 0 ? Math.max(2, usagePercent) : 0}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted">
          {count} track tersimpan di perangkat ini
        </p>
      </div>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'mt-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
            isActive
              ? 'bg-accent-soft text-accent'
              : 'text-ink-soft hover:bg-black/[0.04] hover:text-ink',
          )
        }
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.9} />
        Settings
      </NavLink>

      <div className="mt-2 flex items-center gap-2.5 rounded-2xl px-2 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-[10px] font-semibold text-white">
          IB
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">Personal library</p>
          <p className="truncate text-[10px] text-muted">Tanpa akun · lokal</p>
        </div>
        <Compass className="ml-auto h-3.5 w-3.5 text-muted" />
      </div>

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
    </aside>
  )
}
