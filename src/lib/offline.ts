import type { Track } from './types'
import { sanitizeFilename } from './utils'

const CACHE_NAME = 'singular-audio-v1'

export function audioCacheKey(track: Track) {
  return `https://singular.local/audio/${encodeURIComponent(track.key)}`
}

function canUseCache() {
  return typeof window !== 'undefined' && 'caches' in window
}

export async function getCachedResponse(track: Track) {
  if (!canUseCache()) return null
  const cache = await caches.open(CACHE_NAME)
  return (await cache.match(audioCacheKey(track))) ?? null
}

export async function getCachedAudioUrl(track: Track) {
  const response = await getCachedResponse(track)
  if (!response) return null
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function cacheTrackAudio(
  track: Track,
  onProgress?: (loaded: number, total: number) => void,
) {
  if (!canUseCache()) {
    throw new Error('Browser ini tidak mendukung penyimpanan offline.')
  }

  const response = await fetch(track.streamUrl)
  if (!response.ok) {
    throw new Error(`Gagal mengunduh audio (${response.status}).`)
  }

  const contentType = response.headers.get('Content-Type') ?? 'audio/mpeg'
  const total = Number(response.headers.get('Content-Length') ?? 0)
  let blob: Blob

  if (response.body && onProgress) {
    const reader = response.body.getReader()
    const chunks: BlobPart[] = []
    let loaded = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value as unknown as BlobPart)
        loaded += value.length
        onProgress(loaded, total)
      }
    }
    blob = new Blob(chunks, { type: contentType })
  } else {
    blob = await response.blob()
  }

  const cache = await caches.open(CACHE_NAME)
  await cache.put(
    audioCacheKey(track),
    new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(blob.size),
      },
    }),
  )

  if (navigator.storage?.persist) {
    void navigator.storage.persist()
  }

  return blob.size
}

export async function removeCachedAudio(track: Track) {
  if (!canUseCache()) return
  const cache = await caches.open(CACHE_NAME)
  await cache.delete(audioCacheKey(track))
}

export async function clearAudioCache() {
  if (!canUseCache()) return
  await caches.delete(CACHE_NAME)
}

export async function saveTrackToDevice(track: Track) {
  let blob: Blob | null = null
  const cached = await getCachedResponse(track)
  if (cached) {
    blob = await cached.blob()
  } else {
    const response = await fetch(track.streamUrl)
    if (!response.ok) throw new Error('Gagal mengunduh file.')
    blob = await response.blob()
  }

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  const extension = track.streamUrl.toLowerCase().includes('.ogg') ? 'ogg' : 'mp3'
  anchor.download = `${sanitizeFilename(`${track.artist} - ${track.title}`)}.${extension}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export async function getAudioCacheSize() {
  if (!canUseCache()) return 0
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()
  let total = 0
  for (const request of requests) {
    const response = await cache.match(request)
    if (response) {
      const blob = await response.blob()
      total += blob.size
    }
  }
  return total
}
