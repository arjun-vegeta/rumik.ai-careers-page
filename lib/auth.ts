import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        const role = adminEmails.includes(user.email) ? 'recruiter' : 'applicant'
        
        await prisma.user.upsert({
          where: { email: user.email },
          update: { 
            name: user.name,
            googleId: account.providerAccountId,
          },
          create: {
            email: user.email,
            name: user.name,
            googleId: account.providerAccountId,
            role,
          },
        })
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        const role = adminEmails.includes(user.email) ? 'recruiter' : 'applicant'
        
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
        
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        } else {
          token.role = role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to home page
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})
