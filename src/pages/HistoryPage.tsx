import { useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Play, Trash2 } from 'lucide-react'
import { TrackRow } from '@/components/track/TrackRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { usePlayer } from '@/features/player/store'
import { useHistory } from '@/lib/hooks'
import { clearHistory } from '@/lib/library'
import { formatDate } from '@/lib/utils'

export function HistoryPage() {
  const history = useHistory(100)
  const playQueue = usePlayer((state) => state.playQueue)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  const tracks = history.map((entry) => entry.track)

  const handleClear = async () => {
    setClearing(true)
    try {
      await clearHistory()
      setConfirmOpen(false)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="animate-rise">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">Jejak mendengarkan</p>
          <h1 className="title-xl mt-1">History</h1>
          <p className="mt-1 text-sm text-muted">
            {history.length
              ? `${history.length} track terakhir diputar`
              : 'Belum ada track yang diputar.'}
          </p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent shadow-card">
          <History className="h-5 w-5" />
        </span>
      </header>

      <section className="mt-6">
        <SectionHeader
          title="Recently played"
          subtitle="Hanya tersimpan di perangkat ini"
          action={
            history.length ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => playQueue(tracks)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition hover:opacity-75"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Putar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            ) : undefined
          }
        />
        {history.length ? (
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div
                key={`${entry.track.key}-${entry.playedAt}-${index}`}
                className="rounded-card bg-white/60 p-2 shadow-card"
              >
                <TrackRow
                  track={entry.track}
                  queue={tracks}
                  index={index}
                  showIndex
                  rightSlot={
                    <span className="hidden shrink-0 text-[10px] text-muted sm:block">
                      {formatDate(entry.playedAt)}
                    </span>
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="Riwayat masih kosong"
            description="Setiap track yang kamu dengarkan akan tercatat di sini secara otomatis."
            action={
              <Link to="/" className="btn-accent">
                Mulai mendengarkan
              </Link>
            }
          />
        )}
      </section>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus riwayat?"
        description="Riwayat mendengarkan akan dihapus dari perangkat ini. Favorit dan playlist tetap aman."
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
              Hapus riwayat
            </button>
          </>
        }
      >
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-600">
          Kamu tidak bisa mengembalikan riwayat setelah dihapus.
        </p>
      </Modal>
    </div>
  )
}
