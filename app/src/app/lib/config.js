export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1',
  pollInterval: 2000,
}

export const TASK_STATUS = {
  PENDING: 'PENDING',
  STARTED: 'STARTED',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  RETRY: 'RETRY',
  REVOKED: 'REVOKED',
}

export const UI_TASK_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
}

export const TOOL_IDS = {
  SUBDOMAIN: 'subdomain',
  NMAP: 'nmap',
  PATHFINDER: 'pathfinder',
  PORTSCAN: 'portscan',
}

export const NODE_POSITIONS = {
  DOMAIN: { x: 400, y: 50 },
  SUBDOMAIN: { x: 50, y: 200 },
  NMAP: { x: 550, y: 200 },
  PATHFINDER: { x: 300, y: 350 },
}

// Graph Styles
export const NODE_STYLES = {
  DOMAIN: {
    background: "#76ABAE",
    color: "#222831",
    border: "none",
    fontWeight: "bold",
    width: 180,
  },
  RESULT: {
    background: "#31363F",
    color: "#EEEEEE",
    border: "1px solid #76ABAE",
    width: 180,
  },
  ERROR: {
    background: "#31363F",
    color: "#EEEEEE",
    border: "1px solid #ff5555",
    width: 180,
  },
}

export const EDGE_STYLES = {
  DEFAULT: { stroke: "#76ABAE" },
  ERROR: { stroke: "#ff5555" },
  SUCCESS: { stroke: "#50fa7b" },
}
