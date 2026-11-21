import {
  ListMusic,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import { usePlayer } from '@/features/player/store'
import { cn, formatTime } from '@/lib/utils'
import { FavoriteButton } from '@/components/track/FavoriteButton'
import { Waveform } from './Waveform'

export function PlayerBar() {
  const current = usePlayer((state) => state.queue[state.index])
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

  if (!current) return null

  const progress = duration > 0 ? currentTime / duration : 0
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  return (
    <>
      <div className="fixed inset-x-3 bottom-[calc(78px+env(safe-area-inset-bottom))] z-40 lg:hidden">
        <div className="relative overflow-hidden rounded-[24px] bg-white/95 shadow-soft backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-black/5">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-3 p-2.5">
            <button
              type="button"
              onClick={() => openNowPlaying(true)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <Artwork
                src={current.artwork}
                alt={current.title}
                className="h-11 w-11 shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">
                  {current.title}
                </p>
                <p className="truncate text-[11px] text-muted">
                  {current.artist}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={toggle}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white shadow-accent"
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => next()}
              className="icon-btn h-9 w-9 shrink-0"
              aria-label="Track berikutnya"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 left-[276px] right-5 z-40 hidden lg:block">
        <div className="relative overflow-hidden rounded-[28px] bg-white/95 shadow-soft backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-black/5">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-4 p-3 pr-4">
            <button
              type="button"
              onClick={() => openNowPlaying(true)}
              className="flex w-[24%] min-w-0 items-center gap-3 text-left"
            >
              <Artwork
                src={current.artwork}
                alt={current.title}
                className="h-14 w-14 shrink-0 rounded-2xl"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{current.title}</p>
                <p className="truncate text-xs text-muted">{current.artist}</p>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={toggleShuffle}
                className={cn(
                  'icon-btn h-9 w-9',
                  shuffle && 'bg-accent-soft text-accent',
                )}
                aria-label="Acak"
                aria-pressed={shuffle}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={prev}
                className="icon-btn h-9 w-9"
                aria-label="Sebelumnya"
              >
                <SkipBack className="h-4 w-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={toggle}
                className="mx-1 grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-accent transition hover:bg-accent-dark active:scale-95"
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? (
                  <Pause className="h-[18px] w-[18px] fill-white" />
                ) : (
                  <Play className="ml-0.5 h-[18px] w-[18px] fill-white" />
                )}
              </button>
              <button
                type="button"
                onClick={() => next()}
                className="icon-btn h-9 w-9"
                aria-label="Berikutnya"
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                className={cn(
                  'icon-btn h-9 w-9',
                  repeat !== 'off' && 'bg-accent-soft text-accent',
                )}
                aria-label="Ulangi"
              >
                <RepeatIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden flex-1 items-center gap-2 xl:flex">
              <span className="w-9 text-right text-[10px] tabular-nums text-muted">
                {formatTime(currentTime)}
              </span>
              <Waveform
                progress={progress}
                onSeek={(ratio) => seek(ratio * duration)}
                seed={current.key}
                bars={44}
                className="h-8 flex-1"
              />
              <span className="w-9 text-[10px] tabular-nums text-muted">
                {formatTime(duration)}
              </span>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={toggleMute}
                className="icon-btn hidden h-9 w-9 xl:grid"
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
                className="range hidden w-20 xl:block"
                aria-label="Volume"
              />
              <FavoriteButton track={current} size="sm" />
              <button
                type="button"
                onClick={() => setLyricsOpen(true)}
                className="icon-btn h-9 w-9"
                aria-label="Lirik"
              >
                <Mic2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setQueueOpen(true)}
                className="icon-btn h-9 w-9"
                aria-label="Antrian"
              >
                <ListMusic className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
