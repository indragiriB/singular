import type { Track } from '@/lib/types'

/**
 * YouTube sengaja belum aktif di versi statis ini.
 * Streaming/download YouTube membutuhkan backend yt-dlp + ffmpeg
 * yang berjalan di server. Saat backend tersedia, adapter ini
 * tinggal diisi dan URL-nya diatur dari halaman Settings.
 */
export const YOUTUBE_BACKEND_KEY = 'singular:youtube-backend'

export function getYoutubeBackendUrl() {
  try {
    return localStorage.getItem(YOUTUBE_BACKEND_KEY) ?? ''
  } catch {
    return ''
  }
}

export function isYoutubeConfigured() {
  return Boolean(getYoutubeBackendUrl())
}

export async function searchYoutubeTracks(_query: string): Promise<Track[]> {
  throw new Error(
    'YouTube belum aktif. Fitur ini membutuhkan backend yt-dlp yang berjalan di server.',
  )
}
