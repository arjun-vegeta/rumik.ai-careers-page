import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

// Extend NextAuth's session to include our custom user fields
// This allows us to access user ID and role throughout the app
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
}

// Extend the JWT token to carry user ID and role information
// These fields get encrypted in the token and decoded during session creation
declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}
