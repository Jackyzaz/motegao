"use client"

export default function Topbar() {
  return (
    <div style={{
      height: 60,
      background: "#15181d",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid #31363F",
    }}>
      <select style={{ 
        background: "#31363F", 
        color: "#EEEEEE", 
        border: "1px solid #76ABAE",
        borderRadius: 4,
        padding: "2px 8px"
      }}>
        <option>Project: Recon Alpha</option>
      </select>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ color: "#76ABAE", fontSize: "14px" }}>Admin User</div>
        <button style={{
          background: "transparent",
          color: "#EEEEEE",
          border: "1px solid #76ABAE",
          padding: "4px 12px",
          borderRadius: 4,
          cursor: "pointer"
        }}>Logout</button>
      </div>
    </div>
  )
}