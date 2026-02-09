import { useState, useCallback, useEffect, useRef } from "react"
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
  const [saveStatus, setSaveStatus] = useState("saved") // "saved", "saving", "unsaved"
  
  // Ref to track running tasks for cleanup without triggering re-renders
  const runningTasksRef = useRef({})

  // Graph handlers
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setSaveStatus("unsaved");
    },
    []
  )

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      setSaveStatus("unsaved");
    },
    []
  )

  const saveToDatabase = useCallback(async (currentNodes, currentEdges) => {
    if (!projectId) return;
    try {
      setSaveStatus("saving");
      
      // Helper to check if value is a React element
      const isReactElement = (obj) => {
        return obj && typeof obj === 'object' && 
               (obj.$$typeof || (obj.type && obj.props && (obj._owner !== undefined || obj._store !== undefined)));
      };
      
      // Clean nodes before saving - remove React elements and keep only serializable data
      const cleanNodes = currentNodes.map(node => {
        const cleanNode = { 
          id: node.id,
          type: node.type,
          position: node.position,
          style: node.style,
          width: node.width,
          height: node.height,
          selected: node.selected,
          dragging: node.dragging,
          data: {}
        };
        
        // Handle node data
        if (node.data) {
          // Copy all properties except React elements
          Object.keys(node.data).forEach(key => {
            const value = node.data[key];
            
            // Skip React elements
            if (isReactElement(value)) {
              return;
            }
            
            // Skip functions
            if (typeof value === 'function') {
              return;
            }
            
            // Copy everything else (primitives, arrays, plain objects)
            cleanNode.data[key] = value;
          });
          
          // For domain nodes, ensure we have the essential data
          if (node.id.startsWith('domain-')) {
            cleanNode.data.domainId = node.data.domainId;
            cleanNode.data.domainName = node.data.domainName;
            cleanNode.data.label = `🎯 ${node.data.domainName}`;
          }
        }
        
        return cleanNode;
      });
      
      await api.put(`/projects/update/${projectId}`, {
        nodes: cleanNodes,
        edges: currentEdges,
        lastModified: new Date().toISOString()
      });
      console.log("DATABASE_SYNCHRONIZED");
      setSaveStatus("saved");
    } catch (error) {
      console.error("AUTO_SAVE_ERROR:", error);
      setSaveStatus("unsaved");
      showError("Failed to save project");
    }
  }, [projectId, showError]);

  // Handle clicking on a subdomain to add it as a new domain node
  const handleSubdomainClick = useCallback((subdomain) => {
    // Check if this subdomain already exists as a domain
    const existingDomain = domains.find(d => d.name === subdomain)
    if (existingDomain) {
      showInfo(`${subdomain} already exists as a domain`)
      return
    }

    const newDomainId = Date.now()
    const domainNodeId = `domain-${newDomainId}`
    const yPosition = domains.length * 200

    // Create new domain node
    const newNode = {
      id: domainNodeId,
      type: "input",
      data: {
        label: `🎯 ${subdomain}`,
        domainId: newDomainId,
        domainName: subdomain
      },
      position: { x: NODE_POSITIONS.DOMAIN.x, y: yPosition },
      style: NODE_STYLES.DOMAIN,
    }

    // Update domains list
    setDomains(prev => [...prev, { id: newDomainId, name: subdomain, status: "active" }])

    // Update nodes and save
    setNodes(prev => {
      const updatedNodes = [...prev, newNode]
      saveToDatabase(updatedNodes, edges)
      return updatedNodes
    })

    showInfo(`Added ${subdomain} as a new domain`)
  }, [domains, edges, saveToDatabase, showInfo])

  // ----
  useEffect(() => {
    const loadProjectData = async () => {
      // ✅ เช็คให้ชัวร์ว่ามี projectId ก่อนเรียก API
      if (!projectId) return;

      try {
        // Use authenticated endpoint
        const response = await api.get(`/projects/detail/${projectId}`);
        if (response.data) {
          // ถ้ามีข้อมูลใน DB ให้เอามาทับ Mock data
          const { nodes: savedNodes, edges: savedEdges } = response.data;
          
          if (savedNodes) {
            // Clean loaded nodes - ensure labels are strings not React objects
            const cleanedNodes = savedNodes.map(node => {
              const cleanNode = { ...node };
              
              // Handle domainId if it's a MongoDB object
              if (cleanNode.data?.domainId && typeof cleanNode.data.domainId === 'object' && cleanNode.data.domainId.$numberLong) {
                cleanNode.data.domainId = parseInt(cleanNode.data.domainId.$numberLong);
              }
              
              // Reconstruct labels based on node type
              if (cleanNode.data) {
                // For domain nodes
                if (cleanNode.id.startsWith('domain-') && cleanNode.data.domainName) {
                  cleanNode.data.label = `🎯 ${cleanNode.data.domainName}`;
                }
                // For subdomain result nodes
                else if (cleanNode.data.toolType === 'subdomain') {
                  const subdomains = cleanNode.data.subdomains || [];
                  cleanNode.data.label = (
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
                              <th style={{ padding: "4px", textAlign: "left", color: "#76ABAE", fontWeight: "bold" }}>
                                Subdomain (click to add)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {subdomains.map((subdomain, i) => (
                              <tr 
                                key={i} 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSubdomainClick(subdomain)
                                }}
                                style={{ 
                                  borderBottom: "1px solid #31363F",
                                  cursor: "pointer",
                                  transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#31363F"
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent"
                                }}
                              >
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
                  );
                }
                // For pathfinder result nodes
                else if (cleanNode.data.toolType === 'pathfinder') {
                  if (cleanNode.data.isError) {
                    cleanNode.data.label = (
                      <div style={{ textAlign: "left", fontSize: "11px" }}>
                        <b style={{ color: "#76ABAE" }}>Pathfinder Error</b>
                        <div style={{ color: "#ff5555", fontSize: "10px", marginTop: "6px", wordBreak: "break-word" }}>
                          {cleanNode.data.errorMessage || 'Unknown error'}
                        </div>
                      </div>
                    );
                  } else {
                    const paths = cleanNode.data.paths || [];
                    cleanNode.data.label = (
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
                    );
                  }
                }
                // For nmap result nodes
                else if (cleanNode.data.toolType === 'nmap') {
                  if (cleanNode.data.isError) {
                    cleanNode.data.label = (
                      <div style={{ textAlign: "left", fontSize: "11px" }}>
                        <b style={{ color: "#76ABAE" }}>Nmap Scan</b>
                        <div style={{ color: "#ff5555" }}>Error: Invalid command</div>
                        <div style={{ color: "#EEEEEE", fontSize: "10px" }}>Check configuration</div>
                      </div>
                    );
                  } else {
                    const openPorts = cleanNode.data.openPorts || [];
                    cleanNode.data.label = (
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
                    );
                  }
                }
                // If label is still a serialized React object (old format), clean it
                else if (cleanNode.data.label && typeof cleanNode.data.label === 'object' && (cleanNode.data.label.type || cleanNode.data.label.props || cleanNode.data.label._owner)) {
                  cleanNode.data.label = 'Result Node';
                }
              }
              
              return cleanNode;
            });
            
            setNodes(cleanedNodes);
            
            // Extract domain nodes and populate domains list
            const domainNodes = cleanedNodes.filter(node => node.id.startsWith('domain-'));
            const extractedDomains = domainNodes.map(node => {
              const domainId = node.data?.domainId || parseInt(node.id.replace('domain-', ''));
              return {
                id: domainId,
                name: node.data?.domainName || node.data?.label?.replace('🎯 ', '') || 'Unknown',
                status: 'active'
              };
            });
            
            if (extractedDomains.length > 0) {
              setDomains(extractedDomains);
              console.log(`Loaded ${extractedDomains.length} domains from project`);
            }
          }
          
          if (savedEdges) setEdges(savedEdges);
        }
      } catch (error) {
        // ถ้าหาไม่เจอ (404/403) หรือ Error อื่นๆ ให้ใช้ Mock data เดิม
        console.warn("PROJECT_NOT_FOUND_OR_UNAUTHORIZED, USING_LOCAL_STATE");
      }
    };

    loadProjectData();
  }, [projectId]);

  // Handle browser close/refresh - warn and cancel tasks
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const activeTasks = Object.entries(runningTasksRef.current).filter(
        ([_, task]) => task.status === UI_TASK_STATUS.RUNNING && task.taskId
      )

      if (activeTasks.length > 0) {
        // Cancel all running tasks
        activeTasks.forEach(async ([_, task]) => {
          try {
            await api.get(`/commands/${task.taskId}/cancel`)
          } catch (error) {
            console.error(`Failed to cancel task on unload:`, error)
          }
        })

        // Show browser warning
        e.preventDefault()
        e.returnValue = 'You have running tasks. They will be cancelled if you leave.'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, []) // Empty dependency - uses ref which always has latest value

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
          } else if (status === TASK_STATUS.REVOKED) {
            setRunningTasks(prev => ({
              ...prev,
              [toolId]: { ...prev[toolId], status: UI_TASK_STATUS.FAILED, error: result }
            }))
            showError('Worker Task Revoked', `The worker task for ${toolId} was revoked. This usually means the worker failed or was terminated. Please try again.`)
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

  // Keep ref in sync with state
  useEffect(() => {
    runningTasksRef.current = runningTasks
  }, [runningTasks])

  // Cleanup: Cancel all running tasks ONLY when component unmounts
  useEffect(() => {
    // Cleanup function called when component unmounts
    return () => {
      const cancelAllRunningTasks = async () => {
        const activeTasks = Object.entries(runningTasksRef.current).filter(
          ([_, task]) => task.status === UI_TASK_STATUS.RUNNING && task.taskId
        )

        if (activeTasks.length === 0) return

        console.log(`Component unmounting: Cancelling ${activeTasks.length} running tasks...`)

        // Cancel all tasks in parallel
        const cancelPromises = activeTasks.map(async ([toolId, task]) => {
          try {
            await api.get(`/commands/${task.taskId}/cancel`)
            console.log(`Task ${task.taskId} (${toolId}) cancelled on unmount`)
          } catch (error) {
            console.error(`Failed to cancel task ${task.taskId}:`, error)
          }
        })

        await Promise.all(cancelPromises)
      }
      
      cancelAllRunningTasks()
    }
  }, []) // Empty dependency array - only runs on mount/unmount

  // Update graph nodes with scan results
  const updateNodesWithResults = useCallback((toolId, result, onSubdomainClick) => {
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
            toolType: 'nmap',
            isError: true,
            rawResult: result,
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
            toolType: 'nmap',
            openPorts: openPorts,
            rawResult: result,
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
          toolType: 'subdomain',
          subdomains: subdomains,
          rawResult: result,
          onSubdomainClick: handleSubdomainClick,
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
                      <th style={{ padding: "4px", textAlign: "left", color: "#76ABAE", fontWeight: "bold" }}>
                        Subdomain (click to add)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subdomains.map((subdomain, i) => (
                      <tr 
                        key={i} 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubdomainClick(subdomain)
                        }}
                        style={{ 
                          borderBottom: "1px solid #31363F",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#31363F"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                      >
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
            toolType: 'pathfinder',
            isError: true,
            errorMessage: result.error,
            rawResult: result,
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
            toolType: 'pathfinder',
            paths: paths,
            rawResult: result,
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

  // Manual save project
  const handleSaveProject = useCallback(async () => {
    await saveToDatabase(nodes, edges);
    showInfo("Project saved successfully");
  }, [nodes, edges, saveToDatabase, showInfo]);

  // Delete node handler
  const handleDeleteNode = useCallback((nodeId) => {
    // Find all edges connected to this node
    const connectedEdges = edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    )
    
    // Remove the node and its connected edges
    setNodes(prev => {
      const updatedNodes = prev.filter(n => n.id !== nodeId)
      
      // If it's a domain node, also remove it from domains list
      if (nodeId.startsWith('domain-')) {
        const node = prev.find(n => n.id === nodeId)
        if (node?.data?.domainId) {
          setDomains(prevDomains => prevDomains.filter(d => d.id !== node.data.domainId))
          
          // If this was the selected domain, clear selection
          if (selectedDomain?.id === node.data.domainId) {
            setSelectedDomain(null)
            setScanResults(null)
          }
        }
      }
      
      // Save to database with updated nodes and edges
      const updatedEdges = edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      )
      setEdges(updatedEdges)
      saveToDatabase(updatedNodes, updatedEdges)
      
      return updatedNodes
    })
    
    showInfo("Node deleted successfully")
  }, [nodes, edges, selectedDomain, saveToDatabase, showInfo])

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
    saveStatus,

    // Setters
    setShowDomainModal,
    setNewDomainInput,

    // Graph handlers
    onNodesChange,
    onEdgesChange,
    handleNodeClick,
    handleSubdomainClick,
    handleDeleteNode,

    // Domain handlers
    handleAddDomain,
    handleSelectDomain,

    // Tool handlers
    handleToggleTool,
    handleRunTool,
    handleCancelTask,
    
    // Save handler
    handleSaveProject,
  }
}