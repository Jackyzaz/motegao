"use client"
import { Pencil, Trash } from "@phosphor-icons/react"

export default function ProjectCard({ project, onClick, onRename, onDelete }) {
  const handleRename = (e) => {
    e.stopPropagation()
    onRename(project)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(project)
  }

  return (
    <div 
      onClick={onClick}
      style={{
        background: "#31363F",
        border: "1px solid #444",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.2s",
        position: "relative"
      }}
      onMouseOver={(e) => (e.currentTarget.style.border = "1px solid #76ABAE")}
      onMouseOut={(e) => (e.currentTarget.style.border = "1px solid #444")}
    >
      <div style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        display: "flex",
        gap: "6px",
        zIndex: 10
      }}>
        <button
          onClick={handleRename}
          style={{
            backgroundColor: "#76ABAE",
            border: "none",
            borderRadius: "4px",
            padding: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          title="Rename project"
        >
          <Pencil size={16} color="#222831" weight="bold" />
        </button>
        <button
          onClick={handleDelete}
          style={{
            backgroundColor: "#ff5555",
            border: "none",
            borderRadius: "4px",
            padding: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          title="Delete project"
        >
          <Trash size={16} color="#222831" weight="bold" />
        </button>
      </div>

      <div style={{ 
        height: "140px", 
        background: "#222831", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        borderBottom: "1px solid #444"
      }}>
        <div style={{ color: "#76ABAE", opacity: 0.3, fontSize: "40px" }}>⚛</div>
      </div>


      <div style={{ padding: "12px" }}>
        <div style={{ color: "#EEEEEE", fontWeight: "bold", fontSize: "14px" }}>
          {project.name}
        </div>
        <div style={{ color: "#76ABAE", fontSize: "10px", marginTop: "4px" }}>
          LAST EDITED: {project.lastModified}
        </div>
      </div>
    </div>
  )
}