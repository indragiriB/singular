# singular.

**Your music, singular.** — pemutar musik PWA tanpa iklan, tanpa akun, dan tanpa backend.

Singular adalah aplikasi musik personal yang berjalan sepenuhnya di browser. Streaming full track dari **Audius**, album netlabel dan rekaman public domain dari **Internet Archive**, lalu simpan track favorit untuk diputar offline. Semua library (playlist, favorit, riwayat, unduhan) tersimpan di perangkat lewat IndexedDB dan Cache Storage.

> **Live demo:** https://indragirib.github.io/singular/

---

## Fitur

- **Streaming tanpa iklan** — full track dari Audius dan Internet Archive.
- **Pencarian** — cari track Audius dan album Internet Archive dalam satu halaman.
- **Now Playing** — artwork besar, waveform interaktif, volume, shuffle, repeat, dan Media Session (kontrol dari lock screen / headphone).
- **Playlist pribadi** — buat, ubah nama, hapus, dan atur urutan track.
- **Favorit & riwayat** — tersimpan otomatis di perangkat.
- **Offline** — simpan audio ke Cache Storage, lalu putar tanpa internet.
- **Unduh file** — simpan MP3 dari Internet Archive langsung ke folder Downloads.
- **Lirik** — lirik sinkron dari [LRCLIB](https://lrclib.net) bila tersedia.
- **PWA** — bisa dipasang ke home screen, punya ikon, manifest, dan service worker.
- **Mobile-first** — bottom navigation, bottom sheet, dan layout desktop dengan sidebar.
- **Tanpa login** — tidak ada Supabase, tidak ada server, tidak ada tracking.

## Sumber musik & lisensi

| Sumber | Streaming | Unduh | Keterangan |
| --- | --- | --- | --- |
| [Audius](https://audius.co) | ✅ | Cache offline | API publik, track di-host oleh Audius. |
| [Internet Archive](https://archive.org) | ✅ | ✅ MP3 asli | Koleksi `netlabels` & `audio_music`. |
| YouTube | ❌ | ❌ | Butuh backend `yt-dlp` + `ffmpeg`. Lihat roadmap. |

Singular **tidak meng-host file audio**. Semua audio dialirkan langsung dari penyedia aslinya sesuai lisensi masing-masing. Repo ini tidak berisi file musik berhak cipta.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (design token di `src/index.css`)
- **Zustand** — state pemutar
- **TanStack Query** — cache data API
- **Dexie** (IndexedDB) — library lokal
- **vite-plugin-pwa** — manifest + service worker
- **lucide-react** — ikon
- **sonner** — toast
- **HashRouter** — routing aman untuk GitHub Pages tanpa konfigurasi rewrite

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Tidak perlu environment variable atau API key.

```bash
npm run typecheck   # TypeScript
npm run build       # production build ke dist/
npm run preview     # cek hasil build
```

## Deploy ke GitHub Pages

Repo sudah menyertakan workflow `.github/workflows/deploy.yml`.

1. Push ke branch `main`.
2. Buka **Settings → Pages** di repo GitHub.
3. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
4. Tunggu workflow selesai; situs tersedia di `https://<username>.github.io/singular/`.

Base path produksi diatur ke `/singular/` di `vite.config.ts`. Jika repo diganti nama, ubah nilai `base` tersebut.

## Struktur proyek

```
src/
  components/
    layout/     Sidebar, MobileNav, AppShell
    player/     PlayerBar, NowPlaying, Waveform, QueueSheet, LyricsSheet
    track/      TrackRow, TrackCard, AlbumCard, PlaylistCard, tombol favorit/unduh
    ui/         Artwork, Sheet, Modal, Skeleton, EmptyState
  features/
    player/     Zustand store + audio engine (PlayerProvider)
    downloads/  manajer cache offline
    library/    favorit + playlist context
    track-menu/ bottom sheet aksi track
    onboarding/ layar perkenalan
  lib/          db (Dexie), library, offline cache, lirik, hooks, utils
  sources/      adapter Audius, Internet Archive, stub YouTube
  pages/        Home, Search, Library, Playlist, Album, Downloads, Favorites,
                History, Settings, NotFound
```

## Cara kerja offline

Audio diambil dengan `fetch()`, lalu disimpan di Cache Storage dengan key sintetis
`https://singular.local/audio/{trackKey}`. Saat track diputar, `PlayerProvider`
memeriksa cache terlebih dahulu; jika ada, audio diputar dari `blob:` URL.
Dexie hanya menyimpan metadata unduhan, sehingga library tetap ringan.

Browser dapat membersihkan Cache Storage saat penyimpanan menipis. Buka
**Settings → Penyimpanan offline → Minta penyimpanan permanen** untuk meminta
`navigator.storage.persist()`.

## Roadmap

- [ ] **Backend YouTube opsional** — server kecil dengan `yt-dlp` + `ffmpeg` untuk pencarian, streaming, dan unduhan. Adapter sudah disiapkan di `src/sources/youtube.ts`; status di Settings saat ini sengaja "Butuh backend" karena situs statis tidak bisa memproses YouTube.
- [ ] Import library dari file JSON hasil ekspor.
- [ ] Crossfade dan equalizer.
- [ ] Dukungan lirik yang bisa diedit manual.
- [ ] PWA share target.

## Batasan

- Internet Archive item besar bisa lambat karena file MP3 dialirkan langsung.
- Audius membatasi unduhan langsung; offline memakai cache stream, bukan file asli.
- Tidak ada sinkronisasi antar-perangkat karena tidak ada akun/server.
- Lirik bergantung pada ketersediaan LRCLIB.

## Lisensi

Kode Singular dilisensikan di bawah [MIT License](LICENSE). Musik dan artwork
tetap milik masing-masing artis/penyedia dan tunduk pada lisensi sumbernya.
