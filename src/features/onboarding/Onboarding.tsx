import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Sparkles } from 'lucide-react'
import { Artwork } from '@/components/ui/Artwork'
import { getTrendingTracks } from '@/sources/audius'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'singular:onboarded'

const steps = [
  {
    title: 'Musik tanpa iklan',
    description:
      'Streaming full track dari Audius dan Internet Archive. Tanpa iklan, tanpa langganan, langsung dari browser.',
    icon: Sparkles,
  },
  {
    title: 'Simpan offline',
    description:
      'Unduh track favoritmu dan putar kapan saja, bahkan saat koneksi sedang tidak ada.',
    icon: Download,
  },
]

export function Onboarding() {
  const [open, setOpen] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY)
    } catch {
      return true
    }
  })
  const [step, setStep] = useState(0)

  const { data: trending } = useQuery({
    queryKey: ['audius', 'trending'],
    queryFn: () => getTrendingTracks(6),
    staleTime: 5 * 60 * 1000,
    enabled: open,
    retry: 1,
  })

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Mode privat: onboarding akan muncul lagi.
    }
    setOpen(false)
  }

  if (!open) return null

  const current = steps[step]
  const Icon = current.icon
  const covers = (trending ?? [])
    .map((track) => track.artwork)
    .filter((artwork): artwork is string => Boolean(artwork))
    .slice(0, 3)

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/30 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm animate-rise rounded-[36px] bg-surface p-4 shadow-soft">
        <div className="relative h-56 overflow-hidden rounded-[28px] bg-gradient-to-br from-accent via-orange-400 to-amber-300">
          {covers.length ? (
            <div
              className={cn(
                'absolute inset-0 gap-1 p-1 opacity-90',
                covers.length >= 3 ? 'grid grid-cols-3' : 'flex',
              )}
            >
              {covers.map((src, index) => (
                <Artwork
                  key={`${src}-${index}`}
                  src={src}
                  alt=""
                  className="h-full w-full flex-1 rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Icon className="h-16 w-16 text-white/90" strokeWidth={1.4} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-accent backdrop-blur">
            <Icon className="h-5 w-5" />
          </span>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Welcome to Singular
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
              {current.title}
            </h2>
          </div>
        </div>

        <p className="mt-5 px-2 text-center text-sm leading-relaxed text-muted">
          {current.description}
        </p>

        <div className="mt-6 flex items-center justify-between px-2 pb-1">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-semibold text-muted transition hover:text-ink"
          >
            Lewati
          </button>
          <div className="flex items-center gap-1.5">
            {steps.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === step ? 'w-5 bg-accent' : 'w-1.5 bg-line',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1)
              else finish()
            }}
            className="btn-accent px-5 py-2.5"
          >
            {step < steps.length - 1 ? 'Lanjut' : 'Mulai'}
          </button>
        </div>
      </div>
    </div>
  )
}
