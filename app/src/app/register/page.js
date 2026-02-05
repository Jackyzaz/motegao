"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "" });
  const router = useRouter();

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("ERROR: Passwords do not match!");
      return;
    }

    // จำลองการบันทึกข้อมูลลง LocalStorage
    const userData = { username: formData.username, password: formData.password };
    localStorage.setItem("cyber_user", JSON.stringify(userData));
    
    alert("REGISTRATION COMPLETE: Identity created.");
    router.push("/login");
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    background: "#222831",
    border: "1px solid #31363F",
    color: "#76ABAE",
    outline: "none",
    textAlign: "center",
    fontFamily: "monospace"
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#222831" }}>
      <div style={{ width: 350, padding: 40, background: "#31363F", borderRadius: 8, border: "1px solid #76ABAE", textAlign: "center" }}>
        <h1 style={{ color: "#76ABAE", marginBottom: 10 }}>CREATE IDENTITY</h1>
        <p style={{ color: "#EEEEEE", fontSize: "11px", marginBottom: 25 }}>ENCRYPTING NEW USER DATA...</p>
        
        <form onSubmit={handleRegister}>
          <input 
            placeholder="ASSIGN USERNAME" 
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            style={inputStyle} 
            required
          />
          <input 
            type="password" 
            placeholder="SET ACCESS CODE" 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{...inputStyle, border: "1px solid #76ABAE"}} 
            required
          />
          <input 
            type="password" 
            placeholder="CONFIRM ACCESS CODE" 
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            style={{...inputStyle, border: "1px solid #76ABAE"}} 
            required
          />
          <button style={{ width: "100%", padding: "12px", background: "#76ABAE", color: "#222831", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: 10 }}>
            REGISTER AGENT
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: "12px" }}>
          <Link href="/login" style={{ color: "#EEEEEE", textDecoration: "none", opacity: 0.7 }}>
            Already have identity? <span style={{ color: "#76ABAE" }}>Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}