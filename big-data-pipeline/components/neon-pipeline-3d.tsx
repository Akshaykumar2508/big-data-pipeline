"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, Box, Cylinder, Html, Environment, OrbitControls, Trail, Float, Sparkles } from "@react-three/drei"
import * as THREE from "three"

interface DataNode {
  id: string
  position: [number, number, number]
  type: "source" | "processor" | "storage"
  status: "active" | "processing" | "complete" | "error"
  label: string
  throughput: number
}

interface DataFlow {
  from: string
  to: string
  active: boolean
  speed: number
}

const NeonMaterial = ({ color, intensity = 1 }: { color: string; intensity?: number }) => {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
}

const DataParticle = ({
  start,
  end,
  speed,
  color,
}: {
  start: [number, number, number]
  end: [number, number, number]
  speed: number
  color: string
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [progress, setProgress] = useState(0)

  useFrame((state, delta) => {
    if (meshRef.current) {
      const newProgress = (progress + delta * speed) % 1
      setProgress(newProgress)

      const x = start[0] + (end[0] - start[0]) * newProgress
      const y = start[1] + (end[1] - start[1]) * newProgress
      const z = start[2] + (end[2] - start[2]) * newProgress

      meshRef.current.position.set(x, y, z)
    }
  })

  return (
    <Trail width={0.1} length={0.5} color={color} attenuation={(t) => t * t}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05]} />
        <NeonMaterial color={color} intensity={2} />
      </mesh>
    </Trail>
  )
}

const PipelineNode = ({
  node,
  onClick,
}: {
  node: DataNode
  onClick: (node: DataNode) => void
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      if (node.status === "processing") {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    }
  })

  const getNodeColor = () => {
    switch (node.status) {
      case "active":
        return "#00ff88"
      case "processing":
        return "#0088ff"
      case "complete":
        return "#ff0088"
      case "error":
        return "#ff4444"
      default:
        return "#888888"
    }
  }

  const getNodeGeometry = () => {
    switch (node.type) {
      case "source":
        return <Sphere args={[0.3]} />
      case "processor":
        return <Box args={[0.5, 0.5, 0.5]} />
      case "storage":
        return <Cylinder args={[0.3, 0.3, 0.6]} />
      default:
        return <Sphere args={[0.3]} />
    }
  }

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={node.position}>
        <mesh
          ref={meshRef}
          onClick={() => onClick(node)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.2 : 1}
        >
          {getNodeGeometry()}
          <NeonMaterial color={getNodeColor()} intensity={hovered ? 2 : 1} />
        </mesh>

        {/* Glow effect */}
        <mesh scale={hovered ? 2 : 1.5}>
          {getNodeGeometry()}
          <meshBasicMaterial color={getNodeColor()} transparent opacity={0.1} />
        </mesh>

        {/* Sparkles for active nodes */}
        {node.status === "processing" && <Sparkles count={20} scale={2} size={2} speed={0.5} color={getNodeColor()} />}

        {/* Node label */}
        <Html position={[0, 0.8, 0]} center>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs border border-cyan-400 backdrop-blur">
            <div className="font-bold text-cyan-400">{node.label}</div>
            <div className="text-green-400">{node.throughput.toLocaleString()}/s</div>
          </div>
        </Html>
      </group>
    </Float>
  )
}

