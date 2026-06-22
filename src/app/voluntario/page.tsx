import Link from 'next/link'
import { VolunteerForm } from '@/components/forms/VolunteerForm'

export const metadata = {
  title: 'Voluntariado - Dame una Pata Paraguay',
}

export default function VoluntarioPage() {
  return (
    <div className="min-h-screen bg-[--background] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[--primary] hover:underline">
          ← Volver al inicio
        </Link>

        <div className="text-center mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[--primary] mb-4">🤝 Voluntariado</h1>
          <p className="text-[--text-muted]">
            Sumate al equipo para ayudar con rescates, traslados, eventos, difusión y gestión de solicitudes.
          </p>
        </div>

        <VolunteerForm />
      </div>
    </div>
  )
}
