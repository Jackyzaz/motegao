"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { House, Folder, Gear } from "@phosphor-icons/react"

import Topbar from "@/app/components/Topbar"
import ProjectCard from "@/app/components/ProjectCard"
import api from "@/app/lib/axios"
import { useModal } from "@/app/context/ModalContext"


export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { showInputModal, showConfirm, showSuccess, showError } = useModal()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchProjects = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true)
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

  const createNewProject = async () => {
    if (!session?.user?.name) return

    showInputModal({
      title: "Create New Project",
      message: "Enter a name for your new project:",
      placeholder: "Enter project name...",
      confirmText: "Create",
      onConfirm: async (projectName) => {
        if (!projectName || !projectName.trim()) {
          showError("Project name cannot be empty")
          return
        }

        const newProj = {
          name: projectName.trim(),
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
            showSuccess("Project created successfully!")
            // Navigate to the newly created project
            router.push(`/canvas?id=${response.data.id}`)
          }
        } catch (error) {
          console.error("CREATE PROJECT ERROR:", error)
          showError("Failed to create project. Please try again.")
        }
      }
    })
  }

  const handleRenameProject = async (project) => {
    showInputModal({
      title: "Rename Project",
      message: "Enter a new name for the project:",
      placeholder: "Enter new name...",
      initialValue: project.name,
      confirmText: "Rename",
      onConfirm: async (newName) => {
        if (!newName || !newName.trim()) {
          showError("Project name cannot be empty")
          return
        }

        try {
          const projectId = String(project.id || project._id)
          const response = await api.put(`/projects/rename/${projectId}`, {
            name: newName.trim()
          })

          if (response.status === 200) {
            // Refresh projects list
            const projectsResponse = await api.get("/projects/my-projects")
            setProjects(projectsResponse.data)
            showSuccess("Project renamed successfully!")
          }
        } catch (error) {
          console.error("RENAME PROJECT ERROR:", error)
          showError("Failed to rename project. Please try again.")
        }
      }
    })
  }

  const handleDeleteProject = async (project) => {
    showConfirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      async () => {
        try {
          const projectId = String(project.id || project._id)
          const response = await api.delete(`/projects/delete/${projectId}`)

          if (response.status === 200) {
            // Refresh projects list
            const projectsResponse = await api.get("/projects/my-projects")
            setProjects(projectsResponse.data)
            showSuccess("Project deleted successfully!")
          }
        } catch (error) {
          console.error("DELETE PROJECT ERROR:", error)
          showError("Failed to delete project. Please try again.")
        }
      },
      "Delete Project"
    )
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
        {/* <div style={{ width: "240px", borderRight: "1px solid #31363F", padding: "20px", color: "#EEEEEE", }}>
          <div style={{ marginBottom: "30px", fontSize: "12px", color: "#76ABAE", fontWeight: "bold" }}>SYSTEM MENU</div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE",flexDirection: "row", display: "flex",fontSize: "15px", gap: "4px",color: "#A7DADC",}}> <House size={24} style={{ position: "relative", bottom: "3px" }}/> <span>Home</span></div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE" ,flexDirection: "row", display: "flex",fontSize: "15px", gap: "4px",}}><Folder size={23} style={{ position: "relative", bottom: "3px" }}/> My Operations</div>
          <div style={{ marginBottom: "15px", cursor: "pointer", color: "#76ABAE",flexDirection: "row", display: "flex",fontSize: "15px", gap: "4px",}}><Gear size={23} style={{ position: "relative", bottom: "3px" }}/> Settings</div>
        </div> */}

        {/* Content */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
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
                onRename={handleRenameProject}
                onDelete={handleDeleteProject}
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