import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  BadgeCheck,
  Database,
  Download,
  HardDrive,
  Info,
  Lock,
  ServerOff,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import { usePlayer } from '@/features/player/store'
import { db } from '@/lib/db'
import { clearAllUserData } from '@/lib/library'
import { clearAudioCache } from '@/lib/offline'
import { formatBytes } from '@/lib/utils'

const APP_VERSION = '0.1.0'
const REPO_URL = 'https://github.com/indragiriB/singular'

function SettingRow({
  icon: Icon,
  title,
  description,
  badge,
  badgeTone = 'accent',
  action,
}: {
  icon: typeof BadgeCheck
  title: string
  description: string
  badge?: string
  badgeTone?: 'accent' | 'muted'
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl px-2 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          {badge && (
            <span
              className={
                badgeTone === 'accent'
                  ? 'rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent'
                  : 'rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-semibold text-muted'
              }
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { usage, quota, count, refreshStorage } = useDownloadManager()
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [exporting, setExporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    const storage = navigator.storage
    if (!storage?.persisted) {
      setPersisted(false)
      return
    }
    let active = true
    storage
      .persisted()
      .then((value) => {
        if (active) setPersisted(value)
      })
      .catch(() => {
        if (active) setPersisted(false)
      })
    return () => {
      active = false
    }
  }, [])

  const usagePercent =
    quota > 0
      ? Math.min(100, (usage / quota) * 100)
      : Math.min(100, (usage / (1024 * 1024 * 1024)) * 100)

  const handlePersist = async () => {
    if (!navigator.storage?.persist) {
      toast.info('Browser ini tidak mendukung penyimpanan permanen.')
      return
    }
    const granted = await navigator.storage.persist()
    setPersisted(granted)
    if (granted) {
      toast.success('Penyimpanan permanen aktif. Unduhan lebih aman.')
    } else {
      toast.info('Browser menolak permintaan. Unduhan tetap tersimpan sementara.')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const [tracks, favorites, playlists, playlistItems, history] =
        await Promise.all([
          db.tracks.toArray(),
          db.favorites.toArray(),
          db.playlists.toArray(),
          db.playlistItems.toArray(),
          db.history.toArray(),
        ])
      const payload = {
        app: 'singular',
        version: 1,
        exportedAt: new Date().toISOString(),
        tracks,
        favorites,
        playlists,
        playlistItems,
        history,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `singular-library-${new Date()
        .toISOString()
        .slice(0, 10)}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
      toast.success('Library diekspor sebagai JSON')
    } catch {
      toast.error('Gagal mengekspor library.')
    } finally {
      setExporting(false)
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await clearAllUserData()
      await clearAudioCache()
      await db.settings.clear()
      usePlayer.setState({
        queue: [],
        index: 0,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        nowPlayingOpen: false,
        queueOpen: false,
        lyricsOpen: false,
      })
      try {
        localStorage.removeItem('singular-player')
      } catch {
        // Abaikan mode privat.
      }
      await refreshStorage()
      setConfirmOpen(false)
      navigate('/')
      toast.success('Semua data lokal sudah dihapus')
    } catch {
      toast.error('Gagal menghapus data. Coba lagi.')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="animate-rise">
      <header>
        <p className="section-label">Preferensi & info</p>
        <h1 className="title-xl mt-1">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Semua data Singular tersimpan di perangkatmu. Tidak ada akun, tidak ada
          server.
        </p>
      </header>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-2">
          <h2 className="text-sm font-semibold">Sumber musik</h2>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-muted shadow-card">
            Legal
          </span>
        </div>
        <div className="card divide-y divide-line p-2">
          <SettingRow
            icon={BadgeCheck}
            title="Audius"
            badge="Aktif"
            description="Streaming full track dari API publik Audius. Track bisa disimpan offline lewat cache browser."
          />
          <SettingRow
            icon={BadgeCheck}
            title="Internet Archive"
            badge="Aktif"
            description="Album netlabel dan rekaman public domain. Streaming langsung serta unduhan MP3 asli."
          />
          <SettingRow
            icon={ServerOff}
            title="YouTube"
            badge="Butuh backend"
            badgeTone="muted"
            description="Streaming YouTube membutuhkan server yt-dlp + ffmpeg dan tidak mungkin dilakukan dari situs statis. Adapter sudah disiapkan untuk versi backend nanti."
            action={
              <a
                href={`${REPO_URL}#roadmap`}
                target="_blank"
                rel="noreferrer"
                className="icon-btn h-9 w-9 shrink-0 bg-black/[0.04]"
                aria-label="Baca roadmap"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            }
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-2 text-sm font-semibold">Penyimpanan offline</h2>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
                <HardDrive className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {formatBytes(usage)}{' '}
                  <span className="text-xs font-normal text-muted">
                    · {count} track
                  </span>
                </p>
                <p className="text-[11px] text-muted">
                  Kuota browser: {formatBytes(quota)}
                </p>
              </div>
            </div>
            <span
              className={
                persisted
                  ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600'
                  : 'rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-semibold text-muted'
              }
            >
              {persisted ? 'Permanen' : 'Sementara'}
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${usage > 0 ? Math.max(2, usagePercent) : 0}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handlePersist()}
              className="btn-ghost bg-surface-soft text-xs"
            >
              <Lock className="h-3.5 w-3.5" />
              Minta penyimpanan permanen
            </button>
            <button
              type="button"
              onClick={() => navigate('/downloads')}
              className="btn-ghost bg-surface-soft text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Kelola unduhan
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Browser bisa membersihkan data situs saat penyimpanan menipis.
            Aktifkan penyimpanan permanen agar unduhan tidak hilang.
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-2 text-sm font-semibold">Data pribadi</h2>
        <div className="card divide-y divide-line p-2">
          <SettingRow
            icon={Database}
            title="Ekspor library"
            description="Unduh salinan playlist, favorit, dan riwayat dalam format JSON."
            action={
              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={exporting}
                className="btn-ghost shrink-0 bg-surface-soft text-xs"
              >
                {exporting ? 'Menyiapkan...' : 'Ekspor'}
              </button>
            }
          />
          <SettingRow
            icon={Trash2}
            title="Hapus semua data lokal"
            description="Menghapus playlist, favorit, riwayat, dan semua file offline dari perangkat ini."
            action={
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="btn-ghost shrink-0 bg-red-50 text-xs text-red-500 hover:bg-red-100 hover:text-red-600"
              >
                Hapus
              </button>
            }
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-2 text-sm font-semibold">Tentang</h2>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-accent">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                Singular{' '}
                <span className="text-xs font-normal text-muted">
                  v{APP_VERSION}
                </span>
              </p>
              <p className="text-[11px] text-muted">
                Your music, singular. Tanpa iklan, tanpa akun.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-surface-soft p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <p className="text-[11px] leading-relaxed text-muted">
              Singular tidak meng-host file audio. Semua audio dialirkan langsung
              dari Audius dan Internet Archive sesuai lisensi masing-masing
              penyedia. Repo ini tidak berisi file berhak cipta.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-soft p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <p className="text-[11px] leading-relaxed text-muted">
              Ingin memasang Singular seperti aplikasi? Buka menu browser lalu
              pilih <span className="font-semibold">Add to Home Screen</span> /{' '}
              <span className="font-semibold">Install app</span>.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost bg-surface-soft text-xs"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://audius.co"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost bg-surface-soft text-xs"
            >
              Audius
            </a>
            <a
              href="https://archive.org/details/audio"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost bg-surface-soft text-xs"
            >
              Internet Archive
            </a>
            <a
              href="https://lrclib.net"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost bg-surface-soft text-xs"
            >
              LRCLIB
            </a>
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-[10px] text-muted">
        Dibuat untuk penggunaan pribadi · React + Vite + PWA
      </p>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus semua data lokal?"
        description="Playlist, favorit, riwayat, dan semua file offline akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="btn-ghost"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleClearAll()}
              disabled={clearing}
              className="btn-accent bg-red-500 shadow-none hover:bg-red-600"
            >
              {clearing ? 'Menghapus...' : 'Hapus semua'}
            </button>
          </>
        }
      >
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-600">
          Ekspor library terlebih dahulu jika kamu ingin menyimpan salinannya.
        </p>
      </Modal>
    </div>
  )
}
