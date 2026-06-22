'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

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
}

const typeLabels: Record<string, string> = {
  ADOPTION: 'Adopción',
  CAT: 'Adopción gato',
  GIVE_UP: 'Dar en Adopción',
  FOSTER: 'Hogar Temporal',
  VOLUNTEER: 'Voluntariado',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterType !== 'all') params.set('type', filterType)

      const res = await fetch(`/api/admin/requests?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRequests()
    }
  }, [status, fetchRequests])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <p className="text-[--text-muted]">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[--background]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-lg text-[--primary]">Admin Dame una Pata</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[--text-muted]">{session?.user?.email}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-sm text-[--primary] hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Solicitudes</h1>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="REJECTED">Rechazadas</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">Todos los tipos</option>
              <option value="ADOPTION">Adopción perro</option>
              <option value="CAT">Adopción gato</option>
              <option value="GIVE_UP">Dar en Adopción</option>
              <option value="FOSTER">Hogar Temporal</option>
              <option value="VOLUNTEER">Voluntariado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[--text-muted]">Cargando...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-[--text-muted]">No hay solicitudes que mostrar</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-[--background]">
                <tr>
                  <th className="text-left p-4 font-medium">Fecha</th>
                  <th className="text-left p-4 font-medium">Nombre</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="p-4 text-sm">
                      {new Date(req.createdAt).toLocaleDateString('es-PY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{req.name}</div>
                      <div className="text-sm text-[--text-muted]">{req.phone}</div>
                    </td>
                    <td className="p-4 text-sm">
                      {typeLabels[req.type] || req.type}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                        {req.status === 'PENDING' ? 'Pendiente' : req.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/solicitud/${req.id}`}
                        className="text-[--primary] hover:underline text-sm font-medium"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
