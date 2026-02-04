export default function Tools() {
  return (
    <div style={{ 
      width: 300, 
      background: "#31363F", 
      padding: 20, 
      display: "flex", 
      flexDirection: "column", 
      gap: 16,
      borderLeft: "1px solid #222831"
    }}>
      <h2 style={{ color: "#76ABAE", fontSize: "1.2rem", marginBottom: 8 }}>Tools</h2>
      <ToolBox title="subdomain finder" />
      <ToolBox title="path finder" />
      <ToolBox title="nmap scan" />
    </div>
  )
}

function ToolBox({ title }) {
  return (
    <div style={{ 
      background: "#222831", 
      padding: "15px", 
      borderRadius: 8, 
      border: "1px solid #31363F" 
    }}>
      <h3 style={{ marginBottom: 12, color: "#EEEEEE", textTransform: "capitalize" }}>{title}</h3>
      <select style={{ 
        width: "100%", 
        marginBottom: 12, 
        background: "#31363F", 
        color: "#EEEEEE", 
        border: "1px solid #76ABAE",
        padding: "4px"
      }}>
        <option>select wordlist</option>
      </select>
      <button style={{ 
        width: "100%",
        background: "#76ABAE", 
        color: "#222831", 
        border: "none", 
        padding: "8px", 
        borderRadius: 4, 
        fontWeight: "bold",
        cursor: "pointer"
      }}>
        Run Tool
      </button>
    </div>
  )
}