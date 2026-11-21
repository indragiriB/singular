import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { PlayerBar } from '@/components/player/PlayerBar'
import { NowPlaying } from '@/components/player/NowPlaying'
import { QueueSheet } from '@/components/player/QueueSheet'
import { LyricsSheet } from '@/components/player/LyricsSheet'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { usePlayer } from '@/features/player/store'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const player = usePlayer.getState()
    player.openNowPlaying(false)
    player.setQueueOpen(false)
    player.setLyricsOpen(false)
  }, [pathname])
  return null
}

export function AppShell() {
  return (
    <div className="min-h-dvh">
      <ScrollToTop />
      <Sidebar />
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-44 pt-5 sm:px-7 sm:pt-7 lg:pl-[276px] lg:pr-7 lg:pb-32">
        <Outlet />
      </main>
      <PlayerBar />
      <MobileNav />
      <NowPlaying />
      <QueueSheet />
      <LyricsSheet />
      <Onboarding />
    </div>
  )
}
