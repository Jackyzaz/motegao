
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from '../lib/axios';

export default function RegisterPage() {
  // สร้าง State ให้ครบตามฟิลด์ใน Swagger
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

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    status: "active", // ค่า Default ตามที่คุณส่งมา
    password: "",
    confirm_password: ""
  });

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 🎯 ส่งไปเฉพาะที่ Swagger บอกว่าต้องการเท่านั้น
      const payload = {
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        status: "active",
        password: formData.password,
        confirm_password: formData.confirm_password,
      };

      console.log("Sending Payload:", payload); // ลองดูใน Console ว่าข้อมูลสวยไหม

      const response = await api.post('/users/create', payload);

      if (response.status >= 200 && response.status < 300) {
        alert("IDENTITY CREATED: สมัครสมาชิกสำเร็จ!");
        router.push("/login");
      }
    } catch (error) {
      // พิมพ์ error ออกมาทั้งก้อนเพื่อดูโครงสร้าง
      console.log("Full Error Object:", error);

      // ตรวจสอบว่ามีข้อมูลจาก Server ไหม
      if (error.response) {
        console.log("Server Response Data:", error.response.data);
        alert(error.response.data?.detail || "Data format error from server");
      } else {
        // ถ้า error.response ไม่มีค่า อาจเป็นเพราะต่อเน็ตไม่ได้หรือ Server พัง
        alert("Cannot connect to Server. Please check if FastAPI is running.");
      }
    }
  };

  // ฟังก์ชันช่วยอัปเดตค่าใน State
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#222831", padding: "20px" }}>
      <div style={{ width: 400, padding: 40, background: "#31363F", borderRadius: 8, border: "1px solid #76ABAE", textAlign: "center",boxShadow: "0 0 20px rgba(118, 171, 174, 0.6), 0 0 40px rgba(118, 171, 174, 0.2)", }}>
        <h1 style={{ color: "#76ABAE", marginBottom: 10 }}>CREATE IDENTITY</h1>
        <p style={{ color: "#EEEEEE", fontSize: "11px", marginBottom: 25 }}>ENCRYPTING NEW USER DATA...</p>

        <form onSubmit={handleRegister}>
          {/* แถวที่ 1: Username & Email */}
          <input
            placeholder="ASSIGN USERNAME"
            name="username"
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            name="email"
            onChange={handleChange}
            style={inputStyle}
            required
          />

          {/* แถวที่ 2: First Name & Last Name (แบ่งครึ่งเพื่อให้ฟอร์มไม่ยาวเกินไป) */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              placeholder="FIRST NAME"
              name="first_name"
              onChange={handleChange}
              style={{ ...inputStyle, flex: 1 }}
              required
            />
            <input
              placeholder="LAST NAME"
              name="last_name"
              onChange={handleChange}
              style={{ ...inputStyle, flex: 1 }}
              required
            />
          </div>

          {/* แถวที่ 3: Passwords */}
          <input
            type="password"
            placeholder="SET PASSWORD"
            name="password"
            onChange={handleChange}
            // style={{ ...inputStyle, border: "1px solid #76ABAE" }}
            style={{ ...inputStyle,}}
            required
          />
          <input
            type="password"
            placeholder="CONFIRM PASSWORD"
            name="confirm_password"
            onChange={handleChange}
            style={{ ...inputStyle,  }}
            required
          />

          <button style={{ width: "100%", padding: "12px", background: "#76ABAE", color: "#222831", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: 10, letterSpacing: "1px" }}>
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