import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <EmptyState
        icon={Compass}
        title="Halaman tidak ditemukan"
        description="Tautan ini mungkin salah atau sudah dipindahkan. Kembali ke beranda untuk melanjutkan mendengarkan."
        action={
          <Link to="/" className="btn-accent">
            Kembali ke Home
          </Link>
        }
      />
    </div>
  )
}