const DataPipeline3D = ({
  nodes,
  flows,
  onNodeClick,
}: {
  nodes: DataNode[]
  flows: DataFlow[]
  onNodeClick: (node: DataNode) => void
}) => {
  return (
    <>
      {/* Render nodes */}
      {nodes.map((node) => (
        <PipelineNode key={node.id} node={node} onClick={onNodeClick} />
      ))}

      {/* Render data flows */}
      {flows.map((flow, index) => {
        const fromNode = nodes.find((n) => n.id === flow.from)
        const toNode = nodes.find((n) => n.id === flow.to)

        if (!fromNode || !toNode || !flow.active) return null

        return (
          <DataParticle
            key={`${flow.from}-${flow.to}-${index}`}
            start={fromNode.position}
            end={toNode.position}
            speed={flow.speed}
            color="#00ffff"
          />
        )
      })}

      {/* Connection lines */}
      {flows.map((flow, index) => {
        const fromNode = nodes.find((n) => n.id === flow.from)
        const toNode = nodes.find((n) => n.id === flow.to)

        if (!fromNode || !toNode) return null

        const start = new THREE.Vector3(...fromNode.position)
        const end = new THREE.Vector3(...toNode.position)
        const points = [start, end]

        return (
          <line key={`line-${index}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={points.length}
                array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#444444" transparent opacity={0.3} />
          </line>
        )
      })}
    </>
  )
}

export default function NeonPipeline3D() {
  const [selectedNode, setSelectedNode] = useState<DataNode | null>(null)
  const [nodes, setNodes] = useState<DataNode[]>([
    {
      id: "source1",
      position: [-4, 2, 0],
      type: "source",
      status: "active",
      label: "User Events",
      throughput: 1250,
    },
    {
      id: "source2",
      position: [-4, 0, 0],
      type: "source",
      status: "active",
      label: "Transactions",
      throughput: 890,
    },
    {
      id: "source3",
      position: [-4, -2, 0],
      type: "source",
      status: "active",
      label: "System Metrics",
      throughput: 2100,
    },
    {
      id: "processor1",
      position: [0, 1, 0],
      type: "processor",
      status: "processing",
      label: "Data Ingestion",
      throughput: 4240,
    },
    {
      id: "processor2",
      position: [0, -1, 0],
      type: "processor",
      status: "processing",
      label: "Transformation",
      throughput: 4100,
    },
    {
      id: "storage1",
      position: [4, 0, 0],
      type: "storage",
      status: "complete",
      label: "Data Warehouse",
      throughput: 4000,
    },
  ])

  const [flows] = useState<DataFlow[]>([
    { from: "source1", to: "processor1", active: true, speed: 1 },
    { from: "source2", to: "processor1", active: true, speed: 0.8 },
    { from: "source3", to: "processor1", active: true, speed: 1.2 },
    { from: "processor1", to: "processor2", active: true, speed: 1 },
    { from: "processor2", to: "storage1", active: true, speed: 0.9 },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          throughput: node.throughput + Math.floor(Math.random() * 100) - 50,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [8, 4, 8], fov: 60 }}>
        <color attach="background" args={["#000011"]} />

        {/* Lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#0088ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0088" />

        {/* Environment */}
        <Environment preset="night" />

        {/* Grid floor */}
        <gridHelper args={[20, 20, "#333333", "#111111"]} position={[0, -3, 0]} />

        {/* Pipeline visualization */}
        <DataPipeline3D nodes={nodes} flows={flows} onNodeClick={setSelectedNode} />

        {/* Controls */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxDistance={20} minDistance={5} />
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/80 border border-cyan-400 rounded-lg p-4 backdrop-blur">
          <h2 className="text-cyan-400 font-bold text-lg mb-2">🚀 NEON DATA PIPELINE</h2>
          <div className="text-green-400 text-sm space-y-1">
            <div>Total Throughput: {nodes.reduce((sum, node) => sum + node.throughput, 0).toLocaleString()}/s</div>
            <div>Active Nodes: {nodes.filter((n) => n.status === "active" || n.status === "processing").length}</div>
            <div>
              Pipeline Status: <span className="text-green-400">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/80 border border-purple-400 rounded-lg p-4 backdrop-blur">
            <h3 className="text-purple-400 font-bold mb-2">{selectedNode.label}</h3>
            <div className="text-white text-sm space-y-1">
              <div>
                Type: <span className="text-cyan-400">{selectedNode.type}</span>
              </div>
              <div>
                Status: <span className="text-green-400">{selectedNode.status}</span>
              </div>
              <div>
                Throughput: <span className="text-yellow-400">{selectedNode.throughput.toLocaleString()}/s</span>
              </div>
            </div>
            <button onClick={() => setSelectedNode(null)} className="mt-2 text-xs text-gray-400 hover:text-white">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/80 border border-yellow-400 rounded-lg p-3 backdrop-blur">
          <div className="text-yellow-400 text-xs space-y-1">
            <div>🖱️ Click nodes for details</div>
            <div>🔄 Drag to rotate view</div>
            <div>🔍 Scroll to zoom</div>
          </div>
        </div>
      </div>
    </div>
  )
}
