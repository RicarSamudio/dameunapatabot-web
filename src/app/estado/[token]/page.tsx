import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPrisma } from '@/lib/prisma'

const statusContent = {
  PENDING: {
    label: 'Pendiente de revisión',
    emoji: '⏳',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Recibimos tu solicitud. El equipo de Dame una Pata la va a revisar y te contactará por WhatsApp si necesita más información.',
  },
  APPROVED: {
    label: 'Aprobada',
    emoji: '✅',
    className: 'bg-green-100 text-green-800 border-green-200',
    description: 'Tu solicitud fue aprobada. El equipo se pondrá en contacto contigo para coordinar los próximos pasos.',
  },
  REJECTED: {
    label: 'Rechazada',
    emoji: '💛',
    className: 'bg-red-100 text-red-800 border-red-200',
    description: 'Tu solicitud ya fue revisada. Si tenés dudas, podés contactar al equipo por WhatsApp.',
  },
} as const

const typeLabels: Record<string, string> = {
  ADOPTION: 'Adopción perro',
  CAT: 'Adopción gato',
  GIVE_UP: 'Dar en adopción',
  FOSTER: 'Hogar temporal',
  VOLUNTEER: 'Voluntariado',
}

export const metadata = {
  title: 'Estado de solicitud - Dame una Pata Paraguay',
}

export default async function EstadoSolicitudPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const prisma = getPrisma()
  const request = await prisma.request.findUnique({
    where: { token },
    select: {
      token: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reviewedAt: true,
      rejectionReason: true,
    },
  })

  if (!request) {
    notFound()
  }

  const status = statusContent[request.status]

  return (
    <div className="min-h-screen bg-[--background] flex items-center justify-center p-4">
      <main className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{status.emoji}</div>
          <p className="text-sm text-[--text-muted] mb-2">Estado de solicitud</p>
          <h1 className="text-2xl font-bold text-[--primary]">{status.label}</h1>
        </div>

        <div className={`border rounded-xl p-4 mb-6 ${status.className}`}>
          <p>{status.description}</p>
        </div>

        <dl className="space-y-4 mb-6">
          <div>
            <dt className="text-sm text-[--text-muted]">Tipo</dt>
            <dd className="font-medium">{typeLabels[request.type] || request.type}</dd>
          </div>
          <div>
            <dt className="text-sm text-[--text-muted]">Código de seguimiento</dt>
            <dd className="font-mono text-sm break-all">{request.token}</dd>
          </div>
          <div>
            <dt className="text-sm text-[--text-muted]">Recibida</dt>
            <dd className="font-medium">
              {request.createdAt.toLocaleDateString('es-PY', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          {request.reviewedAt && (
            <div>
              <dt className="text-sm text-[--text-muted]">Revisada</dt>
              <dd className="font-medium">
                {request.reviewedAt.toLocaleDateString('es-PY', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
          )}
          {request.status === 'REJECTED' && request.rejectionReason && (
            <div>
              <dt className="text-sm text-[--text-muted]">Comentario</dt>
              <dd className="font-medium">{request.rejectionReason}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="text-center bg-[--primary] text-white px-6 py-3 rounded-lg font-medium hover:bg-[--primary-light] transition"
          >
            Volver al inicio
          </Link>
          <a
            href="https://wa.me/595991234567"
            className="text-center text-[--primary] hover:underline"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </main>
    </div>
  )
}
