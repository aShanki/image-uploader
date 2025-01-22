import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

// Extend both next-auth and @auth/core types to ensure compatibility
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
  }
}