"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, Box, Cylinder, Html, Environment, OrbitControls, Float, Sparkles, Text } from "@react-three/drei"
import type * as THREE from "three"

interface HDFSNode {
  id: string
  type: "namenode" | "datanode" | "secondary-namenode"
  position: [number, number, number]
  status: "active" | "standby" | "dead" | "decommissioning"
  capacity: number
  used: number
  blocks: number
  replicas: number
}

interface MapReduceJob {
  id: string
  name: string
  status: "running" | "completed" | "failed" | "pending"
  mapTasks: number
  reduceTasks: number
  progress: number
  inputSize: string
  outputSize: string
}

interface SparkJob {
  id: string
  name: string
  status: "running" | "completed" | "failed" | "pending"
  stages: number
  tasks: number
  progress: number
  rddOperations: string[]
  executors: number
}

const HDFSNodeComponent = ({ node, onClick }: { node: HDFSNode; onClick: (node: HDFSNode) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      if (node.status === "active") {
        meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime) * 0.1
      }
    }
  })

  const getNodeColor = () => {
    switch (node.type) {
      case "namenode":
        return "#ff6b00" // Orange for NameNode
      case "datanode":
        return "#00ff88" // Green for DataNode
      case "secondary-namenode":
        return "#ffff00" // Yellow for Secondary NameNode
      default:
        return "#888888"
    }
  }

  const getStatusColor = () => {
    switch (node.status) {
      case "active":
        return "#00ff00"
      case "standby":
        return "#ffff00"
      case "dead":
        return "#ff0000"
      case "decommissioning":
        return "#ff8800"
      default:
        return "#888888"
    }
  }

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={node.position}>
        <mesh
          ref={meshRef}
          onClick={() => onClick(node)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.3 : 1}
        >
          {node.type === "namenode" ? (
            <Box args={[0.8, 0.8, 0.8]} />
          ) : node.type === "datanode" ? (
            <Cylinder args={[0.4, 0.4, 0.8]} />
          ) : (
            <Sphere args={[0.4]} />
          )}
          <meshStandardMaterial color={getNodeColor()} emissive={getNodeColor()} emissiveIntensity={0.3} />
        </mesh>

        {/* Status indicator */}
        <mesh position={[0, 0.6, 0]} scale={0.3}>
          <Sphere args={[0.2]} />
          <meshStandardMaterial color={getStatusColor()} emissive={getStatusColor()} emissiveIntensity={1} />
        </mesh>

        {/* Data blocks visualization for DataNodes */}
        {node.type === "datanode" &&
          Array.from({ length: Math.min(node.blocks, 10) }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i * 0.6) * 0.8, 0, Math.sin(i * 0.6) * 0.8]} scale={0.1}>
              <Box args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={0.5} />
            </mesh>
          ))}

        {/* Node label */}
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded border border-orange-400 backdrop-blur">
            <div className="font-bold text-orange-400 text-sm">{node.type.toUpperCase()}</div>
            <div className="text-green-400 text-xs">
              {node.type === "datanode" ? `${node.blocks} blocks` : "Master Node"}
            </div>
            <div className="text-cyan-400 text-xs">{((node.used / node.capacity) * 100).toFixed(1)}% used</div>
          </div>
        </Html>

        {/* Replication visualization */}
        {node.type === "datanode" && node.replicas > 0 && (
          <Sparkles count={node.replicas * 2} scale={2} size={1} speed={0.3} color="#00ffff" />
        )}
      </group>
    </Float>
  )
}

