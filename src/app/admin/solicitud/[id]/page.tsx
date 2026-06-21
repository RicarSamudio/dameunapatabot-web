'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Request {
  id: string
  token: string
  type: string
  status: string
  name: string
  phone: string
  email: string | null
  createdAt: string
  data: Record<string, unknown>
  files: string[]
  rejectionReason: string | null
  reviewedAt: string | null
  reviewedBy: string | null
}

const typeLabels: Record<string, string> = {
  ADOPTION: 'Adopción',
  CAT: 'Adopción gato',
  GIVE_UP: 'Dar en Adopción',
  FOSTER: 'Hogar Temporal',
  VOLUNTEER: 'Voluntariado',
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Aprobada', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-800' },
}

export default function SolicitudDetailPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/requests/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRequest(data)
      } else if (res.status === 404) {
        setRequest(null)
      }
    } catch (error) {
      console.error('Error fetching request:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchRequest()
    }
  }, [status, id, fetchRequest])

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })
      if (res.ok) {
        fetchRequest()
      }
    } catch (error) {
      console.error('Error approving:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason }),
      })
      if (res.ok) {
        setShowRejectModal(false)
        fetchRequest()
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <p className="text-[--text-muted]">Cargando...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <p className="text-[--text-muted]">Solicitud no encontrada</p>
      </div>
    )
  }

  const data = request.data as Record<string, unknown>

  return (
    <div className="min-h-screen bg-[--background]">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[--text-muted] hover:text-[--text]"
            >
              Volver
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="font-bold text-lg text-[--primary]">Admin Dame una Pata</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{request.name}</h1>
              <p className="text-[--text-muted]">
                {new Date(request.createdAt).toLocaleDateString('es-PY', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[request.status].color}`}>
              {statusLabels[request.status].label}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[--text-muted]">Tipo</p>
              <p className="font-medium">{typeLabels[request.type] || request.type}</p>
            </div>
            <div>
              <p className="text-sm text-[--text-muted]">Token</p>
              <p className="font-mono text-sm">{request.token}</p>
            </div>
            <div>
              <p className="text-sm text-[--text-muted]">Telefono</p>
              <p className="font-medium">{request.phone}</p>
            </div>
            {request.email && (
              <div>
                <p className="text-sm text-[--text-muted]">Email</p>
                <p className="font-medium">{request.email}</p>
              </div>
            )}
          </div>

          {request.status === 'REJECTED' && request.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">Motivo de rechazo:</p>
              <p className="text-red-700">{request.rejectionReason}</p>
            </div>
          )}

          {request.status !== 'PENDING' && request.reviewedAt && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-[--text-muted]">
                Revisado el {new Date(request.reviewedAt).toLocaleDateString('es-PY')} por {request.reviewedBy}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Datos de la solicitud</h2>
          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => {
              if (key === 'photos' || value === null || value === undefined || value === '') return null
              return (
                <div key={key}>
                  <p className="text-sm text-[--text-muted] capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-medium">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
              )
            })}
          </div>

          {request.files && request.files.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-[--text-muted] mb-2">Archivos/Fotos:</p>
              <div className="flex flex-wrap gap-2">
                {request.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-[--background] rounded-lg text-sm text-[--primary] hover:underline"
                  >
                    Ver foto {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {request.status === 'PENDING' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Acciones</h2>
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : 'Aprobar'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                Rechazar
              </button>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Motivo del rechazo</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por que se rechaza esta solicitud..."
                className="w-full p-3 border rounded-lg mb-4"
                rows={4}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
