import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { useStorageEstimate } from '@/lib/hooks'
import { deleteDownload, saveDownload } from '@/lib/library'
import {
  cacheTrackAudio,
  clearAudioCache,
  saveTrackToDevice,
} from '@/lib/offline'
import type { Track } from '@/lib/types'

interface DownloadOptions {
  silent?: boolean
}

interface DownloadsContextValue {
  downloadedKeys: Set<string>
  progress: Record<string, number>
  count: number
  usage: number
  quota: number
  download: (track: Track, options?: DownloadOptions) => Promise<boolean>
  downloadMany: (tracks: Track[]) => Promise<void>
  remove: (track: Track) => Promise<void>
  saveToDevice: (track: Track) => Promise<void>
  clearAll: () => Promise<void>
  refreshStorage: () => Promise<void>
}

const DownloadsContext = createContext<DownloadsContextValue | null>(null)

export function DownloadsProvider({ children }: { children: ReactNode }) {
  const entries = useLiveQuery(() => db.downloads.toArray(), [], [])
  const downloadedKeys = useMemo(
    () => new Set(entries.map((entry) => entry.key)),
    [entries],
  )
  const [progress, setProgress] = useState<Record<string, number>>({})
  const inFlight = useRef(new Set<string>())
  const storage = useStorageEstimate()

  const download = async (track: Track, options?: DownloadOptions) => {
    if (downloadedKeys.has(track.key)) {
      if (!options?.silent) toast.info('Track ini sudah tersimpan offline')
      return true
    }
    if (inFlight.current.has(track.key)) return false

    inFlight.current.add(track.key)
    setProgress((current) => ({ ...current, [track.key]: 0 }))

    try {
      const size = await cacheTrackAudio(track, (loaded, total) => {
        setProgress((current) => ({
          ...current,
          [track.key]: total > 0 ? Math.min(1, loaded / total) : 0,
        }))
      })
      await saveDownload(track, size)
      await storage.refresh()
      if (!options?.silent) {
        toast.success(`"${track.title}" tersimpan offline`)
      }
      return true
    } catch (error) {
      if (!options?.silent) {
        toast.error(
          error instanceof Error ? error.message : 'Gagal menyimpan offline.',
        )
      }
      return false
    } finally {
      inFlight.current.delete(track.key)
      setProgress((current) => {
        const next = { ...current }
        delete next[track.key]
        return next
      })
    }
  }

  const downloadMany = async (tracks: Track[]) => {
    const pending = tracks.filter(
      (track) => !downloadedKeys.has(track.key) && !inFlight.current.has(track.key),
    )
    if (!pending.length) {
      toast.info('Semua track sudah tersimpan offline')
      return
    }

    let completed = 0
    const queue = [...pending]
    const worker = async () => {
      for (;;) {
        const track = queue.shift()
        if (!track) break
        const ok = await download(track, { silent: true })
        if (ok) completed += 1
      }
    }

    toast.info(`Menyimpan ${pending.length} track secara offline...`)
    await Promise.all([worker(), worker()])
    await storage.refresh()
    toast.success(`${completed} track tersimpan offline`)
  }

  const remove = async (track: Track) => {
    await deleteDownload(track)
    await storage.refresh()
    toast.success('Unduhan dihapus')
  }

  const saveToDevice = async (track: Track) => {
    try {
      await saveTrackToDevice(track)
      toast.success('File disimpan ke perangkat')
    } catch {
      toast.error('Gagal menyimpan file ke perangkat.')
    }
  }

  const clearAll = async () => {
    await clearAudioCache()
    await db.downloads.clear()
    await storage.refresh()
    toast.success('Semua unduhan dihapus')
  }

  return (
    <DownloadsContext.Provider
      value={{
        downloadedKeys,
        progress,
        count: entries.length,
        usage: storage.usage ?? 0,
        quota: storage.quota ?? 0,
        download,
        downloadMany,
        remove,
        saveToDevice,
        clearAll,
        refreshStorage: storage.refresh,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  )
}

export function useDownloadManager() {
  const context = useContext(DownloadsContext)
  if (!context) {
    throw new Error(
      'useDownloadManager harus dipakai di dalam DownloadsProvider.',
    )
  }
  return context
}
