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
      async authorize(credentials) {
        // 1. เช็ค Admin ปกติ (Hardcode)
        if (credentials?.username === "admin" && credentials?.password === "123456") {
          return { id: "admin", name: "System Admin", email: "admin@recon.local" };
        }

        // 2. เช็คจากข้อมูลที่ส่งมาจาก localStorage
        if (credentials?.localData) {
          const savedUser = JSON.parse(credentials.localData);

          // ตรวจสอบว่า Username และ Password ตรงกับที่สมัครไว้ไหม
          if (
            credentials.username === savedUser.username &&
            credentials.password === savedUser.password
          ) {
            return {
              id: "local-" + savedUser.username,
              name: savedUser.username, // ใช้ username เป็นชื่อโชว์ใน Topbar
              email: "localuser@recon.internal"
            };
          }
        }

        return null; // ถ้าไม่ตรงเลย ให้ตก
      }
    }),
  ],
  // ... callbacks และ pages เหมือนเดิม ...
});

export { handler as GET, handler as POST };