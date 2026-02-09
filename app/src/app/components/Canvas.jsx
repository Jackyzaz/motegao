"use client"

import React, { memo } from "react"
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"

// Simple custom node that just adds a close button
const NodeWithClose = memo(({ data, id }) => {
  return (
    <>
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onDelete(id)
          }}
          style={{
            position: 'absolute',
            top: '-9px',
            right: '-9px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ff5555',
            border: '2px solid #222831',
            color: '#222831',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          ×
        </button>
      )}
      {data.label}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  )
})

NodeWithClose.displayName = 'NodeWithClose'

const nodeTypes = {
  input: NodeWithClose,
  default: NodeWithClose,
}

export default function Canvas({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onNodeClick, 
  onDeleteNode,
  scanResults 
}) {
  // Inject the delete handler into all nodes
  const nodesWithDeleteHandler = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: onDeleteNode,
    }
  }))

  return (
    <div style={{ flex: 1, height: "100%", background: "#222831", position: "relative" }}>
      {scanResults && (
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          background: "#31363F",
          border: "1px solid #76ABAE",
          padding: "10px 15px",
          borderRadius: "4px",
          color: "#EEEEEE",
          fontSize: "12px"
        }}>
          <div style={{ color: "#76ABAE", fontWeight: "bold" }}>Last Scan:</div>
          <div>{scanResults.tool} - {new Date(scanResults.timestamp).toLocaleTimeString()}</div>
        </div>
      )}

      <style jsx global>{`
        .react-flow__controls button svg {
          fill: #000000;
        }

        .react-flow__controls button:hover svg {
          fill: #000000;
        }
      `}</style>

      <ReactFlow
        nodes={nodesWithDeleteHandler}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#31363F" gap={20} variant="dots" />
        <Controls
          style={{
            background: "#31363F",
            border: "1px solid #76ABAE",
          }}
        />
      </ReactFlow>
    </div>
  )
}