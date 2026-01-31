import Topbar from "./components/Topbar"
import Canvas from "./components/Canvas"
import Tools from "./components/Tools"

export default function Home() {
  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "#222831", // สีมืดสุดเป็นพื้นหลัก
      color: "#EEEEEE" 
    }}>
      <Topbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Canvas />
        <Tools />
      </div>
    </div>
  )
}