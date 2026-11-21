import type { Track } from '@/lib/types'
import { uniqueBy } from '@/lib/utils'

const API = 'https://api.audius.co/v1'
const APP_NAME = 'Singular'

function endpoint(path: string) {
  const separator = path.includes('?') ? '&' : '?'
  return `${API}${path}${separator}app_name=${APP_NAME}`
}

async function getJson(path: string) {
  const response = await fetch(endpoint(path), {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Audius tidak merespons (${response.status}).`)
  }
  return response.json()
}

function mapTrack(raw: any): Track | null {
  if (!raw) return null
  if (raw.is_delete || raw.is_streamable === false) return null
  if (raw.access && raw.access.stream === false) return null
  if (raw.user?.is_deactivated) return null

  const id = String(raw.id ?? raw.track_id ?? '')
  if (!id) return null

  const artwork =
    raw.artwork?.['480x480'] ??
    raw.artwork?.['150x150'] ??
    raw.artwork?.['1000x1000'] ??
    raw.user?.profile_picture?.['480x480'] ??
    undefined

  return {
    key: `audius:${id}`,
    id,
    source: 'audius',
    title: String(raw.title ?? 'Untitled').trim(),
    artist: raw.user?.name ?? raw.user?.handle ?? 'Unknown Artist',
    artistAvatar: raw.user?.profile_picture?.['150x150'] ?? undefined,
    album: raw.album_backlink?.playlist_name ?? undefined,
    artwork,
    duration: Number(raw.duration) || undefined,
    streamUrl: `${API}/tracks/${id}/stream?app_name=${APP_NAME}`,
    permalink: raw.permalink ? `https://audius.co${raw.permalink}` : undefined,
    genre: raw.genre || undefined,
    year: raw.release_date ? String(raw.release_date).slice(0, 4) : undefined,
  }
}

function mapTracks(data: any[]): Track[] {
  return uniqueBy(
    (data ?? [])
      .map(mapTrack)
      .filter((track): track is Track => Boolean(track)),
    (track) => track.key,
  )
}

export async function getTrendingTracks(limit = 24): Promise<Track[]> {
  const data = await getJson(`/tracks/trending?time=week&limit=${limit}`)
  return mapTracks(data.data ?? [])
}

export async function searchAudiusTracks(query: string, limit = 24): Promise<Track[]> {
  if (!query.trim()) return []
  const data = await getJson(
    `/tracks/search?query=${encodeURIComponent(query.trim())}&limit=${limit}`,
  )
  return mapTracks(data.data ?? [])
}

export async function getAudiusTrack(id: string): Promise<Track | null> {
  const data = await getJson(`/tracks/${id}`)
  return mapTrack(data.data)
}
