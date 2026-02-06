"use client";

import React from "react";
import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

export default function Canvas({ nodes, edges, onNodesChange, onEdgesChange, onNodeClick, scanResults }) {
  return (
    <div style={{ flex: 1, height: "100%", background: "#222831", position: "relative" }}>
      {/* Scan Results Indicator */}
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

      {/* Global style สำหรับ React Flow Controls */}
      <style jsx global>{`
        .react-flow__controls button svg {
          fill: #000000;
        }

        .react-flow__controls button:hover svg {
          fill: #000000;
        }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
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
  );
}
