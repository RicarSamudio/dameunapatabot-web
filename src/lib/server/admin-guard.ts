import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type AdminGuardResult =
  | { ok: true; session: { user: { email?: string | null; role?: string } } }
  | { ok: false; status: 401 | 403; body: { error: string } }

export async function requireAdminSession(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      ok: false,
      status: 401,
      body: { error: 'Unauthorized' },
    }
  }

  if (session.user.role !== 'ADMIN') {
    return {
      ok: false,
      status: 403,
      body: { error: 'Forbidden' },
    }
  }

  return { ok: true, session: { user: session.user } }
}
