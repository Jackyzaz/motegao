import { useState, useCallback, useEffect } from "react"
import { applyEdgeChanges, applyNodeChanges } from "reactflow"
import api from "@/app/lib/axios"
import { 
  TASK_STATUS, 
  UI_TASK_STATUS, 
  TOOL_IDS, 
  NODE_POSITIONS, 
  NODE_STYLES,
  EDGE_STYLES,
  API_CONFIG
} from "@/app/lib/config"

export const useMotegaoController = () => {
  // State management
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [showInitialModal, setShowInitialModal] = useState(true)
  const [newDomainInput, setNewDomainInput] = useState("")
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [enabledTools, setEnabledTools] = useState(["subdomain", "nmap"])
  const [scanResults, setScanResults] = useState(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [runningTasks, setRunningTasks] = useState({})

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
    const activeTasks = Object.entries(runningTasks).filter(
      ([_, task]) => task.status === UI_TASK_STATUS.RUNNING
    )
    
    if (activeTasks.length === 0) return

    const interval = setInterval(async () => {
      for (const [toolId, task] of activeTasks) {
        try {
          const response = await api.get(`/commands/result/${task.taskId}`)
          const { status, result } = response.data

          if (status === TASK_STATUS.SUCCESS) {
            setRunningTasks(prev => ({
              ...prev,
              [toolId]: { ...prev[toolId], status: UI_TASK_STATUS.COMPLETED, result }
            }))
            
            updateNodesWithResults(toolId, result)
          } else if (status === TASK_STATUS.FAILURE) {
            setRunningTasks(prev => ({
              ...prev,
              [toolId]: { ...prev[toolId], status: UI_TASK_STATUS.FAILED, error: result }
            }))
          }
        } catch (error) {
          console.error(`Error polling task ${task.taskId}:`, error)
        }
      }
    }, API_CONFIG.pollInterval)

    return () => clearInterval(interval)
  }, [runningTasks])

  // Update graph nodes with scan results
  const updateNodesWithResults = useCallback((toolId, result) => {
    console.log(`Results for ${toolId}:`, result)
    
    setScanResults({
      tool: toolId,
      result,
      timestamp: new Date().toISOString()
    })

    let newNode = null
    let newEdge = null

    if (toolId === TOOL_IDS.NMAP) {
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
          position: NODE_POSITIONS.NMAP,
          style: NODE_STYLES.ERROR,
        }
      } else {
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
          position: NODE_POSITIONS.NMAP,
          style: { ...NODE_STYLES.RESULT, width: 200 },
        }
      }

      newEdge = {
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId,
        animated: true,
        style: isError ? EDGE_STYLES.ERROR : EDGE_STYLES.DEFAULT
      }
    } else if (toolId === TOOL_IDS.SUBDOMAIN) {
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
        position: NODE_POSITIONS.SUBDOMAIN,
        style: NODE_STYLES.RESULT,
      }

      newEdge = {
        id: `e1-${nodeId}`,
        source: "1",
        target: nodeId,
        animated: true,
        style: EDGE_STYLES.DEFAULT
      }
    }

    if (newNode) {
      setNodes(prev => [...prev, newNode])
    }
    if (newEdge) {
      setEdges(prev => [...prev, newEdge])
    }
  }, [])

  // Domain handlers
  const handleAddDomain = useCallback(() => {
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
        position: NODE_POSITIONS.DOMAIN,
        style: NODE_STYLES.DOMAIN,
      }
    ])
    setEdges([])
  }, [newDomainInput])

  const handleSelectDomain = useCallback((domain) => {
    setSelectedDomain(domain)
    setShowDomainModal(false)
    setScanResults(null)
    
    setNodes(nds => nds.map(node => 
      node.id === "1" 
        ? { ...node, data: { label: `🎯 ${domain.name}` } }
        : node
    ))
  }, [])

  // Tool handlers
  const handleToggleTool = useCallback((toolId) => {
    setEnabledTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }, [])

  const handleRunTool = useCallback(async (toolId, config) => {
    if (!selectedDomain) {
      alert("Please select a domain first")
      return
    }

    console.log(`Running ${toolId} with config:`, config)
    
    setRunningTasks(prev => ({
      ...prev,
      [toolId]: { status: UI_TASK_STATUS.RUNNING, taskId: null }
    }))

    try {
      let response
      
      switch (toolId) {
        case TOOL_IDS.SUBDOMAIN:
          response = await api.post("/commands/subdomain_dns_enum", {
            domain: selectedDomain.name,
            threads: 10,
            wordlist: config.wordlist || "top1000"
          })
          break
          
        case TOOL_IDS.NMAP:
          response = await api.post("/commands/nmap", {
            host: selectedDomain.name,
            timing_template: 4,
            options: ["-sV"],
            all_ports: false,
            ports_specific: [80, 443, 8080, 8443]
          })
          break
          
        case TOOL_IDS.PATHFINDER:
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

      if (response.data.task_id) {
        setRunningTasks(prev => ({
          ...prev,
          [toolId]: { status: UI_TASK_STATUS.RUNNING, taskId: response.data.task_id }
        }))
      }
      
    } catch (error) {
      console.error(`Error running ${toolId}:`, error)
      setRunningTasks(prev => ({
        ...prev,
        [toolId]: { status: UI_TASK_STATUS.FAILED, error: error.message }
      }))
      alert(`Failed to run ${toolId}: ${error.message}`)
    }
  }, [selectedDomain])

  return {
    // State
    showDomainModal,
    showInitialModal,
    newDomainInput,
    selectedDomain,
    enabledTools,
    scanResults,
    nodes,
    edges,
    runningTasks,
    
    // Setters
    setShowDomainModal,
    setNewDomainInput,
    
    // Graph handlers
    onNodesChange,
    onEdgesChange,
    
    // Domain handlers
    handleAddDomain,
    handleSelectDomain,
    
    // Tool handlers
    handleToggleTool,
    handleRunTool,
  }
}
