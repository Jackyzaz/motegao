"use client"
import { useSession, signOut } from "next-auth/react"

export default function Topbar({ selectedDomain, onOpenDomainModal }) {
  const { data: session } = useSession()

  return (
    <div style={{
      height: "60px",
      backgroundColor: "#31363F",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "2px solid #76ABAE"
    }}>
      {/* ด้านซ้าย: ปุ่มเลือกโดเมน */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button 
          onClick={onOpenDomainModal}
          style={{ 
            background: "none", 
            border: "1px solid #76ABAE", 
            color: "#76ABAE", 
            cursor: "pointer",
            padding: "5px 10px",
            borderRadius: "4px"
          }}
        >
          ☰ DOMAINS
        </button>
        <div style={{ fontWeight: "bold", color: "#EEEEEE" }}>
          🎯 {selectedDomain?.name || "No domain selected"}
        </div>
      </div>

      {/* ด้านขวา: แสดงชื่อบัญชีจาก Google */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right", color: "#EEEEEE" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>
            {session?.user?.name || "Loading..."}
          </div>
          <div style={{ fontSize: "10px", color: "#76ABAE" }}>
            {session?.user?.email}
          </div>
        </div>

        {/* รูปโปรไฟล์ */}
        {session?.user?.image && (
          <img 
            src={session.user.image} 
            alt="User" 
            style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #76ABAE" }} 
          />
        )}

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            marginLeft: "10px",
            backgroundColor: "#76ABAE",
            color: "#222831",
            border: "none",
            padding: "5px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold"
          }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  )
}