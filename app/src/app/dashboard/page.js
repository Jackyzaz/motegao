"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Topbar from "../components/Topbar"
import ProjectCard from "../components/ProjectCard"
import api from "../lib/axios" // ✅ นำเข้า axios instance ของเรา
import { House ,Folder,Gear} from "phosphor-react";


export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // 1. โหลดโปรเจกต์จาก Database (FastAPI)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchProjects = async () => {
      if (status === "authenticated" && session?.user?.name) {
        try {
          setLoading(true)
          // ✅ เรียก GET /projects/{username}
          const response = await api.get(`/projects/${session.user.name}`)
          setProjects(response.data)
        } catch (error) {
          console.error("FAILED TO FETCH PROJECTS:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProjects()
  }, [status, session, router])

  // 2. สร้างโปรเจกต์ใหม่ลง Database
  const createNewProject = async () => {
    if (!session?.user?.name) return

    const newProj = {
      id: String(Date.now()), // ใช้ String เพื่อให้ MongoDB ทำงานง่าย
      name: `NEW_RECON_${Math.floor(Math.random() * 1000)}`,
      lastModified: new Date().toLocaleDateString(),
      nodes: [],
      edges: [],
      owner: session.user.name // ✅ ระบุเจ้าของที่นี่
    }

    try {
      // ✅ ส่งข้อมูลไปที่ FastAPI: POST /projects/create
      const response = await api.post("/projects/create", newProj)

      if (response.status === 200 || response.status === 201) {
        // อัปเดต State หน้าจอ และนำทางไปหน้า Canvas
        setProjects([newProj, ...projects])
        router.push(`/canvas?id=${newProj.id}`)
      }
    } catch (error) {
      console.error("CREATE PROJECT ERROR:", error)
      alert("FAILED TO INITIALIZE PROJECT IN DATABASE")
    }
  }

  // แสดงผลระหว่างรอ Session หรือโหลดข้อมูล
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div style={{ color: "#76ABAE", textAlign: "center", marginTop: "20%", fontFamily: "monospace" }}>
        SYNCHRONIZING WITH DATABASE...
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#222831" }}>
      <Topbar />

      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <div style={{ width: "240px", borderRight: "1px solid #31363F", padding: "20px", color: "#EEEEEE", }}>
          <div style={{ marginBottom: "30px", fontSize: "12px", color: "#76ABAE", fontWeight: "bold" }}>SYSTEM MENU</div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE",flexDirection: "row", display: "flex",fontSize: "15px", gap: "4px",color: "#A7DADC",}}> <House size={24} style={{ position: "relative", bottom: "3px" }}/> <span>Home</span></div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE" ,flexDirection: "row", display: "flex",fontSize: "15px", gap: "4px",}}><Folder size={23} style={{ position: "relative", bottom: "3px" }}/> My Operations</div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE",flexDirection: "row", display: "flex",fontSize: "15px", gap: "4px",}}><Gear size={23} style={{ position: "relative", bottom: "3px" }}/> Settings</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ color: "#EEEEEE" }}>AGENT : {session?.user?.name}</h2>
            <button
              onClick={createNewProject}
              style={{
                backgroundColor: "#76ABAE", color: "#222831", border: "none",
                padding: "10px 20px", borderRadius: "4px", fontWeight: "bold",
                cursor: "pointer", boxShadow: "0 0 10px rgba(118, 171, 174, 0.3)"
              }}
            >
              + NEW PROJECT
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px"
          }}>
           

            {projects.map((proj, index) => (
              <ProjectCard
                // ✅ ลองใช้ id ถ้าไม่มีให้ใช้ _id ถ้าไม่มีจริงๆ ให้ใช้ index ของ loop
                key={proj.id || proj._id || `proj-${index}`}
                project={proj}
                // ปรับจุด push URL ให้รองรับทั้ง id และ _id เผื่อกรณีข้อมูลเก่า
                onClick={() => router.push(`/canvas?id=${proj.id || proj._id}`)}
              />
            ))}
            {projects.length === 0 && !loading && (
              <div style={{ color: "#444", gridColumn: "1/-1", textAlign: "center", marginTop: "50px", fontFamily: "monospace" }}>
                [!] NO DATA FRAGMENTS FOUND. START A NEW SESSION.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}