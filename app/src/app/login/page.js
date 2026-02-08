"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import api from "@/app/lib/axios"
import { INPUT_STYLES } from "@/app/lib/styles"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()

        const result = await signIn("credentials", {
            redirect: false,
            username: username,
            password: password,
        })

        if (result?.ok) {
            router.push("/")
        } else {
            alert("ACCESS DENIED: Invalid Identity or Terminal Error.")
        }
    }

    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#222831" }}>
            <div style={{ width: 350, padding: 40, background: "#31363F", borderRadius: 8, border: "1px solid #76ABAE", textAlign: "center",boxShadow: "0 0 20px rgba(118, 171, 174, 0.6), 0 0 40px rgba(118, 171, 174, 0.2)", }}>
                <h1 style={{ color: "#76ABAE", marginBottom: 10 }}>MOTEGAO</h1>
                <p style={{ color: "#EEEEEE", fontSize: "12px", marginBottom: 30 }}>IDENTITY VERIFICATION REQUIRED</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="ENTER USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={INPUT_STYLES.base}
                    />

                    <input
                        type="password"
                        placeholder="ENTER PASSWORD"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={INPUT_STYLES.base}
                    />

                    <button style={{ width: "100%", padding: "12px", background: "#76ABAE", color: "#222831", border: "none", fontWeight: "bold", cursor: "pointer", letterSpacing: "2px" }}>
                        INITIALIZE AUTH
                    </button>
                </form>

                <div style={{ margin: "20px 0", color: "#444" }}>OR</div>
                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
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