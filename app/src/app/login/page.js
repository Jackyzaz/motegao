"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    // 1. เพิ่ม State สำหรับเก็บทั้ง Username และ Password
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        // ดึงข้อมูล User ที่เคยสมัครไว้ในเครื่องนี้
        const savedUser = JSON.parse(localStorage.getItem("cyber_user"));

        // แปลง Object เป็น String เพื่อส่งข้ามไปฝั่ง Server
        const userDataString = savedUser ? JSON.stringify(savedUser) : null;

        const result = await signIn("credentials", {
            redirect: false,
            username: username,
            password: password,
            // ✅ ส่งข้อมูลจาก localStorage แนบไปด้วยในชื่อ localData
            localData: userDataString
        });

        if (result?.ok) {
            router.push("/");
        } else {
            alert("ACCESS DENIED: Identity mismatch or User not found on this machine.");
        }
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
                <h1 style={{ color: "#76ABAE", marginBottom: 10 }}>TERMINAL ACCESS</h1>
                <p style={{ color: "#EEEEEE", fontSize: "12px", marginBottom: 30 }}>IDENTITY VERIFICATION REQUIRED</p>

                <form onSubmit={handleLogin}>
                    {/* แก้ไขช่อง Username ให้พิมพ์ได้ */}
                    <input
                        type="text"
                        placeholder="ENTER USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // เก็บค่าลง state
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="ACCESS CODE"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // เก็บค่าลง state
                        style={{ ...inputStyle, border: "1px solid #76ABAE" }}
                    />

                    <button style={{ width: "100%", padding: "12px", background: "#76ABAE", color: "#222831", border: "none", fontWeight: "bold", cursor: "pointer", letterSpacing: "2px" }}>
                        INITIALIZE AUTH
                    </button>
                </form>

                <div style={{ margin: "20px 0", color: "#444" }}>OR</div>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })} // เรียกใช้ Google Login
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "transparent",
                        color: "#EEEEEE",
                        border: "1px solid #EEEEEE",
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        fontWeight: "bold"
                    }}
                >
                    <img src="https://authjs.dev/img/providers/google.svg" width="20" alt="google" />
                    CONTINUE WITH GOOGLE
                </button>

                <div style={{ marginTop: 20, fontSize: "12px" }}>
                    <span style={{ color: "#EEEEEE", opacity: 0.7 }}>New Agent? </span>
                    <Link href="/register" style={{ color: "#76ABAE", textDecoration: "none", fontWeight: "bold" }}>
                        Create Identity
                    </Link>
                </div>
            </div>

        </div>
    );
}