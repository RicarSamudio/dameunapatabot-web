import Link from 'next/link'
import { FosterForm } from '@/components/forms/FosterForm'

export const metadata = {
  title: 'Hogar Temporal - Dame una Pata Paraguay',
}

export default function HogarTemporalPage() {
  return (
    <div className="min-h-screen bg-[--background] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[--primary] hover:underline">
          ← Volver al inicio
        </Link>

        <div className="text-center mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[--primary] mb-4">🧳 Hogar Temporal</h1>
          <p className="text-[--text-muted]">
            Ofrecé tu hogar por un tiempo para ayudar a un perro o gato rescatado mientras encontramos su familia definitiva.
          </p>
        </div>

        <FosterForm />
      </div>
    </div>
  )
}
