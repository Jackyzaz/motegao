"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Topbar from "../components/Topbar"
import ProjectCard from "../components/ProjectCard"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState([])

  // โหลดโปรเจกต์จาก localStorage
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    
    const savedProjects = JSON.parse(localStorage.getItem("cyber_projects") || "[]")
    setProjects(savedProjects)
  }, [status, router])

  const createNewProject = () => {
    const newProj = {
      id: Date.now(),
      name: `NEW_RECON_${Math.floor(Math.random() * 1000)}`,
      lastModified: new Date().toLocaleDateString(),
      nodes: [],
      edges: []
    }
    const updated = [newProj, ...projects]
    setProjects(updated)
    localStorage.setItem("cyber_projects", JSON.stringify(updated))
    
    // หลังจากสร้างเสร็จ ให้โดดไปหน้า Canvas (ส่ง ID ไปด้วย)
    router.push(`/canvas?id=${newProj.id}`)
  }

  if (status === "loading") return <div style={{color: "#76ABAE", textAlign: "center", marginTop: "20%"}}>LOADING DATABASE...</div>

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#222831" }}>
      <Topbar />
      
      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        {/* Sidebar ซ้ายมือแบบ Tinkercad */}
        <div style={{ width: "240px", borderRight: "1px solid #31363F", padding: "20px", color: "#EEEEEE" }}>
          <div style={{ marginBottom: "30px", fontSize: "12px", color: "#76ABAE", fontWeight: "bold" }}>MENU</div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE" }}>🏠 Home</div>
          <div style={{ marginBottom: "15px", cursor: "pointer" }}>📁 Your Designs</div>
          <div style={{ marginBottom: "15px", cursor: "pointer" }}>📚 Tutorials</div>
        </div>

        {/* ส่วนแสดงโปรเจกต์ */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h2 style={{ color: "#EEEEEE" }}>Your Designs</h2>
            <button 
              onClick={createNewProject}
              style={{
                backgroundColor: "#76ABAE",
                color: "#222831",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              + Create New Project
            </button>
          </div>

          {/* Grid แสดงโปรเจกต์ */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "20px" 
          }}>
            {projects.map(proj => (
              <ProjectCard 
                key={proj.id} 
                project={proj} 
                onClick={() => router.push(`/canvas?id=${proj.id}`)}
              />
            ))}
            
            {projects.length === 0 && (
              <div style={{ color: "#444", gridColumn: "1/-1", textAlign: "center", marginTop: "50px" }}>
                NO DATA FOUND. INITIALIZE YOUR FIRST PROJECT.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}