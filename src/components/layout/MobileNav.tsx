import { NavLink } from 'react-router-dom'
import { Heart, Home, Library, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/favorites', label: 'Favorit', icon: Heart },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/settings', label: 'Setting', icon: Settings },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.04] bg-white/92 pb-safe backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid h-[72px] max-w-lg grid-cols-4 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition',
                isActive ? 'text-accent' : 'text-muted hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-full transition',
                    isActive && 'bg-accent-soft',
                  )}
                >
                  <item.icon
                    className={cn('h-[19px] w-[19px]', isActive && 'fill-current')}
                    strokeWidth={isActive ? 2.2 : 1.9}
                  />
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
