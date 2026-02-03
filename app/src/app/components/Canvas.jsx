"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "🎯 target.com" },
    position: { x: 300, y: 20 },
    style: {
      background: "#76ABAE",
      color: "#222831",
      border: "none",
      fontWeight: "bold",
      width: 150,
    },
  },
  {
    id: "2",
    data: {
      label: (
        <div style={{ textAlign: "left", fontSize: "11px" }}>
          <b style={{ color: "#76ABAE" }}>Subdomains</b>
          <div style={{ color: "#50fa7b" }}>• mail.target.com</div>
          <div style={{ color: "#50fa7b" }}>• vpn.target.com</div>
          <div style={{ color: "#ffb86c" }}>
            • dev.target.com (Internal)
          </div>
        </div>
      ),
    },
    position: { x: 50, y: 150 },
    style: {
      background: "#31363F",
      color: "#EEEEEE",
      border: "1px solid #76ABAE",
      width: 180,
    },
  },
  {
    id: "3",
    data: {
      label: (
        <div style={{ textAlign: "left", fontSize: "11px" }}>
          <b style={{ color: "#76ABAE" }}>Path Finder</b>
          <div style={{ color: "#ff5555" }}>/admin 403</div>
          <div style={{ color: "#50fa7b" }}>/api/v1 200</div>
          <div style={{ color: "#50fa7b" }}>/login 200</div>
        </div>
      ),
    },
    position: { x: 300, y: 180 },
    style: {
      background: "#31363F",
      color: "#EEEEEE",
      border: "1px solid #76ABAE",
      width: 180,
    },
  },
  {
    id: "4",
    data: {
      label: (
        <div style={{ textAlign: "left", fontSize: "11px" }}>
          <b style={{ color: "#76ABAE" }}>Open Ports</b>
          <div style={{ color: "#50fa7b" }}>80 (HTTP) - Nginx</div>
          <div style={{ color: "#50fa7b" }}>443 (HTTPS) - Nginx</div>
          <div style={{ color: "#ffb86c" }}>8080 (Proxy)</div>
        </div>
      ),
    },
    position: { x: 550, y: 150 },
    style: {
      background: "#31363F",
      color: "#EEEEEE",
      border: "1px solid #76ABAE",
      width: 180,
    },
  },
  {
    id: "5",
    type: "output",
    data: { label: "⚠️ CVE-2024-1234 (SQLi) detected at /api/v1" },
    position: { x: 250, y: 350 },
    style: {
      background: "#ff5555",
      color: "#fff",
      border: "none",
      fontWeight: "bold",
      width: 250,
    },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#76ABAE" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#76ABAE" } },
  { id: "e1-4", source: "1", target: "4", animated: true, style: { stroke: "#76ABAE" } },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    label: "vulnerability found",
    labelStyle: {
      fill: "#ff5555",
      fontSize: 10,
      fontWeight: "bold",
    },
    style: { stroke: "#ff5555", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#ff5555",
    },
  },
];

export default function Canvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ flex: 1, height: "100%", background: "#222831" }}>
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
