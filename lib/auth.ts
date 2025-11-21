import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "./prisma"

// ============================================
// Authentication Configuration
// ============================================

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Handles user creation and role assignment during Google sign-in
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
    
    // Enriches JWT token with user data from database
    async jwt({ token, user, account, trigger }) {
      if ((account?.provider === "google" && user?.email) || trigger === "update") {
        const email = user?.email || token.email
        if (email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: email as string },
          })
          
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.email = dbUser.email
          }
        }
      }
      return token
    },
    
    // Attaches user ID and role to the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    
    // Manages post-authentication redirects
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})
