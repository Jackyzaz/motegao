"use client"
import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { applyEdgeChanges, applyNodeChanges, MarkerType } from "reactflow"

import Topbar from "../components/Topbar"
import Canvas from "../components/Canvas"
import Tools from "../components/Tools"
import api from "../lib/axios"

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
  
  // State management
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [showInitialModal, setShowInitialModal] = useState(true)
  const [newDomainInput, setNewDomainInput] = useState("")
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [enabledTools, setEnabledTools] = useState(
    MOCK_TOOLS.filter(t => t.enabled).map(t => t.id)
  )
  const [scanResults, setScanResults] = useState(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [runningTasks, setRunningTasks] = useState({}) // Track running tasks by tool id

  // Graph handlers
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  // Poll for task results
  useEffect(() => {
    const activeTasks = Object.entries(runningTasks).filter(([_, task]) => task.status === 'running')
    
    if (activeTasks.length === 0) return

    const interval = setInterval(async () => {
      for (const [toolId, task] of activeTasks) {
        try {
          const response = await api.get(`/commands/result/${task.taskId}`)
          const { status, result } = response.data

          if (status === 'SUCCESS') {
            setRunningTasks(prev => ({
              ...prev,
              [toolId]: { ...prev[toolId], status: 'completed', result }
            }))
            
            // Update nodes with results
            updateNodesWithResults(toolId, result)
          } else if (status === 'FAILURE') {
            setRunningTasks(prev => ({
              ...prev,
              [toolId]: { ...prev[toolId], status: 'failed', error: result }
            }))
          }
        } catch (error) {
          console.error(`Error polling task ${task.taskId}:`, error)
        }
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [runningTasks])

  // Update graph nodes with scan results
  const updateNodesWithResults = (toolId, result) => {
    console.log(`Results for ${toolId}:`, result)
    
    setScanResults({
      tool: toolId,
      result,
      timestamp: new Date().toISOString()
    })

    // Create new node based on tool type
    let newNode = null
    let newEdge = null

    if (toolId === "nmap") {
      // Parse nmap results
      const isError = result.includes("Usage: nmap")
      const nodeId = `nmap-${Date.now()}`
      
      if (isError) {
        newNode = {
          id: nodeId,
          data: {
            label: (
              <div style={{ textAlign: "left", fontSize: "11px" }}>
                <b style={{ color: "#76ABAE" }}>Nmap Scan</b>
                <div style={{ color: "#ff5555" }}>Error: Invalid command</div>
                <div style={{ color: "#EEEEEE", fontSize: "10px" }}>Check configuration</div>
              </div>
            ),
          },
          position: { x: 100, y: 200 },
          style: {
            background: "#31363F",
            color: "#EEEEEE",
            border: "1px solid #ff5555",
            width: 180,
          },
        }
      } else {
        // Parse successful nmap output
        const openPorts = []
        const lines = result.split('\n')
        lines.forEach(line => {
          if (line.includes('open')) {
            openPorts.push(line.trim())
          }
        })

        newNode = {
          id: nodeId,
          data: {
            label: (
              <div style={{ textAlign: "left", fontSize: "11px" }}>
                <b style={{ color: "#76ABAE" }}>Nmap Scan</b>
                {openPorts.length > 0 ? (
                  openPorts.slice(0, 5).map((port, i) => (
                    <div key={i} style={{ color: "#50fa7b" }}>• {port}</div>
                  ))
                ) : (
                  <div style={{ color: "#EEEEEE" }}>Scan completed</div>
                )}
              </div>
            ),
          },
          position: { x: 550, y: 200 },
          style: {
            background: "#31363F",
            color: "#EEEEEE",
            border: "1px solid #76ABAE",
            width: 200,
          },
        }
      }

      newEdge = {
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId,
        animated: true,
        style: { stroke: isError ? "#ff5555" : "#76ABAE" }
      }
    } else if (toolId === "subdomain") {
      // Parse subdomain results
      const nodeId = `subdomain-${Date.now()}`
      const subdomains = Array.isArray(result) ? result : []

      newNode = {
        id: nodeId,
        data: {
          label: (
            <div style={{ textAlign: "left", fontSize: "11px" }}>
              <b style={{ color: "#76ABAE" }}>Subdomains Found</b>
              {subdomains.length > 0 ? (
                subdomains.slice(0, 5).map((sub, i) => (
                  <div key={i} style={{ color: "#50fa7b" }}>• {sub}</div>
                ))
              ) : (
                <div style={{ color: "#EEEEEE" }}>No subdomains found</div>
              )}
              {subdomains.length > 5 && (
                <div style={{ color: "#76ABAE", fontSize: "10px" }}>
                  +{subdomains.length - 5} more
                </div>
              )}
            </div>
          ),
        },
        position: { x: 50, y: 200 },
        style: {
          background: "#31363F",
          color: "#EEEEEE",
          border: "1px solid #76ABAE",
          width: 180,
        },
      }

      newEdge = {
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId,
        animated: true,
        style: { stroke: "#76ABAE" }
      }
    }

    // Add the new node and edge to the graph
    if (newNode) {
      setNodes(prev => [...prev, newNode])
    }
    if (newEdge) {
      setEdges(prev => [...prev, newEdge])
    }
  }

  // Handlers
  const handleAddDomain = () => {
    if (!newDomainInput.trim()) return
    
    const newDomain = {
      id: Date.now(),
      name: newDomainInput.trim(),
      status: "active"
    }
    
    setSelectedDomain(newDomain)
    setShowInitialModal(false)
    setNewDomainInput("")
    
    // Initialize graph with domain node
    setNodes([
      {
        id: "1",
        type: "input",
        data: { label: `🎯 ${newDomain.name}` },
        position: { x: 400, y: 50 },
        style: {
          background: "#76ABAE",
          color: "#222831",
          border: "none",
          fontWeight: "bold",
          width: 180,
        },
      }
    ])
    setEdges([])
  }
  const handleSelectDomain = (domain) => {
    setSelectedDomain(domain)
    setShowDomainModal(false)
    setScanResults(null) // Reset results when domain changes
    // Update domain node
    setNodes(nds => nds.map(node => 
      node.id === "1" 
        ? { ...node, data: { label: `🎯 ${domain.name}` } }
        : node
    ))
  }

  const handleToggleTool = (toolId) => {
    setEnabledTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const handleRunTool = async (toolId, config) => {
    if (!selectedDomain) {
      alert("Please select a domain first")
      return
    }

    console.log(`Running ${toolId} with config:`, config)
    
    // Set task as running
    setRunningTasks(prev => ({
      ...prev,
      [toolId]: { status: 'running', taskId: null }
    }))

    try {
      let response
      
      // Call appropriate API endpoint based on tool
      switch (toolId) {
        case "subdomain":
          response = await api.post("/commands/subdomain_dns_enum", {
            domain: selectedDomain.name,
            threads: 10,
            wordlist: config.wordlist || "top1000"
          })
          break
          
        case "nmap":
          response = await api.post("/commands/nmap", {
            host: selectedDomain.name,
            timing_template: 4, // -T4
            options: ["-sV"],
            all_ports: false,
            ports_specific: [80, 443, 8080, 8443]
          })
          break
          
        case "pathfinder":
          // This would be a custom endpoint
          alert("Path finder API not yet implemented")
          setRunningTasks(prev => {
            const newTasks = { ...prev }
            delete newTasks[toolId]
            return newTasks
          })
          return
          
        default:
          alert(`Tool ${toolId} not implemented`)
          setRunningTasks(prev => {
            const newTasks = { ...prev }
            delete newTasks[toolId]
            return newTasks
          })
          return
      }

      // Store task ID for polling
      if (response.data.task_id) {
        setRunningTasks(prev => ({
          ...prev,
          [toolId]: { status: 'running', taskId: response.data.task_id }
        }))
      }
      
    } catch (error) {
      console.error(`Error running ${toolId}:`, error)
      setRunningTasks(prev => ({
        ...prev,
        [toolId]: { status: 'failed', error: error.message }
      }))
      alert(`Failed to run ${toolId}: ${error.message}`)
    }
  }

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
            scanResults={scanResults}
          />
          <Tools 
            tools={MOCK_TOOLS}
            enabledTools={enabledTools}
            onToggleTool={handleToggleTool}
            onRunTool={handleRunTool}
            runningTasks={runningTasks}
          />
        </div>
      </div>

      {/* Initial Domain Input Modal */}
      {showInitialModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: "#31363F",
            padding: "40px",
            borderRadius: "8px",
            border: "2px solid #76ABAE",
            minWidth: "450px"
          }}>
            <h2 style={{ color: "#76ABAE", marginBottom: "10px", fontSize: "24px" }}>
              🎯 Welcome to Cyber Recon
            </h2>
            <p style={{ color: "#EEEEEE", marginBottom: "25px", opacity: 0.8 }}>
              Enter a domain to start reconnaissance
            </p>
            
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
              Start Recon
            </button>
          </div>
        </div>
      )}

      {/* Domain Selection Modal */}
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
            minWidth: "400px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ color: "#76ABAE", margin: 0 }}>Select Domain</h2>
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
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {MOCK_DOMAINS.map(domain => (
                <div
                  key={domain.id}
                  onClick={() => handleSelectDomain(domain)}
                  style={{
                    padding: "15px",
                    backgroundColor: selectedDomain.id === domain.id ? "#76ABAE" : "#222831",
                    color: selectedDomain.id === domain.id ? "#222831" : "#EEEEEE",
                    border: "1px solid #76ABAE",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    {domain.name}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    Status: {domain.status}
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#76ABAE",
                color: "#222831",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              + Add New Domain
            </button>
          </div>
        </div>
      )}
    </>
  )
}