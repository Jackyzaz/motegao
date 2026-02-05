"use client"

export default function ProjectCard({ project, onClick }) {
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
      {/* ส่วนพรีวิว (จำลอง) */}
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

      {/* รายละเอียด */}
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