const MapReduceVisualization = ({ job }: { job: MapReduceJob }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && job.status === "running") {
      groupRef.current.rotation.y += 0.02
    }
  })

  return (
    <group ref={groupRef} position={[0, 3, 0]}>
      {/* Map phase */}
      <group position={[-2, 0, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="#ff6b00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          MAP PHASE
        </Text>
        {Array.from({ length: job.mapTasks }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * 0.8) * 1, 0, Math.sin(i * 0.8) * 1]} scale={0.2}>
            <Box args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={job.status === "running" ? "#ff6b00" : "#666666"}
              emissive={job.status === "running" ? "#ff6b00" : "#000000"}
              emissiveIntensity={job.status === "running" ? 0.5 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Shuffle phase */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="#ffff00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          SHUFFLE
        </Text>
        <mesh>
          <Cylinder args={[0.3, 0.3, 1]} />
          <meshStandardMaterial
            color={job.status === "running" ? "#ffff00" : "#666666"}
            emissive={job.status === "running" ? "#ffff00" : "#000000"}
            emissiveIntensity={job.status === "running" ? 0.5 : 0}
          />
        </mesh>
      </group>

      {/* Reduce phase */}
      <group position={[2, 0, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          REDUCE PHASE
        </Text>
        {Array.from({ length: job.reduceTasks }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * 1.2) * 0.8, 0, Math.sin(i * 1.2) * 0.8]} scale={0.2}>
            <Cylinder args={[0.2, 0.2, 0.4]} />
            <meshStandardMaterial
              color={job.status === "running" ? "#00ff88" : "#666666"}
              emissive={job.status === "running" ? "#00ff88" : "#000000"}
              emissiveIntensity={job.status === "running" ? 0.5 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Progress indicator */}
      <Html position={[0, -1.5, 0]} center>
        <div className="bg-black/90 text-white px-4 py-2 rounded border border-orange-400 backdrop-blur">
          <div className="font-bold text-orange-400">{job.name}</div>
          <div className="text-green-400 text-sm">Progress: {job.progress}%</div>
          <div className="text-cyan-400 text-sm">
            Input: {job.inputSize} → Output: {job.outputSize}
          </div>
        </div>
      </Html>
    </group>
  )
}

const SparkRDDVisualization = ({ job }: { job: SparkJob }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && job.status === "running") {
      groupRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="#e25a00"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        APACHE SPARK
      </Text>

      {/* RDD Operations Chain */}
      {job.rddOperations.map((operation, i) => (
        <group key={i} position={[i * 2 - (job.rddOperations.length - 1), 0, 0]}>
          <mesh>
            <Box args={[0.8, 0.4, 0.4]} />
            <meshStandardMaterial
              color={job.status === "running" ? "#e25a00" : "#666666"}
              emissive={job.status === "running" ? "#e25a00" : "#000000"}
              emissiveIntensity={job.status === "running" ? 0.3 : 0}
            />
          </mesh>

          <Text
            position={[0, 0, 0.3]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Geist-Bold.ttf"
          >
            {operation.toUpperCase()}
          </Text>

          {/* Connection arrows */}
          {i < job.rddOperations.length - 1 && (
            <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <Cylinder args={[0.05, 0.05, 0.4]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
            </mesh>
          )}
        </group>
      ))}

      {/* Executors */}
      <group position={[0, -1.5, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          EXECUTORS
        </Text>
        {Array.from({ length: job.executors }).map((_, i) => (
          <mesh key={i} position={[i * 0.8 - (job.executors - 1) * 0.4, 0, 0]} scale={0.3}>
            <Sphere args={[0.3]} />
            <meshStandardMaterial
              color={job.status === "running" ? "#00ff88" : "#666666"}
              emissive={job.status === "running" ? "#00ff88" : "#000000"}
              emissiveIntensity={job.status === "running" ? 0.5 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Job info */}
      <Html position={[0, -2.5, 0]} center>
        <div className="bg-black/90 text-white px-4 py-2 rounded border border-orange-500 backdrop-blur">
          <div className="font-bold text-orange-400">{job.name}</div>
          <div className="text-green-400 text-sm">
            Stages: {job.stages} | Tasks: {job.tasks}
          </div>
          <div className="text-cyan-400 text-sm">Progress: {job.progress}%</div>
          <div className="text-purple-400 text-sm">Executors: {job.executors}</div>
        </div>
      </Html>
    </group>
  )
}

export default function HadoopSparkCluster3D() {
  const [selectedNode, setSelectedNode] = useState<HDFSNode | null>(null)
  const [hdfsNodes] = useState<HDFSNode[]>([
    {
      id: "namenode-1",
      type: "namenode",
      position: [0, 0, 0],
      status: "active",
      capacity: 1000000,
      used: 650000,
      blocks: 0,
      replicas: 0,
    },
    {
      id: "secondary-namenode",
      type: "secondary-namenode",
      position: [2, 0, 0],
      status: "standby",
      capacity: 500000,
      used: 200000,
      blocks: 0,
      replicas: 0,
    },
    {
      id: "datanode-1",
      type: "datanode",
      position: [-3, -2, 0],
      status: "active",
      capacity: 500000,
      used: 320000,
      blocks: 1250,
      replicas: 3,
    },
    {
      id: "datanode-2",
      type: "datanode",
      position: [-1, -2, 0],
      status: "active",
      capacity: 500000,
      used: 280000,
      blocks: 1100,
      replicas: 3,
    },
    {
      id: "datanode-3",
      type: "datanode",
      position: [1, -2, 0],
      status: "active",
      capacity: 500000,
      used: 350000,
      blocks: 1400,
      replicas: 3,
    },
    {
      id: "datanode-4",
      type: "datanode",
      position: [3, -2, 0],
      status: "decommissioning",
      capacity: 500000,
      used: 150000,
      blocks: 600,
      replicas: 2,
    },
  ])

  const [mapReduceJob] = useState<MapReduceJob>({
    id: "mr-job-001",
    name: "Log Analysis Job",
    status: "running",
    mapTasks: 8,
    reduceTasks: 4,
    progress: 67,
    inputSize: "2.4 TB",
    outputSize: "450 GB",
  })

  const [sparkJob] = useState<SparkJob>({
    id: "spark-job-001",
    name: "Real-time Analytics",
    status: "running",
    stages: 5,
    tasks: 120,
    progress: 78,
    rddOperations: ["textFile", "filter", "map", "reduceByKey", "collect"],
    executors: 6,
  })

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [12, 8, 12], fov: 60 }}>
        <color attach="background" args={["#000011"]} />

        {/* Enhanced lighting for Hadoop/Spark */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff6b00" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#e25a00" />
        <pointLight position={[0, -10, 0]} intensity={0.5} color="#00ff88" />

        <Environment preset="night" />

        {/* HDFS Grid */}
        <gridHelper args={[30, 30, "#ff6b00", "#331100"]} position={[0, -4, 0]} />

        {/* HDFS Cluster */}
        {hdfsNodes.map((node) => (
          <HDFSNodeComponent key={node.id} node={node} onClick={setSelectedNode} />
        ))}

        {/* MapReduce Job Visualization */}
        <MapReduceVisualization job={mapReduceJob} />

        {/* Spark Job Visualization */}
        <SparkRDDVisualization job={sparkJob} />

        {/* Cluster title */}
        <Text
          position={[0, 6, 0]}
          fontSize={0.8}
          color="#ff6b00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          HADOOP + SPARK CLUSTER
        </Text>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxDistance={25} minDistance={8} />
      </Canvas>

      {/* Cluster Status HUD */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/90 border border-orange-400 rounded-lg p-4 backdrop-blur">
          <h2 className="text-orange-400 font-bold text-lg mb-3">🐘 HADOOP CLUSTER STATUS</h2>
          <div className="space-y-2 text-sm">
            <div className="text-green-400">
              ✅ NameNode: Active ({hdfsNodes.find((n) => n.type === "namenode")?.status})
            </div>
            <div className="text-yellow-400">
              ⚡ Secondary NameNode: Standby ({hdfsNodes.find((n) => n.type === "secondary-namenode")?.status})
            </div>
            <div className="text-green-400">
              📦 DataNodes: {hdfsNodes.filter((n) => n.type === "datanode" && n.status === "active").length}/
              {hdfsNodes.filter((n) => n.type === "datanode").length} Active
            </div>
            <div className="text-cyan-400">
              🔄 Total Blocks: {hdfsNodes.reduce((sum, node) => sum + node.blocks, 0).toLocaleString()}
            </div>
            <div className="text-purple-400">
              💾 Cluster Usage:{" "}
              {(
                (hdfsNodes.reduce((sum, node) => sum + node.used, 0) /
                  hdfsNodes.reduce((sum, node) => sum + node.capacity, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Spark Status */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/90 border border-orange-500 rounded-lg p-4 backdrop-blur">
          <h2 className="text-orange-400 font-bold text-lg mb-3">⚡ APACHE SPARK</h2>
          <div className="space-y-2 text-sm">
            <div className="text-green-400">🚀 Job: {sparkJob.name}</div>
            <div className="text-cyan-400">📊 Progress: {sparkJob.progress}%</div>
            <div className="text-purple-400">🔧 Stages: {sparkJob.stages}</div>
            <div className="text-yellow-400">⚙️ Tasks: {sparkJob.tasks}</div>
            <div className="text-green-400">🖥️ Executors: {sparkJob.executors}</div>
            <div className="text-orange-400">🔗 RDD Ops: {sparkJob.rddOperations.length}</div>
          </div>
        </div>
      </div>

      {/* MapReduce Status */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/90 border border-orange-400 rounded-lg p-4 backdrop-blur">
          <h2 className="text-orange-400 font-bold text-lg mb-3">🗺️ MAPREDUCE JOB</h2>
          <div className="space-y-2 text-sm">
            <div className="text-green-400">📋 Job: {mapReduceJob.name}</div>
            <div className="text-cyan-400">📈 Progress: {mapReduceJob.progress}%</div>
            <div className="text-yellow-400">🗂️ Map Tasks: {mapReduceJob.mapTasks}</div>
            <div className="text-purple-400">🔄 Reduce Tasks: {mapReduceJob.reduceTasks}</div>
            <div className="text-green-400">📥 Input: {mapReduceJob.inputSize}</div>
            <div className="text-orange-400">📤 Output: {mapReduceJob.outputSize}</div>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-black/90 border border-green-400 rounded-lg p-4 backdrop-blur">
            <h3 className="text-green-400 font-bold mb-2">{selectedNode.type.toUpperCase()}</h3>
            <div className="text-white text-sm space-y-1">
              <div>
                Status: <span className="text-cyan-400">{selectedNode.status}</span>
              </div>
              <div>
                Capacity: <span className="text-yellow-400">{(selectedNode.capacity / 1000).toFixed(0)} GB</span>
              </div>
              <div>
                Used: <span className="text-orange-400">{(selectedNode.used / 1000).toFixed(0)} GB</span>
              </div>
              {selectedNode.type === "datanode" && (
                <>
                  <div>
                    Blocks: <span className="text-purple-400">{selectedNode.blocks}</span>
                  </div>
                  <div>
                    Replication: <span className="text-green-400">{selectedNode.replicas}x</span>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setSelectedNode(null)} className="mt-2 text-xs text-gray-400 hover:text-white">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2">
        <div className="bg-black/90 border border-yellow-400 rounded-lg p-3 backdrop-blur">
          <div className="text-yellow-400 text-xs space-y-1">
            <div>🖱️ Click HDFS nodes for details</div>
            <div>🔄 Watch MapReduce phases</div>
            <div>⚡ Observe Spark RDD operations</div>
            <div>🔍 Zoom to see data blocks</div>
          </div>
        </div>
      </div>
    </div>
  )
}
