"use client"
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges 
} from "reactflow"
import "reactflow/dist/style.css"

// ข้อมูลตั้งต้น
const initialNodes = [
  {
    id: "1",
    data: { label: "target.com" },
    position: { x: 100, y: 100 },
    style: { background: "#76ABAE", color: "#222831", border: "none", fontWeight: "bold" }
  },
  {
    id: "2",
    data: {
      label: (
        <div style={{ textAlign: 'left', fontSize: '11px' }}>
          <div style={{ color: '#ff5555' }}>/admin 403</div>
          <div style={{ color: '#50fa7b' }}>/api 200</div>
        </div>
      ),
    },
    position: { x: 350, y: 80 },
    style: { background: "#31363F", color: "#EEEEEE", border: "1px solid #76ABAE" }
  },
]

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#76ABAE" } }
]

export default function Canvas() {
  // สร้าง State เพื่อเก็บ Nodes และ Edges
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // ฟังก์ชันจัดการเมื่อมีการขยับ Node (ลากวาง)
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงเส้น Edge (ถ้ามี)
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ flex: 1, height: "100%", background: "#222831" }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} // เพิ่มส่วนนี้เพื่อให้ลากได้
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background color="#31363F" gap={20} />
        <Controls style={{ background: "#31363F", fill: "#EEEEEE", border: "1px solid #76ABAE" }} />
      </ReactFlow>
    </div>
  )
}