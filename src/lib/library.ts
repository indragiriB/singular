import { db } from './db'
import { removeCachedAudio } from './offline'
import type { Playlist, Track } from './types'
import { newId } from './utils'

export async function rememberTrack(track: Track) {
  await db.tracks.put(track)
}

export async function toggleFavorite(track: Track): Promise<boolean> {
  const existing = await db.favorites.get(track.key)
  if (existing) {
    await db.favorites.delete(track.key)
    return false
  }
  await rememberTrack(track)
  await db.favorites.put({ key: track.key, addedAt: Date.now() })
  return true
}

export async function addHistory(track: Track) {
  await rememberTrack(track)
  await db.history.add({ key: track.key, playedAt: Date.now() })
  const count = await db.history.count()
  if (count > 150) {
    const excess = count - 120
    const oldKeys = await db.history.orderBy('playedAt').limit(excess).primaryKeys()
    await db.history.bulkDelete(oldKeys)
  }
}

export async function clearHistory() {
  await db.history.clear()
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const now = Date.now()
  const playlist: Playlist = {
    id: newId(),
    name: name.trim() || 'Playlist baru',
    createdAt: now,
    updatedAt: now,
  }
  await db.playlists.add(playlist)
  return playlist
}

export async function renamePlaylist(id: string, name: string) {
  await db.playlists.update(id, {
    name: name.trim() || 'Playlist baru',
    updatedAt: Date.now(),
  })
}

export async function deletePlaylist(id: string) {
  await db.transaction('rw', db.playlists, db.playlistItems, async () => {
    await db.playlistItems.where('playlistId').equals(id).delete()
    await db.playlists.delete(id)
  })
}

export async function addTrackToPlaylist(playlistId: string, track: Track) {
  await rememberTrack(track)
  const items = await db.playlistItems.where('playlistId').equals(playlistId).toArray()
  if (items.some((item) => item.trackKey === track.key)) return false
  const position = items.length ? Math.max(...items.map((item) => item.position)) + 1 : 0
  await db.playlistItems.add({
    id: `${playlistId}:${track.key}`,
    playlistId,
    trackKey: track.key,
    position,
  })
  await db.playlists.update(playlistId, { updatedAt: Date.now() })
  return true
}

export async function removeTrackFromPlaylist(playlistId: string, trackKey: string) {
  await db.playlistItems.delete(`${playlistId}:${trackKey}`)
  const remaining = await db.playlistItems
    .where('playlistId')
    .equals(playlistId)
    .sortBy('position')
  await db.transaction('rw', db.playlistItems, async () => {
    for (let i = 0; i < remaining.length; i += 1) {
      if (remaining[i].position !== i) {
        await db.playlistItems.update(remaining[i].id, { position: i })
      }
    }
  })
  await db.playlists.update(playlistId, { updatedAt: Date.now() })
}

export async function movePlaylistTrack(
  playlistId: string,
  trackKey: string,
  direction: -1 | 1,
) {
  const items = await db.playlistItems
    .where('playlistId')
    .equals(playlistId)
    .sortBy('position')
  const index = items.findIndex((item) => item.trackKey === trackKey)
  const target = index + direction
  if (index < 0 || target < 0 || target >= items.length) return
  await db.transaction('rw', db.playlistItems, async () => {
    await db.playlistItems.update(items[index].id, { position: target })
    await db.playlistItems.update(items[target].id, { position: index })
  })
  await db.playlists.update(playlistId, { updatedAt: Date.now() })
}

export async function saveDownload(track: Track, size: number) {
  await rememberTrack(track)
  await db.downloads.put({
    key: track.key,
    size,
    downloadedAt: Date.now(),
  })
}

export async function deleteDownload(track: Track) {
  await db.downloads.delete(track.key)
  await removeCachedAudio(track)
}

export async function clearAllUserData() {
  await db.transaction(
    'rw',
    [db.tracks, db.favorites, db.playlists, db.playlistItems, db.history, db.downloads],
    async () => {
      await Promise.all([
        db.tracks.clear(),
        db.favorites.clear(),
        db.playlists.clear(),
        db.playlistItems.clear(),
        db.history.clear(),
        db.downloads.clear(),
      ])
    },
  )
}
