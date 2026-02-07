import { useState } from "react"
import { UI_TASK_STATUS } from "@/app/lib/config"

const WORDLIST_SUDOMAINS = [
  { id: "subdomains-5000", name: "subdomains-top1million-5000.txt" },
  { id: "subdomains-20000", name: "subdomains-top1million-20000.txt" },
  { id: "subdomains-110000", name: "subdomains-top1million-110000.txt" },
]

const WORDLIST_DIRECTORIES = [
  { id: "dirb-1", name: "dirb-small.txt" },
  { id: "dirb-2", name: "dirb-common.txt" },
  { id: "dirb-3", name: "dirb-big.txt" },
  { id: "dirb-4", name: "dirbuster-medium.txt" },
  { id: "dirb-5", name: "dirbuster-big.txt" },
]

export default function Tools({ 
  tools, 
  enabledTools, 
  onToggleTool, 
  onRunTool, 
  runningTasks = {},
  domains = [],
  selectedDomain = null,
  onSelectDomain,
  onOpenAddDomainModal
}) {
  return (
    <div style={{ 
      width: 300, 
      background: "#31363F", 
      padding: 20, 
      display: "flex", 
      flexDirection: "column", 
      gap: 16,
      borderLeft: "1px solid #222831",
      overflowY: "auto"
    }}>
      {/* Domains Section */}
      <div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 12 
        }}>
          <h2 style={{ color: "#76ABAE", fontSize: "1.2rem", margin: 0 }}>Domains</h2>
          <button
            onClick={onOpenAddDomainModal}
            style={{
              background: "#76ABAE",
              color: "#222831",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            + Add
          </button>
        </div>

        {/* Domain List */}
        {domains.length === 0 ? (
          <div style={{
            padding: "20px",
            textAlign: "center",
            color: "#76ABAE",
            fontSize: "12px",
            opacity: 0.6,
            background: "#222831",
            borderRadius: "4px"
          }}>
            No domains yet.<br/>Click "+ Add" to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {domains.map(domain => (
              <div
                key={domain.id}
                onClick={() => onSelectDomain(domain)}
                style={{
                  padding: "12px",
                  backgroundColor: selectedDomain?.id === domain.id ? "#76ABAE" : "#222831",
                  color: selectedDomain?.id === domain.id ? "#222831" : "#EEEEEE",
                  border: `1px solid ${selectedDomain?.id === domain.id ? "#76ABAE" : "#31363F"}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "13px",
                  fontWeight: selectedDomain?.id === domain.id ? "bold" : "normal"
                }}
              >
                🎯 {domain.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        height: "1px", 
        background: "#222831", 
        margin: "8px 0" 
      }}></div>

      {/* Tools Section */}
      <h2 style={{ color: "#76ABAE", fontSize: "1.2rem", marginBottom: 8 }}>Tools</h2>
      
      {/* No domain selected warning */}
      {!selectedDomain && domains.length > 0 && (
        <div style={{
          padding: "15px",
          background: "#222831",
          border: "1px solid #f39c12",
          borderRadius: "4px",
          marginBottom: "12px",
          fontSize: "12px",
          color: "#f39c12",
          textAlign: "center"
        }}>
          ⚠️ Click a domain node on the canvas to activate tools
        </div>
      )}
      
      {tools?.map(tool => (
        <ToolBox 
          key={tool.id}
          tool={tool}
          isEnabled={enabledTools.includes(tool.id)}
          onToggle={() => onToggleTool(tool.id)}
          onRun={(config) => onRunTool(tool.id, config)}
          taskStatus={runningTasks[tool.id]}
          disabled={!selectedDomain}
        />
      ))}
    </div>
  )
}

function ToolBox({ tool, isEnabled, onToggle, onRun, taskStatus, disabled = false }) {
  const wordlistOptions = tool.id === "subdomain" ? WORDLIST_SUDOMAINS : WORDLIST_DIRECTORIES

  const [selectedWordlist, setSelectedWordlist] = useState(wordlistOptions[0]?.id || null)
  const isRunning = taskStatus?.status === UI_TASK_STATUS.RUNNING
  const isCompleted = taskStatus?.status === UI_TASK_STATUS.COMPLETED
  const isFailed = taskStatus?.status === UI_TASK_STATUS.FAILED

  const handleRun = () => {
    if (!isEnabled || isRunning || disabled) return
    onRun({ wordlist: selectedWordlist })
  }

  const handleCancel = () => {
    if (!isRunning) return
    // onCancel() // Implement cancel logic if needed
  }

  const getButtonText = () => {
    if (isRunning) return "Running..."
    if (isCompleted) return "✓ Completed"
    if (isFailed) return "✗ Failed"
    return "Run Tool"
  }

  const getButtonColor = () => {
    if (!isEnabled) return "#444"
    if (isCompleted) return "#50fa7b"
    if (isFailed) return "#ff5555"
    return "#76ABAE"
  }

  return (
    <div style={{ 
      background: "#222831", 
      padding: "15px", 
      borderRadius: 8, 
      border: `1px solid ${isEnabled && !disabled ? "#76ABAE" : "#31363F"}`,
      opacity: (isEnabled && !disabled) ? 1 : 0.5,
      transition: "all 0.2s"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 12 
      }}>
        <h3 style={{ 
          margin: 0, 
          color: "#EEEEEE", 
          textTransform: "capitalize",
          fontSize: "14px"
        }}>
          {tool.name}
        </h3>
        <label style={{ 
          display: "flex", 
          alignItems: "center", 
          cursor: "pointer",
          gap: "5px"
        }}>
          <input 
            type="checkbox" 
            checked={isEnabled}
            onChange={onToggle}
            style={{ cursor: "pointer" }}
          />
          <span style={{ fontSize: "11px", color: "#76ABAE" }}>Enable</span>
        </label>
      </div>

      <select 
        value={selectedWordlist}
        onChange={(e) => setSelectedWordlist(e.target.value)}
        disabled={!isEnabled || isRunning || disabled}
        style={{ 
          width: "100%", 
          marginBottom: 12, 
          background: "#31363F", 
          color: "#EEEEEE", 
          border: "1px solid #76ABAE",
          padding: "6px",
          borderRadius: "4px",
          cursor: (isEnabled && !isRunning && !disabled) ? "pointer" : "not-allowed"
        }}
      >
        {wordlistOptions.map(wordlist => (
          <option key={wordlist.id} value={wordlist.id}>
            {wordlist.name}
          </option>
        ))}
      </select>

      <button 
        onClick={handleRun}
        disabled={!isEnabled || isRunning || disabled}
        style={{ 
          width: "100%",
          background: getButtonColor(), 
          color: (isEnabled && !disabled) ? "#222831" : "#666", 
          border: "none", 
          padding: "8px", 
          borderRadius: 4, 
          fontWeight: "bold",
          cursor: (isEnabled && !isRunning && !disabled) ? "pointer" : "not-allowed",
          transition: "all 0.2s"
        }}
      >
        {getButtonText()}
      </button>

      <button 
        onClick={handleRun}
        disabled={!isEnabled || isRunning || disabled}
        style={{ 
          marginTop: "8px",
          width: "100%",
          background: "#ff5555", 
          display: isRunning ? "block" : "none",
          border: "none", 
          padding: "8px", 
          borderRadius: 4, 
          fontWeight: "bold",
          transition: "all 0.2s"
        }}
      >
        Cancel
      </button>

      {/* Show task info */}
      {taskStatus && (
        <div style={{
          marginTop: "10px",
          fontSize: "11px",
          color: "#76ABAE",
          opacity: 0.8
        }}>
          {isRunning && `Progress: ${taskStatus.progress || 0}% `}
          {isRunning && `Task ID: ${taskStatus.taskId?.substring(0, 8)}...`}
          {isFailed && `Error: ${taskStatus.error}`}
        </div>
      )}
    </div>
  )
}