import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '@/lib/types'
import { clamp } from '@/lib/utils'

export type RepeatMode = 'off' | 'all' | 'one'

interface PlayerState {
  queue: Track[]
  index: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  repeat: RepeatMode
  shuffle: boolean
  nowPlayingOpen: boolean
  queueOpen: boolean
  lyricsOpen: boolean
  seekTo: number | null
  seekNonce: number

  playTrack: (track: Track, queue?: Track[]) => void
  playQueue: (tracks: Track[], startIndex?: number) => void
  toggle: () => void
  setIsPlaying: (value: boolean) => void
  next: (auto?: boolean) => void
  prev: () => void
  seek: (time: number) => void
  setTime: (time: number, duration: number) => void
  setVolume: (value: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  openNowPlaying: (open: boolean) => void
  setQueueOpen: (open: boolean) => void
  setLyricsOpen: (open: boolean) => void
  removeFromQueue: (index: number) => void
  addToQueue: (track: Track, next?: boolean) => void
  clearQueue: () => void
  current: () => Track | undefined
}

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      index: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      muted: false,
      repeat: 'off',
      shuffle: false,
      nowPlayingOpen: false,
      queueOpen: false,
      lyricsOpen: false,
      seekTo: null,
      seekNonce: 0,

      playTrack: (track, queue) => {
        if (queue?.length) {
          const found = queue.findIndex((item) => item.key === track.key)
          set({
            queue,
            index: found >= 0 ? found : 0,
            isPlaying: true,
            currentTime: 0,
            duration: track.duration ?? 0,
          })
          return
        }
        const existing = get().queue.findIndex((item) => item.key === track.key)
        if (existing >= 0) {
          set({
            index: existing,
            isPlaying: true,
            currentTime: 0,
            duration: track.duration ?? 0,
          })
          return
        }
        set({
          queue: [track],
          index: 0,
          isPlaying: true,
          currentTime: 0,
          duration: track.duration ?? 0,
        })
      },

      playQueue: (tracks, startIndex = 0) => {
        if (!tracks.length) return
        const index = clamp(startIndex, 0, tracks.length - 1)
        set({
          queue: tracks,
          index,
          isPlaying: true,
          currentTime: 0,
          duration: tracks[index]?.duration ?? 0,
        })
      },

      toggle: () => {
        if (!get().current()) return
        set({ isPlaying: !get().isPlaying })
      },

      setIsPlaying: (value) => set({ isPlaying: value }),

      next: (auto = false) => {
        const { queue, index, repeat, shuffle } = get()
        if (!queue.length) return
        if (auto && repeat === 'one') {
          set({ currentTime: 0, seekTo: 0, seekNonce: Date.now() })
          return
        }
        let nextIndex: number
        if (shuffle && queue.length > 1) {
          do {
            nextIndex = Math.floor(Math.random() * queue.length)
          } while (nextIndex === index)
        } else {
          nextIndex = index + 1
          if (nextIndex >= queue.length) {
            if (auto && repeat === 'off') {
              set({ isPlaying: false, currentTime: 0 })
              return
            }
            nextIndex = 0
          }
        }
        set({
          index: nextIndex,
          currentTime: 0,
          duration: queue[nextIndex]?.duration ?? 0,
          isPlaying: true,
        })
      },

      prev: () => {
        const { currentTime, queue, index } = get()
        if (!queue.length) return
        if (currentTime > 3) {
          set({ currentTime: 0, seekTo: 0, seekNonce: Date.now() })
          return
        }
        const nextIndex = index <= 0 ? queue.length - 1 : index - 1
        set({
          index: nextIndex,
          currentTime: 0,
          duration: queue[nextIndex]?.duration ?? 0,
          isPlaying: true,
        })
      },

      seek: (time) => {
        const duration = get().duration
        const target = clamp(time, 0, duration || time)
        set({
          currentTime: target,
          seekTo: target,
          seekNonce: Date.now(),
        })
      },

      setTime: (time, duration) =>
        set((state) => ({
          currentTime: time,
          duration:
            Number.isFinite(duration) && duration > 0 ? duration : state.duration,
        })),

      setVolume: (value) =>
        set({
          volume: clamp(value, 0, 1),
          muted: value <= 0 ? true : false,
        }),

      toggleMute: () => set({ muted: !get().muted }),

      toggleShuffle: () => set({ shuffle: !get().shuffle }),

      cycleRepeat: () =>
        set({
          repeat:
            get().repeat === 'off'
              ? 'all'
              : get().repeat === 'all'
                ? 'one'
                : 'off',
        }),

      openNowPlaying: (open) => set({ nowPlayingOpen: open }),
      setQueueOpen: (open) => set({ queueOpen: open }),
      setLyricsOpen: (open) => set({ lyricsOpen: open }),

      removeFromQueue: (index) => {
        const { queue, index: currentIndex, isPlaying } = get()
        if (index < 0 || index >= queue.length) return
        const nextQueue = queue.filter((_, itemIndex) => itemIndex !== index)
        if (!nextQueue.length) {
          set({ queue: [], index: 0, isPlaying: false, currentTime: 0, duration: 0 })
          return
        }
        let nextIndex = currentIndex
        if (index < currentIndex) nextIndex -= 1
        if (index === currentIndex) {
          nextIndex = Math.min(currentIndex, nextQueue.length - 1)
        }
        set({
          queue: nextQueue,
          index: nextIndex,
          currentTime: index === currentIndex ? 0 : get().currentTime,
          duration:
            index === currentIndex
              ? nextQueue[nextIndex]?.duration ?? 0
              : get().duration,
          isPlaying: index === currentIndex ? isPlaying : get().isPlaying,
        })
      },

      addToQueue: (track, next = false) => {
        const { queue, index } = get()
        if (!queue.length) {
          set({ queue: [track], index: 0, duration: track.duration ?? 0 })
          return
        }
        const insertAt = next ? index + 1 : queue.length
        set({
          queue: [
            ...queue.slice(0, insertAt),
            track,
            ...queue.slice(insertAt),
          ],
        })
      },

      clearQueue: () => {
        const current = get().current()
        if (current) {
          set({
            queue: [current],
            index: 0,
            currentTime: 0,
            duration: current.duration ?? 0,
          })
        } else {
          set({ queue: [], index: 0, isPlaying: false })
        }
      },

      current: () => {
        const { queue, index } = get()
        return queue[index]
      },
    }),
    {
      name: 'singular-player',
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        repeat: state.repeat,
        shuffle: state.shuffle,
      }),
    },
  ),
)
