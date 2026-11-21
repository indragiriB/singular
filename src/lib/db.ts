import Dexie, { type Table } from 'dexie'
import type {
  DownloadEntry,
  Favorite,
  HistoryEntry,
  Playlist,
  PlaylistItem,
  Track,
} from './types'

export interface SettingRow {
  key: string
  value: string
}

export class SingularDatabase extends Dexie {
  tracks!: Table<Track, string>
  favorites!: Table<Favorite, string>
  playlists!: Table<Playlist, string>
  playlistItems!: Table<PlaylistItem, string>
  history!: Table<HistoryEntry, number>
  downloads!: Table<DownloadEntry, string>
  settings!: Table<SettingRow, string>

  constructor() {
    super('singular-db')
    this.version(1).stores({
      tracks: 'key, source, title, artist',
      favorites: 'key, addedAt',
      playlists: 'id, updatedAt, createdAt',
      playlistItems: 'id, playlistId, trackKey, position',
      history: '++id, key, playedAt',
      downloads: 'key, downloadedAt',
      settings: 'key',
    })
  }
}

export const db = new SingularDatabase()
