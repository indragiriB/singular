import { useEffect, useState } from 'react'
import { Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtworkProps {
  src?: string
  alt: string
  className?: string
  iconClassName?: string
}

export function Artwork({ src, alt, className, iconClassName }: ArtworkProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div
        className={cn(
          'grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffd9d9,transparent_65%),linear-gradient(135deg,#ffecec,#fff8f4)] text-accent/80 ring-1 ring-inset ring-black/[0.04]',
          className,
        )}
      >
        <Music2 className={cn('h-1/3 w-1/3', iconClassName)} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
