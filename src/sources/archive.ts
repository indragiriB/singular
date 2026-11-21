import type { ArchiveItem, Track } from '@/lib/types'
import { uniqueBy } from '@/lib/utils'

const SEARCH_URL = 'https://archive.org/advancedsearch.php'
const METADATA_URL = 'https://archive.org/metadata'
const DOWNLOAD_URL = 'https://archive.org/download'
const COLLECTION_FILTER = '(collection:netlabels OR collection:audio_music) AND format:(MP3)'

function normalizeText(value: unknown, fallback = ''): string {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String).join(', ')
  }
  if (value === null || value === undefined) return fallback
  return String(value)
}

function cleanFilename(value: string) {
  const base = value.split('/').pop() ?? value
  return base
    .replace(/\.[^.]+$/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function encodePath(value: string) {
  return value
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

function mapItem(doc: any): ArchiveItem | null {
  const identifier = normalizeText(doc.identifier)
  if (!identifier) return null
  return {
    identifier,
    title: normalizeText(doc.title, 'Untitled release'),
    creator: normalizeText(doc.creator, 'Internet Archive'),
    year: doc.year ? String(doc.year) : undefined,
    artwork: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
    downloads: Number(doc.downloads) || undefined,
    license: normalizeText(doc.licenseurl, '') || undefined,
  }
}

export async function searchArchiveItems(query: string, rows = 24): Promise<ArchiveItem[]> {
  const trimmed = query.trim()
  const searchQuery = trimmed
    ? `(${trimmed}) AND ${COLLECTION_FILTER}`
    : COLLECTION_FILTER

  const params = new URLSearchParams()
  params.set('q', searchQuery)
  for (const field of [
    'identifier',
    'title',
    'creator',
    'year',
    'downloads',
    'licenseurl',
  ]) {
    params.append('fl[]', field)
  }
  params.set('rows', String(rows))
  params.set('page', '1')
  params.set('output', 'json')
  params.append('sort[]', 'downloads desc')

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Internet Archive tidak merespons (${response.status}).`)
  }
  const data = await response.json()
  const docs = data?.response?.docs ?? []
  return uniqueBy(
    docs.map(mapItem).filter((item: ArchiveItem | null): item is ArchiveItem => Boolean(item)),
    (item) => item.identifier,
  )
}

export interface ArchiveDetail {
  item: ArchiveItem
  tracks: Track[]
}

export async function getArchiveItem(identifier: string): Promise<ArchiveDetail> {
  const response = await fetch(
    `${METADATA_URL}/${encodeURIComponent(identifier)}`,
  )
  if (!response.ok) {
    throw new Error(`Gagal memuat rilis Internet Archive (${response.status}).`)
  }
  const data = await response.json()
  const metadata = data?.metadata ?? {}
  const files: any[] = Array.isArray(data?.files) ? data.files : []

  const creator = normalizeText(metadata.creator, 'Internet Archive')
  const albumTitle = normalizeText(metadata.title, 'Untitled release')
  const year = metadata.year
    ? String(metadata.year)
    : metadata.date
      ? String(metadata.date).slice(0, 4)
      : undefined
  const license = normalizeText(metadata.licenseurl, '') || undefined

  const mp3Files = files.filter((file) => {
    const name = String(file?.name ?? '')
    const size = Number(file?.size ?? 0)
    return name.toLowerCase().endsWith('.mp3') && size > 40_000
  })

  const byTitle = new Map<string, any>()
  for (const file of mp3Files) {
    const key = cleanFilename(String(file.title || file.name)).toLowerCase()
    const current = byTitle.get(key)
    if (!current || Number(file.size ?? 0) > Number(current.size ?? 0)) {
      byTitle.set(key, file)
    }
  }

  const sortedFiles = [...byTitle.values()].sort((a, b) => {
    const aTrack = Number(a.track)
    const bTrack = Number(b.track)
    if (Number.isFinite(aTrack) && Number.isFinite(bTrack) && aTrack !== bTrack) {
      return aTrack - bTrack
    }
    return String(a.name).localeCompare(String(b.name), 'id')
  })

  const item: ArchiveItem = {
    identifier,
    title: albumTitle,
    creator,
    year,
    artwork: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
    license,
  }

  const tracks: Track[] = sortedFiles.map((file) => {
    const filename = String(file.name)
    const streamUrl = `${DOWNLOAD_URL}/${encodeURIComponent(identifier)}/${encodePath(filename)}`
    const duration = Number.parseFloat(String(file.length ?? ''))
    return {
      key: `archive:${identifier}:${filename}`,
      id: `${identifier}::${filename}`,
      source: 'archive',
      title: cleanFilename(String(file.title || filename)) || 'Untitled',
      artist: normalizeText(file.artist, creator),
      album: albumTitle,
      albumId: identifier,
      artwork: item.artwork,
      duration: Number.isFinite(duration) ? duration : undefined,
      streamUrl,
      downloadUrl: streamUrl,
      permalink: `https://archive.org/details/${encodeURIComponent(identifier)}`,
      genre: normalizeText(metadata.genre, '') || undefined,
      year,
      license,
    }
  })

  return {
    item,
    tracks: tracks.filter((track) => !track.duration || track.duration > 8),
  }
}

export function getArchiveItemUrl(identifier: string) {
  return `https://archive.org/details/${encodeURIComponent(identifier)}`
}
