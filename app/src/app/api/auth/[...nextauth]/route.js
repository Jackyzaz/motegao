import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ... (ส่วน GoogleProvider) ...
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        localData: { label: "LocalData", type: "text" } // เพิ่มช่องรับข้อมูล
      },
      // ... ภายใน CredentialsProvider -> authorize ...
      async authorize(credentials) {
        // 1. เตรียมข้อมูลในรูปแบบ Form Urlencoded (ตามภาพ image_105cf8.png)
        const formData = new URLSearchParams();
        formData.append('grant_type', 'password'); // FastAPI OAuth2 ต้องการตัวนี้
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('scope', '');
        formData.append('client_id', '');
        formData.append('client_secret', '');

        // 2. ยิงไปที่ Path v1 (ตามที่ปรากฏใน Swagger)
        const res = await fetch("http://127.0.0.1:8000/v1/auth/login", {
          method: 'POST',
          body: formData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          }
        });

        const data = await res.json();

        // 3. เช็ค Response (ตามภาพ image_105d34.png)
        if (res.ok && data.access_token) {
          // ล็อกอินสำเร็จ: ส่งข้อมูลไปเก็บใน Session
          return {
            id: credentials.username,
            name: credentials.username,
            email: credentials.username + "@motegao.local",
            accessToken: data.access_token // เก็บ Token ไว้ใช้ดึงข้อมูลโปรเจกต์ในอนาคต
          };
        }

        // ถ้า Error (401 หรือ 422) ให้คืนค่า null เพื่อให้หน้า Login โชว์ Alert
        return null;
      }
    }),
  ],
  // ... callbacks และ pages เหมือนเดิม ...
});

export { handler as GET, handler as POST };