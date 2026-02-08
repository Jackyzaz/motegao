"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Topbar from "../components/Topbar"
import ProjectCard from "../components/ProjectCard"
import api from "../lib/axios" // ✅ นำเข้า axios instance ของเรา
import { House, Folder, Gear } from "@phosphor-icons/react";


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
      if (status === "authenticated") {
        try {
          setLoading(true)
          // ✅ เรียก GET /projects/my-projects (requires auth)
          const response = await api.get("/projects/my-projects")
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
      name: `NEW_RECON_${Math.floor(Math.random() * 1000)}`,
      nodes: [],
      edges: [],
      // owner will be set automatically from auth token
    }

    try {
      // ✅ ส่งข้อมูลไปที่ FastAPI: POST /projects/create (requires auth)
      const response = await api.post("/projects/create", newProj)

      if (response.status === 200 || response.status === 201) {
        // Refresh projects list after creation
        const projectsResponse = await api.get("/projects/my-projects")
        setProjects(projectsResponse.data)
        // Navigate to the newly created project
        router.push(`/canvas?id=${response.data.id}`)
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
                // MongoDB returns id as ObjectId, handle both formats
                key={String(proj.id || proj._id || index)}
                project={proj}
                onClick={() => router.push(`/canvas?id=${String(proj.id || proj._id)}`)}
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