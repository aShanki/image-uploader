import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import DiscordProvider from "next-auth/providers/discord"
import clientPromise from "@/lib/mongodb-adapter"
import { User } from "@/models/User"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      // Include Discord access token in the token
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user }) {
      try {
        // Check if user exists in our database
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          // Create new user if they don't exist
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'user', // Default role
            uploadCount: 0,
          })
        }
        
        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },
  },
  pages: {
    signIn: '/', // Use home page as sign in page
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}

export const getServerAuthSession = () => getServerSession(authOptions)