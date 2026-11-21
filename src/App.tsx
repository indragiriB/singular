import { HashRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { DownloadsProvider } from '@/features/downloads/DownloadsProvider'
import { LibraryProvider } from '@/features/library/LibraryProvider'
import { PlayerProvider } from '@/features/player/PlayerProvider'
import { TrackMenuProvider } from '@/features/track-menu/TrackMenuProvider'
import { AlbumPage } from '@/pages/AlbumPage'
import { DownloadsPage } from '@/pages/DownloadsPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HomePage } from '@/pages/HomePage'
import { LibraryPage } from '@/pages/LibraryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaylistPage } from '@/pages/PlaylistPage'
import { SearchPage } from '@/pages/SearchPage'
import { SettingsPage } from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LibraryProvider>
        <DownloadsProvider>
          <TrackMenuProvider>
            <PlayerProvider>
              <HashRouter>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="library" element={<LibraryPage />} />
                    <Route path="playlists/:id" element={<PlaylistPage />} />
                    <Route path="album/:identifier" element={<AlbumPage />} />
                    <Route path="downloads" element={<DownloadsPage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </HashRouter>
              <Toaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    borderRadius: '18px',
                    fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif',
                    fontSize: '13px',
                  },
                }}
              />
            </PlayerProvider>
          </TrackMenuProvider>
        </DownloadsProvider>
      </LibraryProvider>
    </QueryClientProvider>
  )
}
