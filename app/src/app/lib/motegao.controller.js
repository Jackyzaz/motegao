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

export const useMotegaoController = (projectId) => {
  const { showError, showInfo } = useModal()
  // State management
  const [domains, setDomains] = useState([]) // Array of all domains
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [newDomainInput, setNewDomainInput] = useState("")
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [enabledTools, setEnabledTools] = useState(["subdomain", "nmap", "pathfinder"])
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

  // ----
  useEffect(() => {
    const loadProjectData = async () => {
      // ✅ เช็คให้ชัวร์ว่ามี projectId ก่อนเรียก API
      if (!projectId) return;

      try {
        const response = await api.get(`/projects/detail/${projectId}`);
        if (response.data) {
          // ถ้ามีข้อมูลใน DB ให้เอามาทับ Mock data
          const { nodes: savedNodes, edges: savedEdges } = response.data;
          if (savedNodes) setNodes(savedNodes);
          if (savedEdges) setEdges(savedEdges);
        }
      } catch (error) {
        // ถ้าหาไม่เจอ (404) หรือ Error อื่นๆ ให้ใช้ Mock data เดิม
        console.warn("PROJECT_NOT_FOUND_IN_DB, USING_LOCAL_STATE");
      }
    };

    loadProjectData();
  }, [projectId]);

  const saveToDatabase = useCallback(async (currentNodes, currentEdges) => {
    if (!projectId) return;
    try {
      await api.put(`/projects/update/${projectId}`, {
        nodes: currentNodes,
        edges: currentEdges,
        lastModified: new Date().toLocaleDateString()
      });
      console.log("DATABASE_SYNCHRONIZED");
    } catch (error) {
      console.error("AUTO_SAVE_ERROR:", error);
    }
  }, [projectId]);

  // Poll for task results
  useEffect(() => {
    const activeTasks = Object.entries(runningTasks).filter(
      ([_, task]) => task.status === UI_TASK_STATUS.RUNNING
    )

    if (activeTasks.length === 0) return

    const interval = setInterval(async () => {
      for (const [toolId, task] of activeTasks) {
        try {
          const response = await api.get(`/commands/${task.taskId}/result`)
          const { status, result } = response.data

          if (status == "PROGRESS") {
            setRunningTasks(prev => ({
              ...prev,
              [toolId]: { ...prev[toolId], status: UI_TASK_STATUS.RUNNING, progress: (result && result.progress) || 0 }
            }))
          } else if (status === TASK_STATUS.SUCCESS) {
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
      const subdomains = result.subdomains && Array.isArray(result.subdomains) ? result.subdomains : (Array.isArray(result) ? result : [])

      newNode = {
        id: nodeId,
        data: {
          label: (
            <div style={{ textAlign: "left", fontSize: "11px" }}>
              <b style={{ color: "#76ABAE", display: "block", marginBottom: "8px" }}>Subdomains Found ({subdomains.length})</b>
              {subdomains.length > 0 ? (
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "10px",
                  color: "#EEEEEE"
                }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #76ABAE" }}>
                      <th style={{ padding: "4px", textAlign: "left", color: "#76ABAE", fontWeight: "bold" }}>Subdomain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subdomains.map((subdomain, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #31363F" }}>
                        <td style={{ padding: "4px", textAlign: "left", color: "#50fa7b", wordBreak: "break-word" }}>
                          {subdomain}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: "#EEEEEE" }}>No subdomains found</div>
              )}
            </div>
          ),
        },
        position: NODE_POSITIONS.SUBDOMAIN,
        style: { ...NODE_STYLES.RESULT, width: 280 },
      }

      const domainNodeId = selectedDomain ? `domain-${selectedDomain.id}` : "1"
      newEdge = {
        id: `e-${domainNodeId}-${nodeId}`,
        source: domainNodeId,
        target: nodeId,
        animated: true,
        style: EDGE_STYLES.DEFAULT
      }
    } else if (toolId === TOOL_IDS.PATHFINDER) {
      const nodeId = `pathfinder-${Date.now()}`
      const isError = result.error && typeof result.error === "string"
      const paths = !isError && result.paths && Array.isArray(result.paths) ? result.paths : []

      if (isError) {
        newNode = {
          id: nodeId,
          data: {
            label: (
              <div style={{ textAlign: "left", fontSize: "11px" }}>
                <b style={{ color: "#76ABAE" }}>Pathfinder Error</b>
                <div style={{ color: "#ff5555", fontSize: "10px", marginTop: "6px", wordBreak: "break-word" }}>
                  {result.error}
                </div>
              </div>
            ),
          },
          position: NODE_POSITIONS.SUBDOMAIN,
          style: NODE_STYLES.ERROR,
        }
      } else {
        newNode = {
          id: nodeId,
          data: {
            label: (
              <div style={{ textAlign: "left", fontSize: "11px" }}>
                <b style={{ color: "#76ABAE", display: "block", marginBottom: "8px" }}>Paths Found ({paths.length})</b>
                {paths.length > 0 ? (
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10px",
                    color: "#EEEEEE"
                  }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #76ABAE" }}>
                        <th style={{ padding: "4px", textAlign: "left", color: "#76ABAE", fontWeight: "bold" }}>Path</th>
                        <th style={{ padding: "4px", textAlign: "center", color: "#76ABAE", fontWeight: "bold" }}>Status</th>
                        <th style={{ padding: "4px", textAlign: "right", color: "#76ABAE", fontWeight: "bold" }}>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paths.map((pathItem, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #31363F" }}>
                          <td style={{ padding: "4px", textAlign: "left", color: "#50fa7b", wordBreak: "break-word" }}>
                            {pathItem.path}
                          </td>
                          <td style={{ padding: "4px", textAlign: "center", color: "#EEEEEE" }}>
                            {pathItem.status_code}
                          </td>
                          <td style={{ padding: "4px", textAlign: "right", color: "#EEEEEE" }}>
                            {pathItem.size}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ color: "#EEEEEE" }}>No paths found</div>
                )}
              </div>
            ),
          },
          position: NODE_POSITIONS.SUBDOMAIN,
          style: { ...NODE_STYLES.RESULT, width: 300 },
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
    if (!newDomainInput.trim()) return;

    const newDomainId = Date.now();
    const domainNodeId = `domain-${newDomainId}`;
    const yPosition = domains.length * 200;

    // 1. สร้าง Object ของ Node ใหม่เตรียมไว้ตัวเดียว
    const newNode = {
      id: domainNodeId,
      type: "input",
      data: {
        label: `🎯 ${newDomainInput.trim()}`,
        domainId: newDomainId,
        domainName: newDomainInput.trim()
      },
      position: { x: NODE_POSITIONS.DOMAIN.x, y: yPosition },
      style: NODE_STYLES.DOMAIN,
    };

    // 2. อัปเดต Domains List
    setDomains(prev => [...prev, { id: newDomainId, name: newDomainInput.trim(), status: "active" }]);

    // 3. อัปเดต Nodes และสั่ง Save ในที่เดียว
    setNodes(prev => {
      const updatedNodes = [...prev, newNode];

      // 🚀 สั่งเซฟลง Database ทันทีโดยใช้ค่าล่าสุดที่เพิ่งรวมเสร็จ
      saveToDatabase(updatedNodes, edges);

      return updatedNodes;
    });

    // 4. ล้างค่า Input และปิด Modal
    setNewDomainInput("");
    setShowDomainModal(false);

  }, [newDomainInput, domains.length, edges, saveToDatabase]); // ✅ ถอด nodes ออกจาก dependency เพื่อลดการรันซ้ำโดยไม่จำเป็น

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

  const handleCancelTask = useCallback(async (toolId) => {
    const task = runningTasks[toolId]
    if (!task || !task.taskId) {
      showError("No running task to cancel", "Cancel Failed")
      return
    }

    try {
      // Cancel the task and get any partial results
      const response = await api.get(`/commands/${task.taskId}/cancel`)
      const { status, result } = response.data
      
      // If we have partial results, update the graph with them
      if (result && (result.subdomains?.length > 0 || result.paths?.length > 0 || result)) {
        if (toolId === TOOL_IDS.SUBDOMAIN || toolId === TOOL_IDS.PATHFINDER) {
          updateNodesWithResults(toolId, result)
        }
        showInfo("Task cancelled. Partial results have been saved.", "Task Cancelled")
      } else {
        showInfo("Task cancelled successfully", "Task Cancelled")
      }

      // Remove task from running tasks
      setRunningTasks(prev => {
        const newTasks = { ...prev }
        delete newTasks[toolId]
        return newTasks
      })
      
    } catch (error) {
      console.error(`Error cancelling task ${task.taskId}:`, error)
      showError(
        `Failed to cancel task: ${error.response?.data?.detail || error.message}`,
        "Cancel Failed"
      )
    }
  }, [runningTasks, showError, showInfo, updateNodesWithResults])

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
            "subdomains-5000": 1,
            "subdomains-20000": 2,
            "subdomains-110000": 3
          }
          
          response = await api.post("/commands/subdomain_dns_enum", {
            domain: selectedDomain.name,
            threads: config.threads || 1,
            wordlist: wordlistMap[config.wordlist] || 1
          })
          break

        case TOOL_IDS.NMAP:
          let nmapPayload = {
            host: selectedDomain.name,
            timing_template: config.timing_template || 3,
            options: ["-sV"]
          }
          
          // Handle all ports flag - backend uses defaults when all_ports is not set
          if (config.all_ports) {
            nmapPayload.all_ports = true
          }
          
          response = await api.post("/commands/nmap", nmapPayload)
          break

        case TOOL_IDS.PATHFINDER:
          // Map wordlist string to integer for backend API
          const pathfinderWordlistMap = {
            "dirb-1": 1,
            "dirb-2": 2,
            "dirb-3": 3,
            "dirb-4": 4,
            "dirb-5": 5
          }
          
          const protocol = config.protocol || "https"
          const pathfinderPayload = {
            url: `${protocol}://${selectedDomain.name}`,
            threads: config.threads || 1,
            wordlist: pathfinderWordlistMap[config.wordlist] || 1
          }
          
          // Add exclude_status if provided
          if (config.exclude_status && config.exclude_status.length > 0) {
            pathfinderPayload.exclude_status = config.exclude_status
          }
          
          response = await api.post("/commands/path_enum", pathfinderPayload)
          break

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
    handleCancelTask,
  }
}
