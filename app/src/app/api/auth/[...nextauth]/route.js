import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const formData = new URLSearchParams()
          formData.append('grant_type', 'password')
          formData.append('username', credentials.username)
          formData.append('password', credentials.password)
          formData.append('scope', '')
          formData.append('client_id', '')
          formData.append('client_secret', '')

          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1'
          const response = await axios.post(`${apiUrl}/auth/login`, formData, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json"
            }
          })

          const data = response.data

          if (response.status === 200 && data.access_token) {
            return {
              id: credentials.username,
              name: credentials.username,
              email: credentials.username + "@motegao.local",
              accessToken: data.access_token
            }
          }
        } catch (error) {
          console.error("Auth Error:", error.response?.data || error.message)
          return null
        }
        return null
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.provider = token.provider
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST };