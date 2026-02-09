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
    async jwt({ token, user, account, profile }) {
      // Handle credential login (already has accessToken)
      if (user?.accessToken) {
        token.accessToken = user.accessToken
        token.provider = account?.provider
        return token
      }

      // Handle Google OAuth - register/login with backend API
      if (account?.provider === "google" && profile) {
        try {
          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1'
          
          // Try to register or login the Google user with backend
          const response = await axios.post(`${apiUrl}/auth/google-login`, {
            email: profile.email,
            name: profile.name,
            google_id: profile.sub,
            picture: profile.picture
          }, {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          })

          if (response.data.access_token) {
            token.accessToken = response.data.access_token
            token.provider = "google"
          }
        } catch (error) {
          console.error("Google OAuth backend error:", error.response?.data || error.message)
          // If backend call fails, return token without accessToken
          // This will cause API calls to fail with 401
        }
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