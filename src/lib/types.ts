export type SourceId = 'audius' | 'archive' | 'youtube'

export interface Track {
  key: string
  id: string
  source: SourceId
  title: string
  artist: string
  artistAvatar?: string
  album?: string
  artwork?: string
  duration?: number
  streamUrl: string
  downloadUrl?: string
  permalink?: string
  genre?: string
  year?: string
  license?: string
  albumId?: string
}

export interface ArchiveItem {
  identifier: string
  title: string
  creator: string
  year?: string
  artwork: string
  downloads?: number
  license?: string
}

export interface Playlist {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface Favorite {
  key: string
  addedAt: number
}

export interface HistoryEntry {
  id?: number
  key: string
  playedAt: number
}

export interface DownloadEntry {
  key: string
  size: number
  downloadedAt: number
}

export interface PlaylistItem {
  id: string
  playlistId: string
  trackKey: string
  position: number
}

export interface LyricsResult {
  plain?: string | null
  synced?: string | null
  title?: string
  artist?: string
}
