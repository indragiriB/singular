import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { Track } from './types'

export function useFavoriteKeys() {
  return useLiveQuery(async () => {
    const favorites = await db.favorites.toArray()
    return new Set(favorites.map((favorite) => favorite.key))
  }, [], new Set<string>())
}

export function useFavorites() {
  return useLiveQuery(async () => {
    const favorites = await db.favorites.orderBy('addedAt').reverse().toArray()
    const tracks = await db.tracks.bulkGet(favorites.map((favorite) => favorite.key))
    return favorites
      .map((favorite, index) => tracks[index])
      .filter((track): track is Track => Boolean(track))
  }, [], [] as Track[])
}

export function usePlaylists() {
  return useLiveQuery(
    () => db.playlists.orderBy('updatedAt').reverse().toArray(),
    [],
    [],
  )
}

export function usePlaylistsWithMeta() {
  return useLiveQuery(async () => {
    const playlists = await db.playlists.orderBy('updatedAt').reverse().toArray()
    return Promise.all(
      playlists.map(async (playlist) => {
        const items = await db.playlistItems
          .where('playlistId')
          .equals(playlist.id)
          .sortBy('position')
        const first = items[0]
          ? await db.tracks.get(items[0].trackKey)
          : undefined
        return {
          ...playlist,
          count: items.length,
          cover: first?.artwork,
        }
      }),
    )
  }, [], [])
}

export function usePlaylistDetail(id?: string) {
  return useLiveQuery(async () => {
    if (!id) return null
    const playlist = await db.playlists.get(id)
    if (!playlist) return null
    const items = await db.playlistItems
      .where('playlistId')
      .equals(id)
      .sortBy('position')
    const tracks = await db.tracks.bulkGet(items.map((item) => item.trackKey))
    return {
      playlist,
      tracks: tracks.filter((track): track is Track => Boolean(track)),
    }
  }, [id])
}

export function useHistory(limit = 30) {
  return useLiveQuery(async () => {
    const entries = await db.history
      .orderBy('playedAt')
      .reverse()
      .limit(limit)
      .toArray()
    const tracks = await db.tracks.bulkGet(entries.map((entry) => entry.key))
    return entries
      .map((entry, index) => {
        const track = tracks[index]
        return track ? { track, playedAt: entry.playedAt } : null
      })
      .filter(
        (entry): entry is { track: Track; playedAt: number } => Boolean(entry),
      )
  }, [limit], [])
}

export function useDownloads() {
  return useLiveQuery(async () => {
    const entries = await db.downloads.orderBy('downloadedAt').reverse().toArray()
    const tracks = await db.tracks.bulkGet(entries.map((entry) => entry.key))
    return entries
      .map((entry, index) => {
        const track = tracks[index]
        return track ? { track, size: entry.size, downloadedAt: entry.downloadedAt } : null
      })
      .filter(
        (
          entry,
        ): entry is { track: Track; size: number; downloadedAt: number } =>
          Boolean(entry),
      )
  }, [], [])
}

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useStorageEstimate() {
  const [state, setState] = useState<{ usage: number; quota: number } | null>(null)

  const refresh = async () => {
    if (!navigator.storage?.estimate) return
    const estimate = await navigator.storage.estimate()
    setState({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 })
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { ...state, refresh }
}
