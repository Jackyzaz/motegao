"use client"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation" // ✅ เพิ่มเพื่อรับ ID
import { useEffect } from "react"

import Topbar from "@/app/components/Topbar"
import Canvas from "@/app/components/Canvas"
import Tools from "@/app/components/Tools"
import { useMotegaoController } from "@/app/lib/motegao.controller"

export default function CanvasPage() {


    const { data: session, status } = useSession()
    const searchParams = useSearchParams()
    const projectId = searchParams.get("id") // ✅ ดึง ID จาก URL ที่ Dashboard ส่งมา
    const controller = useMotegaoController(projectId);
    const {
        // ... ดึงตัวแปรจาก Controller เหมือนเดิม
        domains,
        showDomainModal,
        newDomainInput,
        selectedDomain,
        enabledTools,
        scanResults,
        nodes,
        edges,
        runningTasks,
        setShowDomainModal,
        setNewDomainInput,
        onNodesChange,
        onEdgesChange,
        handleNodeClick,
        handleAddDomain,
        handleSelectDomain,
        handleToggleTool,
        handleRunTool,
    } = useMotegaoController()

    // 📡 ฟังก์ชันดึงข้อมูลโปรเจกต์จริงจาก Database
    useEffect(() => {
        if (projectId && status === "authenticated") {
            console.log(`INITIALIZING PROJECT_ID: ${projectId}`)
            // ในอนาคตคุณสามารถสั่ง fetch ข้อมูล nodes/edges ของ ID นี้มาแทน Mock ได้ที่นี่
        }
    }, [projectId, status])

    if (status === "loading") {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#222831", color: "#76ABAE" }}>
                DECRYPTING PROJECT DATA...
            </div>
        )
    }

    return (
        <>
            <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#222831", color: "#EEEEEE" }}>
                {/* ส่ง ID ไปโชว์บน Topbar ด้วยก็ได้ครับ */}
                <Topbar
                    selectedDomain={selectedDomain}
                    onOpenDomainModal={() => setShowDomainModal(true)}
                    projectId={projectId}
                />
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    <Canvas
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={handleNodeClick}
                        scanResults={scanResults}
                    />
                    <Tools
                        tools={[
                            { id: "subdomain", name: "Subdomain Finder", enabled: true },
                            { id: "pathfinder", name: "Path Finder", enabled: false },
                            { id: "nmap", name: "Nmap Scan", enabled: true }
                        ]}
                        enabledTools={enabledTools}
                        onToggleTool={handleToggleTool}
                        onRunTool={handleRunTool}
                        runningTasks={runningTasks}
                        domains={domains}
                        selectedDomain={selectedDomain}
                        onSelectDomain={handleSelectDomain}
                        onOpenAddDomainModal={() => setShowDomainModal(true)}
                    />
                </div>
            </div>

            {showDomainModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "#31363F",
                        padding: "30px",
                        borderRadius: "8px",
                        border: "2px solid #76ABAE",
                        minWidth: "400px"
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}>
                            <h2 style={{ color: "#76ABAE", margin: 0 }}>Add Domain</h2>
                            <button
                                onClick={() => setShowDomainModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#76ABAE",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    padding: 0
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <input
                            type="text"
                            value={newDomainInput}
                            onChange={(e) => setNewDomainInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                            placeholder="example.com"
                            autoFocus
                            style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: "#222831",
                                border: "1px solid #76ABAE",
                                borderRadius: "4px",
                                color: "#EEEEEE",
                                fontSize: "16px",
                                marginBottom: "20px",
                                outline: "none"
                            }}
                        />

                        <button
                            onClick={handleAddDomain}
                            disabled={!newDomainInput.trim()}
                            style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: newDomainInput.trim() ? "#76ABAE" : "#444",
                                color: newDomainInput.trim() ? "#222831" : "#666",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                fontSize: "16px",
                                cursor: newDomainInput.trim() ? "pointer" : "not-allowed",
                                transition: "all 0.2s"
                            }}
                        >
                            Add Domain
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}