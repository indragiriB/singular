import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  HardDrive,
  Play,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { TrackRow } from '@/components/track/TrackRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import { usePlayer } from '@/features/player/store'
import { useDownloads } from '@/lib/hooks'
import { formatBytes, formatDate } from '@/lib/utils'

export function DownloadsPage() {
  const downloads = useDownloads()
  const { usage, quota, count, clearAll, saveToDevice } = useDownloadManager()
  const playQueue = usePlayer((state) => state.playQueue)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  const tracks = downloads.map((entry) => entry.track)
  const totalSize = downloads.reduce((total, entry) => total + entry.size, 0)
  const usagePercent =
    quota > 0
      ? Math.min(100, (usage / quota) * 100)
      : Math.min(100, (usage / (1024 * 1024 * 1024)) * 100)

  const handleClear = async () => {
    setClearing(true)
    try {
      await clearAll()
      setConfirmOpen(false)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="animate-rise">
      <header>
        <p className="section-label">Tanpa internet</p>
        <h1 className="title-xl mt-1">Downloads</h1>
        <p className="mt-1 text-sm text-muted">
          Track yang tersimpan di perangkat ini bisa diputar kapan saja.
        </p>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
              <HardDrive className="h-[18px] w-[18px]" />
            </span>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-semibold text-accent">
              {count} track
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
            {formatBytes(totalSize)}
          </p>
          <p className="mt-1 text-xs text-muted">Tersimpan offline</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${usage > 0 ? Math.max(2, usagePercent) : 0}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted">
            {formatBytes(usage)} dari {formatBytes(quota)} penyimpanan browser
          </p>
        </div>

        <div className="card flex flex-col justify-between p-5">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-4 text-sm font-semibold">Unduhan tetap di perangkat</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              File audio disimpan di Cache Storage browser. Tidak diunggah ke
              server mana pun. Menghapus data situs akan menghapus unduhan.
            </p>
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="btn-ghost mt-4 self-start bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Hapus semua unduhan
            </button>
          )}
        </div>
      </div>

      <section className="mt-9">
        <SectionHeader
          title="Tersimpan offline"
          subtitle="Tersedia tanpa koneksi internet"
          action={
            count > 0 ? (
              <button
                type="button"
                onClick={() => playQueue(tracks)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:opacity-75"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Putar semua
              </button>
            ) : undefined
          }
        />
        {downloads.length ? (
          <div className="space-y-2">
            {downloads.map((entry, index) => (
              <div
                key={entry.track.key}
                className="rounded-card bg-white/60 p-2 shadow-card"
              >
                <TrackRow
                  track={entry.track}
                  queue={tracks}
                  index={index}
                  rightSlot={
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[11px] font-semibold tabular-nums">
                        {formatBytes(entry.size)}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatDate(entry.downloadedAt)}
                      </p>
                    </div>
                  }
                />
                <div className="flex items-center justify-end px-2 pb-1">
                  <button
                    type="button"
                    onClick={() => void saveToDevice(entry.track)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted transition hover:text-accent"
                  >
                    <Download className="h-3 w-3" />
                    Simpan file ke perangkat
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Download}
            title="Belum ada unduhan"
            description="Ketuk ikon unduh pada track mana pun untuk menyimpannya offline. Track dari Internet Archive juga bisa disimpan sebagai file MP3."
            action={
              <Link to="/search" className="btn-accent">
                Temukan musik
              </Link>
            }
          />
        )}
      </section>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus semua unduhan?"
        description="Semua file audio offline akan dihapus dari perangkat ini. Playlist dan favorit tetap aman."
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
              onClick={() => void handleClear()}
              disabled={clearing}
              className="btn-accent bg-red-500 shadow-none hover:bg-red-600"
            >
              Hapus semua
            </button>
          </>
        }
      >
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-600">
          Kamu perlu mengunduh ulang jika ingin mendengarkan tanpa internet.
        </p>
      </Modal>
    </div>
  )
}
