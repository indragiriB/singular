import type { LyricsResult, Track } from './types'

const API = 'https://lrclib.net/api'

async function getJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(9000),
  })
  if (!response.ok) return null
  return response.json()
}

export async function fetchLyrics(track: Track): Promise<LyricsResult | null> {
  const params = new URLSearchParams({
    artist_name: track.artist,
    track_name: track.title,
  })
  if (track.duration && Number.isFinite(track.duration)) {
    params.set('duration', String(Math.round(track.duration)))
  }

  const exact = await getJson(`${API}/get?${params.toString()}`)
  if (exact?.plainLyrics || exact?.syncedLyrics) {
    return {
      plain: exact.plainLyrics,
      synced: exact.syncedLyrics,
      title: exact.trackName,
      artist: exact.artistName,
    }
  }

  const search = await getJson(
    `${API}/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
  )
  const first = Array.isArray(search) ? search[0] : null
  if (first?.plainLyrics || first?.syncedLyrics) {
    return {
      plain: first.plainLyrics,
      synced: first.syncedLyrics,
      title: first.trackName,
      artist: first.artistName,
    }
  }

  return null
}

export interface LyricLine {
  time: number
  text: string
}

export function parseSyncedLyrics(synced?: string | null): LyricLine[] {
  if (!synced) return []
  const lines: LyricLine[] = []
  for (const rawLine of synced.split('\n')) {
    const timestamps = [...rawLine.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g)]
    if (!timestamps.length) continue
    const text = rawLine.replace(/\[[^\]]+\]/g, '').trim()
    if (!text) continue
    for (const match of timestamps) {
      const minutes = Number(match[1])
      const seconds = Number(match[2])
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0
      lines.push({ time: minutes * 60 + seconds + fraction, text })
    }
  }
  return lines.sort((a, b) => a.time - b.time)
}

export function findActiveLyricLine(lines: LyricLine[], time: number) {
  let active = -1
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].time <= time + 0.25) active = i
    else break
  }
  return active
}
