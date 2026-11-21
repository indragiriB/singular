import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { addHistory } from '@/lib/library'
import { getCachedAudioUrl } from '@/lib/offline'
import { isTypingTarget } from '@/lib/utils'
import { usePlayer } from './store'

let audioElement: HTMLAudioElement | null = null

function getAudio() {
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.preload = 'metadata'
  }
  return audioElement
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const current = usePlayer((state) => state.queue[state.index])
  const isPlaying = usePlayer((state) => state.isPlaying)
  const volume = usePlayer((state) => state.volume)
  const muted = usePlayer((state) => state.muted)
  const seekNonce = usePlayer((state) => state.seekNonce)

  const objectUrlRef = useRef<string | null>(null)
  const loadIdRef = useRef(0)
  const historyKeyRef = useRef<string | null>(null)
  const pendingSeekRef = useRef<number | null>(null)

  useEffect(() => {
    const audio = getAudio()
    const loadId = ++loadIdRef.current
    historyKeyRef.current = null
    pendingSeekRef.current = null

    if (!current) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      return
    }

    let cancelled = false

    const load = async () => {
      let source = current.streamUrl
      let cachedUrl: string | null = null

      try {
        cachedUrl = await getCachedAudioUrl(current)
        if (cachedUrl) source = cachedUrl
      } catch {
        cachedUrl = null
      }

      if (cancelled || loadId !== loadIdRef.current) {
        if (cachedUrl) URL.revokeObjectURL(cachedUrl)
        return
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      if (cachedUrl) objectUrlRef.current = cachedUrl

      audio.src = source
      audio.load()

      if (usePlayer.getState().isPlaying) {
        void audio.play().catch(() => {
          usePlayer.getState().setIsPlaying(false)
        })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [current?.key])

  useEffect(() => {
    const audio = getAudio()
    if (!current) return
    if (isPlaying) {
      if (audio.src) {
        void audio.play().catch(() => {
          usePlayer.getState().setIsPlaying(false)
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, current?.key])

  useEffect(() => {
    const audio = getAudio()
    const target = usePlayer.getState().seekTo
    if (target === null || !Number.isFinite(target)) return
    if (audio.readyState > 0) {
      audio.currentTime = target
    } else {
      pendingSeekRef.current = target
    }
  }, [seekNonce])

  useEffect(() => {
    const audio = getAudio()
    audio.volume = muted ? 0 : volume
  }, [volume, muted])

  useEffect(() => {
    const audio = getAudio()

    const onTime = () => {
      usePlayer.getState().setTime(audio.currentTime, audio.duration)
      const state = usePlayer.getState()
      const track = state.queue[state.index]
      if (
        track &&
        audio.currentTime > 8 &&
        historyKeyRef.current !== track.key
      ) {
        historyKeyRef.current = track.key
        void addHistory(track)
      }
    }

    const onLoadedMetadata = () => {
      usePlayer.getState().setTime(audio.currentTime, audio.duration)
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current
        pendingSeekRef.current = null
      }
    }

    const onCanPlay = () => {
      if (usePlayer.getState().isPlaying && audio.paused) {
        void audio.play().catch(() => {
          usePlayer.getState().setIsPlaying(false)
        })
      }
    }

    const onEnded = () => {
      const state = usePlayer.getState()
      if (state.repeat === 'one') {
        audio.currentTime = 0
        void audio.play().catch(() => {
          state.setIsPlaying(false)
        })
        return
      }
      state.next(true)
    }

    const onPlay = () => usePlayer.getState().setIsPlaying(true)
    const onPause = () => usePlayer.getState().setIsPlaying(false)

    const onError = () => {
      if (!audio.src) return
      const code = audio.error?.code
      if (code === 1) return
      usePlayer.getState().setIsPlaying(false)
      toast.error('Track ini gagal diputar. Coba track lain.', {
        id: 'audio-error',
      })
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!current) {
      navigator.mediaSession.metadata = null
      return
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: current.album ?? 'Singular',
      artwork: current.artwork
        ? [
            {
              src: current.artwork,
              sizes: '480x480',
              type: 'image/jpeg',
            },
          ]
        : [],
    })
  }, [current])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const session = navigator.mediaSession

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => usePlayer.getState().setIsPlaying(true)],
      ['pause', () => usePlayer.getState().setIsPlaying(false)],
      ['previoustrack', () => usePlayer.getState().prev()],
      ['nexttrack', () => usePlayer.getState().next()],
      [
        'seekbackward',
        (details) => {
          const state = usePlayer.getState()
          state.seek(state.currentTime - (details.seekOffset ?? 10))
        },
      ],
      [
        'seekforward',
        (details) => {
          const state = usePlayer.getState()
          state.seek(state.currentTime + (details.seekOffset ?? 10))
        },
      ],
      [
        'seekto',
        (details) => {
          if (details.seekTime !== undefined) {
            usePlayer.getState().seek(details.seekTime)
          }
        },
      ],
      ['stop', () => usePlayer.getState().setIsPlaying(false)],
    ]

    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler)
      } catch {
        // Browser tidak mendukung action tertentu.
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null)
        } catch {
          // Abaikan.
        }
      }
    }
  }, [])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTypingTarget(event.target)) return
      const state = usePlayer.getState()
      switch (event.key) {
        case ' ':
          event.preventDefault()
          state.toggle()
          break
        case 'ArrowRight':
          event.preventDefault()
          state.seek(state.currentTime + 5)
          break
        case 'ArrowLeft':
          event.preventDefault()
          state.seek(state.currentTime - 5)
          break
        case 'm':
          state.toggleMute()
          break
        case 'n':
          state.next()
          break
        case 'p':
          state.prev()
          break
        case 'q':
          state.setQueueOpen(!state.queueOpen)
          break
        case 'Escape':
          state.openNowPlaying(false)
          state.setQueueOpen(false)
          state.setLyricsOpen(false)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.title = current
      ? `${current.title} · ${current.artist} — Singular`
      : 'Singular — Your music, singular.'
  }, [current])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  return <>{children}</>
}
