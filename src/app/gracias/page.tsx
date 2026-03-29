import Link from 'next/link'

export default async function GraciasPage({ searchParams }: { searchParams: Promise<{ token?: string; type?: string }> }) {
  const params = await searchParams
  
  return (
    <div className="min-h-screen bg-[--background] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-2xl font-bold text-[--primary] mb-4">¡Gracias por tu solicitud!</h1>
        <p className="text-[--text-muted] mb-6">
          Hemos recibido tu información. Te contactaremos pronto para continuar con el proceso de adopción.
        </p>
        <div className="bg-[--background] rounded-lg p-4 mb-6">
          <p className="text-sm text-[--text-muted]">
            Guardá este código para hacer seguimiento:
          </p>
          <p className="font-mono font-bold text-lg mt-2">{params.token ?? 'N/A'}</p>
        </div>
        <Link 
          href="/"
          className="inline-block bg-[--primary] text-white px-6 py-3 rounded-lg font-medium hover:bg-[--primary-light] transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
