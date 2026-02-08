"use client"
import { useSession } from "next-auth/react"

import Topbar from "@/app/components/Topbar"
import Canvas from "@/app/components/Canvas"
import Tools from "@/app/components/Tools"
import { useMotegaoController } from "@/app/lib/motegao.controller"

// Mock data
const MOCK_DOMAINS = [
  { id: 1, name: "target.com", status: "active" },
  { id: 2, name: "example.org", status: "pending" },
  { id: 3, name: "testsite.net", status: "active" },
]

const MOCK_TOOLS = [
  { id: "subdomain", name: "Subdomain Finder", enabled: true },
  { id: "pathfinder", name: "Path Finder", enabled: false },
  { id: "nmap", name: "Nmap Scan", enabled: true },
  { id: "portscan", name: "Port Scanner", enabled: false },
]

export default function TestPage() {
  const { data: session, status } = useSession()
  
  // Use controller for all business logic
  const {
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

  if (status === "loading") {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#222831", 
        color: "#76ABAE" 
      }}>
        INITIALIZING SECURE SESSION...
      </div>
    )
  }

  return (
    <>
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        backgroundColor: "#222831", 
        color: "#EEEEEE" 
      }}>
        <Topbar 
          selectedDomain={selectedDomain}
          onOpenDomainModal={() => setShowDomainModal(true)}
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
            tools={MOCK_TOOLS}
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