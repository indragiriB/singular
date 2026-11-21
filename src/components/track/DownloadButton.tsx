import { Check, Download, Loader2 } from 'lucide-react'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import type { Track } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DownloadButtonProps {
  track: Track
  className?: string
  size?: 'sm' | 'md'
}

export function DownloadButton({
  track,
  className,
  size = 'md',
}: DownloadButtonProps) {
  const { downloadedKeys, progress, download } = useDownloadManager()
  const active = downloadedKeys.has(track.key)
  const value = progress[track.key]
  const downloading = value !== undefined

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        void download(track)
      }}
      aria-label={active ? 'Tersimpan offline' : 'Simpan offline'}
      title={
        active
          ? 'Tersimpan offline'
          : downloading
            ? `Mengunduh ${Math.round((value ?? 0) * 100)}%`
            : 'Simpan offline'
      }
      className={cn(
        'icon-btn shrink-0',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        active && 'text-accent',
        className,
      )}
    >
      {downloading ? (
        <Loader2
          className={cn(
            'animate-spin',
            size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          )}
        />
      ) : active ? (
        <Check className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      ) : (
        <Download className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      )}
    </button>
  )
}
