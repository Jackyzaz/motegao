"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react" // 1. นำเข้า useSession

import Topbar from "./components/Topbar"
import Canvas from "./components/Canvas"
import Tools from "./components/Tools"

export default function Home() {
  const router = useRouter()
  // 2. ดึงสถานะการล็อกอินจาก NextAuth
  const { data: session, status } = useSession()

  useEffect(() => {
    // 3. เปลี่ยนจากการเช็ค localStorage เป็นเช็ค status จาก NextAuth
    // ถ้าสถานะคือ "ไม่มีการเข้าสู่ระบบ" (unauthenticated) จริงๆ ถึงจะให้เด้งไปหน้า login
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // 4. ระหว่างที่ status กำลังโหลด ("loading") ให้โชว์หน้าจอรอโหลดก่อน
  // ป้องกันไม่ให้หน้าขาวหรือเด้งไปมา
  if (status === "loading") {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#222831", 
        color: "#76ABAE" 
      }}>
        INITIALIZING SECURE SESSION...
      </div>
    )
  }

  // 5. ถ้าผ่านเงื่อนไข (status === "authenticated") ค่อยแสดงหน้า Dashboard
  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "#222831", 
      color: "#EEEEEE" 
    }}>
      <Topbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Canvas />
        <Tools />
      </div>
    </div>
  )
}