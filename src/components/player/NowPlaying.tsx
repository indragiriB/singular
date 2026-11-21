import { useEffect, useRef } from 'react'
import {
  Check,
  ChevronDown,
  Download,
  ListMusic,
  ListPlus,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { toast } from 'sonner'
import { Artwork } from '@/components/ui/Artwork'
import { useDownloadManager } from '@/features/downloads/DownloadsProvider'
import { useLibrary } from '@/features/library/LibraryProvider'
import { usePlayer } from '@/features/player/store'
import { useTrackMenu } from '@/features/track-menu/TrackMenuProvider'
import { cn, formatTime } from '@/lib/utils'
import { FavoriteButton } from '@/components/track/FavoriteButton'
import { Waveform } from './Waveform'

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Mic2
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-w-[56px] flex-col items-center gap-1.5 rounded-2xl px-2 py-2 text-[10px] font-medium text-muted transition hover:bg-white/70 hover:text-ink',
        active && 'text-accent',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  )
}

export function NowPlaying() {
  const open = usePlayer((state) => state.nowPlayingOpen)
  const queue = usePlayer((state) => state.queue)
  const index = usePlayer((state) => state.index)
  const current = queue[index]
  const isPlaying = usePlayer((state) => state.isPlaying)
  const currentTime = usePlayer((state) => state.currentTime)
  const duration = usePlayer((state) => state.duration)
  const volume = usePlayer((state) => state.volume)
  const muted = usePlayer((state) => state.muted)
  const shuffle = usePlayer((state) => state.shuffle)
  const repeat = usePlayer((state) => state.repeat)
  const toggle = usePlayer((state) => state.toggle)
  const next = usePlayer((state) => state.next)
  const prev = usePlayer((state) => state.prev)
  const seek = usePlayer((state) => state.seek)
  const setVolume = usePlayer((state) => state.setVolume)
  const toggleMute = usePlayer((state) => state.toggleMute)
  const toggleShuffle = usePlayer((state) => state.toggleShuffle)
  const cycleRepeat = usePlayer((state) => state.cycleRepeat)
  const openNowPlaying = usePlayer((state) => state.openNowPlaying)
  const setQueueOpen = usePlayer((state) => state.setQueueOpen)
  const setLyricsOpen = usePlayer((state) => state.setLyricsOpen)
  const { isFavorite } = useLibrary()
  const { downloadedKeys, download } = useDownloadManager()
  const { openMenu } = useTrackMenu()

  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !current) return null

  const totalDuration = duration || current.duration || 0
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat
  const prevTrack = queue[index - 1]
  const nextTrack = queue[index + 1]
  const downloaded = downloadedKeys.has(current.key)

  const handleShare = async () => {
    const url = current.permalink ?? window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: current.title,
          text: `${current.title} — ${current.artist}`,
          url,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast.success('Link disalin')
      }
    } catch {
      // Dibatalkan pengguna.
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <Artwork
          src={current.artwork}
          alt=""
          className="h-full w-full scale-125 opacity-35 blur-[90px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-canvas" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto px-5 pb-8 pt-3 sm:px-8">
        <div
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientY ?? null
          }}
          onTouchEnd={(event) => {
            const end = event.changedTouches[0]?.clientY
            if (
              touchStart.current !== null &&
              end !== undefined &&
              end - touchStart.current > 80
            ) {
              openNowPlaying(false)
            }
            touchStart.current = null
          }}
          className="flex items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={() => openNowPlaying(false)}
            className="icon-btn h-10 w-10 bg-white/60 backdrop-blur"
            aria-label="Tutup pemutar"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Now Playing
            </p>
            <p className="truncate text-xs text-ink-soft">
              {current.source === 'archive' ? 'Internet Archive' : 'Audius'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="icon-btn h-10 w-10 bg-white/60 backdrop-blur"
            aria-label="Bagikan"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-1 flex-col justify-center">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <div className="hidden w-24 shrink-0 sm:block">
              {prevTrack && (
                <Artwork
                  src={prevTrack.artwork}
                  alt={prevTrack.title}
                  className="h-24 w-24 rounded-[26px] opacity-45 blur-[1.5px]"
                />
              )}
            </div>
            <div className="relative aspect-square w-[min(76vw,360px)] shrink-0 overflow-hidden rounded-[36px] shadow-soft">
              <Artwork
                src={current.artwork}
                alt={current.title}
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/40" />
            </div>
            <div className="hidden w-24 shrink-0 sm:block">
              {nextTrack && (
                <Artwork
                  src={nextTrack.artwork}
                  alt={nextTrack.title}
                  className="h-24 w-24 rounded-[26px] opacity-45 blur-[1.5px]"
                />
              )}
            </div>
          </div>

          <div className="mt-7 flex items-start gap-3">
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.03em] sm:text-[26px]">
                {current.title}
              </h1>
              <p className="mt-1 truncate text-sm text-muted">{current.artist}</p>
            </div>
            <FavoriteButton track={current} className="bg-white/60 backdrop-blur" />
          </div>

          <div className="mt-4">
            <Waveform
              progress={progress}
              onSeek={(ratio) => seek(ratio * totalDuration)}
              seed={current.key}
              bars={64}
              className="h-12"
            />
            <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn(
                'icon-btn h-11 w-11',
                shuffle && 'bg-accent-soft text-accent',
              )}
              aria-label="Acak"
              aria-pressed={shuffle}
            >
              <Shuffle className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={prev}
              className="icon-btn h-11 w-11"
              aria-label="Sebelumnya"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="mx-1 grid h-[68px] w-[68px] place-items-center rounded-full bg-accent text-white shadow-accent transition hover:bg-accent-dark active:scale-95"
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-white" />
              ) : (
                <Play className="ml-1 h-7 w-7 fill-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => next()}
              className="icon-btn h-11 w-11"
              aria-label="Berikutnya"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className={cn(
                'icon-btn h-11 w-11',
                repeat !== 'off' && 'bg-accent-soft text-accent',
              )}
              aria-label="Ulangi"
            >
              <RepeatIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-auto mt-5 flex w-full max-w-sm items-center gap-3 rounded-full bg-white/60 px-4 py-2.5 backdrop-blur">
            <button
              type="button"
              onClick={toggleMute}
              className="icon-btn h-7 w-7"
              aria-label={muted ? 'Nyalakan suara' : 'Bisukan'}
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="range flex-1"
              aria-label="Volume"
            />
            <span className="w-9 text-right text-[10px] tabular-nums text-muted">
              {Math.round((muted ? 0 : volume) * 100)}%
            </span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1 sm:gap-3">
            <ActionButton
              icon={Mic2}
              label="Lirik"
              onClick={() => setLyricsOpen(true)}
            />
            <ActionButton
              icon={ListMusic}
              label="Antrian"
              onClick={() => setQueueOpen(true)}
            />
            <ActionButton
              icon={downloaded ? Check : Download}
              label={downloaded ? 'Offline' : 'Simpan'}
              active={downloaded}
              onClick={() => void download(current)}
            />
            <ActionButton
              icon={ListPlus}
              label="Playlist"
              onClick={() => openMenu(current)}
            />
            <ActionButton
              icon={Share2}
              label="Bagikan"
              onClick={() => void handleShare()}
            />
          </div>

          {current.permalink && (
            <a
              href={current.permalink}
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-4 text-[11px] font-medium text-muted underline-offset-4 transition hover:text-accent hover:underline"
            >
              Buka sumber asli
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
