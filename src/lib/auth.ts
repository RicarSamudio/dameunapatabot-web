import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
    }
  }
}

// Create PrismaClient fresh inside authorize to avoid module-level caching
async function getAdmin(email: string, password: string) {
  const prisma = new PrismaClient()
  
  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return null
    }

    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      return null
    }

    return { id: admin.id, email: admin.email }
  } finally {
    await prisma.$disconnect()
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Create PrismaClient inside authorize - no caching issues
        return await getAdmin(credentials.email, credentials.password)
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
