"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import Topbar from "@/app/components/Topbar"
import Canvas from "@/app/components/Canvas"
import Tools from "@/app/components/Tools"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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