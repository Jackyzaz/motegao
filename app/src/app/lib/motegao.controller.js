import { useState, useCallback, useEffect } from "react"
import { applyEdgeChanges, applyNodeChanges } from "reactflow"
import api from "@/app/lib/axios"
import { useModal } from "@/app/context/ModalContext"
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
  const { showError, showInfo } = useModal()
  // State management
  const [domains, setDomains] = useState([]) // Array of all domains
  const [showDomainModal, setShowDomainModal] = useState(false)
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

      const domainNodeId = selectedDomain ? `domain-${selectedDomain.id}` : "1"
      newEdge = {
        id: `e-${domainNodeId}-${nodeId}`,
        source: domainNodeId,
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

      const domainNodeId = selectedDomain ? `domain-${selectedDomain.id}` : "1"
      newEdge = {
        id: `e-${domainNodeId}-${nodeId}`,
        source: domainNodeId,
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
  }, [selectedDomain])

  // Domain handlers
  const handleAddDomain = useCallback(() => {
    if (!newDomainInput.trim()) return
    
    const newDomain = {
      id: Date.now(),
      name: newDomainInput.trim(),
      status: "active"
    }
    
    // Add domain to domains array
    setDomains(prev => [...prev, newDomain])
    
    // DON'T auto-select - user must click the node
    setNewDomainInput("")
    setShowDomainModal(false)
    
    // Calculate position for new domain node (arrange vertically with spacing)
    const domainNodeId = `domain-${newDomain.id}`
    const yPosition = domains.length * 200 // 200px vertical spacing between domains
    
    // Add domain node to graph
    setNodes(prev => [
      ...prev,
      {
        id: domainNodeId,
        type: "input",
        data: { 
          label: `🎯 ${newDomain.name}`,
          domainId: newDomain.id, // Store domain ID in node data
          domainName: newDomain.name
        },
        position: { x: NODE_POSITIONS.DOMAIN.x, y: yPosition },
        style: NODE_STYLES.DOMAIN,
      }
    ])
  }, [newDomainInput, domains.length])

  const handleSelectDomain = useCallback((domain) => {
    setSelectedDomain(domain)
    setScanResults(null)
  }, [])

  // Handle node click - if it's a domain node, select it
  const handleNodeClick = useCallback((event, node) => {
    // Check if this is a domain node
    if (node.id.startsWith('domain-')) {
      const domainId = node.data.domainId
      const domain = domains.find(d => d.id === domainId)
      if (domain) {
        setSelectedDomain(domain)
        setScanResults(null)
        
        // Update node styles to show selection
        setNodes(prev => prev.map(n => {
          if (n.id.startsWith('domain-')) {
            return {
              ...n,
              style: n.id === node.id 
                ? { ...NODE_STYLES.DOMAIN, border: '3px solid #76ABAE', boxShadow: '0 0 10px #76ABAE' }
                : NODE_STYLES.DOMAIN
            }
          }
          return n
        }))
      }
    }
  }, [domains])

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
      showError("Please select a domain first", "No Domain Selected")
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
          // Map wordlist string to integer for backend API
          const wordlistMap = {
            "top1000": 1,
            "top5000": 2,
            "top20000": 3
          }
          response = await api.post("/commands/subdomain_dns_enum", {
            domain: selectedDomain.name,
            threads: 10,
            wordlist: wordlistMap[config.wordlist] || 1
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
          showInfo("Path finder API is not yet implemented. Coming soon!", "Feature Not Available")
          setRunningTasks(prev => {
            const newTasks = { ...prev }
            delete newTasks[toolId]
            return newTasks
          })
          return
          
        default:
          showError(`Tool ${toolId} is not yet implemented`, "Tool Not Available")
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
      showError(
        `Failed to execute ${toolId}: ${error.response?.data?.detail || error.message}`,
        "Execution Failed"
      )
    }
  }, [selectedDomain, showError, showInfo])

  return {
    // State
    domains,
    showDomainModal,
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
    handleNodeClick,
    
    // Domain handlers
    handleAddDomain,
    handleSelectDomain,
    
    // Tool handlers
    handleToggleTool,
    handleRunTool,
  }
}
