import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios"; // 👈 เพิ่มการ import axios

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
          // 1. เตรียมข้อมูลในรูปแบบ Form Urlencoded สำหรับ FastAPI
          const formData = new URLSearchParams();
          formData.append('grant_type', 'password');
          formData.append('username', credentials.username);
          formData.append('password', credentials.password);
          formData.append('scope', '');
          formData.append('client_id', '');
          formData.append('client_secret', '');

          //2. ยิงไปที่ FastAPI ด้วย Axios
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1';
          const response = await axios.post(`${apiUrl}/auth/login`, formData, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Accept": "application/json"
            }
          });

          //test
          // const response = await axios.post(`http://127.0.0.1:8000/v1/auth/login`, formData, {
          //   headers: {
          //     "Content-Type": "application/x-www-form-urlencoded",
          //     "Accept": "application/json"
          //   }
          // });

          // Axios จะเก็บข้อมูลไว้ใน propertyชื่อ data โดยอัตโนมัติ
          const data = response.data;

          // 3. เช็ค Response ถ้าสำเร็จจะได้ access_token มา
          if (response.status === 200 && data.access_token) {
            return {
              id: credentials.username,
              name: credentials.username,
              email: credentials.username + "@motegao.local",
              accessToken: data.access_token
            };
          }
        } catch (error) {
          // ถ้า Axios เจอ Error (เช่น 401) จะตกลงมาที่นี่
          console.error("Auth Error:", error.response?.data || error.message);
          return null;
        }
        return null;
      }
    }),
  ],
  // เพิ่ม callbacks เพื่อให้สามารถนำ accessToken ไปใช้ในหน้าอื่นๆ ได้
  callbacks: {
    async jwt({ token, user, account }) {
      // ถ้าเป็นการ Login ครั้งแรก
      if (user) {
        token.accessToken = user.accessToken; // สำหรับ Credentials
        token.provider = account?.provider;    // เก็บไว้ดูว่ามาจาก google หรือ credentials
      }
      return token;
    },
    async session({ session, token }) {
      // ส่งข้อมูลไปที่หน้าบ้าน (Frontend)
      session.accessToken = token.accessToken;
      session.user.provider = token.provider;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST };