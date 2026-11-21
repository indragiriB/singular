import { createContext, useContext, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useFavoriteKeys, usePlaylists } from '@/lib/hooks'
import {
  addTrackToPlaylist as addTrackToPlaylistDb,
  createPlaylist as createPlaylistDb,
  toggleFavorite as toggleFavoriteDb,
} from '@/lib/library'
import type { Playlist, Track } from '@/lib/types'

interface LibraryContextValue {
  favoriteKeys: Set<string>
  playlists: Playlist[]
  isFavorite: (key: string) => boolean
  toggleFavorite: (track: Track) => Promise<void>
  createPlaylist: (name: string) => Promise<Playlist>
  addToPlaylist: (playlistId: string, track: Track) => Promise<boolean>
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const favoriteKeys = useFavoriteKeys()
  const playlists = usePlaylists()

  const toggleFavorite = async (track: Track) => {
    const added = await toggleFavoriteDb(track)
    toast.success(added ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit')
  }

  const createPlaylist = async (name: string) => {
    const playlist = await createPlaylistDb(name)
    toast.success('Playlist dibuat')
    return playlist
  }

  const addToPlaylist = async (playlistId: string, track: Track) => {
    const added = await addTrackToPlaylistDb(playlistId, track)
    if (added) toast.success('Ditambahkan ke playlist')
    else toast.info('Track ini sudah ada di playlist')
    return added
  }

  return (
    <LibraryContext.Provider
      value={{
        favoriteKeys,
        playlists,
        isFavorite: (key) => favoriteKeys.has(key),
        toggleFavorite,
        createPlaylist,
        addToPlaylist,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary harus dipakai di dalam LibraryProvider.')
  }
  return context
}
