"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShieldPlus, FloppyDisk, CheckCircle, Circle } from "@phosphor-icons/react"

export default function Topbar({ selectedDomain, onOpenDomainModal, projectId, onSave, saveStatus }) {
  const { data: session } = useSession()
  const router = useRouter()
  
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
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ 
            background: "none", 
            border: "1px solid #76ABAE", 
            color: "#EEEEEE", 
            cursor: "pointer",
            padding: "5px 10px",
            display: "flex",
            borderRadius: "4px",
            gap: "4px"
          }}
        >
        <ShieldPlus size={25} style={{ position: "relative", bottom: "1px" }} />
        MOTEGAO
        </button>
        
        {projectId && onSave && (
          <button
            onClick={onSave}
            disabled={saveStatus === "saving"}
            style={{
              background: saveStatus === "saved" ? "#50fa7b" : saveStatus === "saving" ? "#888" : "#76ABAE",
              border: "none",
              color: "#222831",
              cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
              padding: "5px 12px",
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
              gap: "6px",
              fontWeight: "bold",
              fontSize: "12px",
              transition: "all 0.3s"
            }}
          >
            {saveStatus === "saved" ? (
              <><CheckCircle size={18} /> SAVED</>
            ) : saveStatus === "saving" ? (
              <><Circle size={18} /> SAVING...</>
            ) : (
              <><FloppyDisk size={18} /> SAVE</>
            )}
          </button>
        )}
        
        <div style={{ fontWeight: "bold", color: "#EEEEEE" }}>
          
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right", color: "#EEEEEE" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>
            {session?.user?.name || "Loading..."}
          </div>
          <div style={{ fontSize: "10px", color: "#76ABAE" }}>
            {session?.user?.email}
          </div>
        </div>

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