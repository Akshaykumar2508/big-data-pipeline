"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, TrendingUp, AlertTriangle, CheckCircle, RotateCcw, Zap, Server, Cpu } from "lucide-react"
import NeonPipeline3D from "@/components/neon-pipeline-3d"
import HadoopSparkCluster3D from "@/components/hadoop-cluster-3d"

interface PipelineMetrics {
  recordsProcessed: number
  processingTime: number
  throughput: number
  errorRate: number
  qualityScore: number
  status: "running" | "completed" | "error" | "idle"
}

interface HadoopMetrics {
  hdfsCapacity: number
  hdfsUsed: number
  datanodes: number
}

interface HadoopMetrics {
  hdfsCapacity: number
  hdfsUsed: number
  datanodes: number
  activeNodes: number
  mapReduceJobs: number
  yarnApplications: number
}

interface SparkMetrics {
  executors: number
  cores: number
  memory: string
  runningJobs: number
  completedJobs: number
  rddCount: number
}

export default function NeonBigDataDashboard() {
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "running" | "completed">("idle")
  const [activeTab, setActiveTab] = useState("3d-pipeline")
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    recordsProcessed: 0,
    processingTime: 0,
    throughput: 0,
    errorRate: 0,
    qualityScore: 0,
    status: "idle",
  })

  const [hadoopMetrics, setHadoopMetrics] = useState<HadoopMetrics>({
    hdfsCapacity: 2000000, // 2TB
    hdfsUsed: 1300000, // 1.3TB
    datanodes: 4,
    activeNodes: 4,
    mapReduceJobs: 3,
    yarnApplications: 5,
  })

  const [sparkMetrics, setSparkMetrics] = useState<SparkMetrics>({
    executors: 6,
    cores: 24,
    memory: "48GB",
    runningJobs: 2,
    completedJobs: 127,
    rddCount: 15,
  })

  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 67,
    memory: 84,
    disk: 45,
    network: 72,
    temperature: 42,
  })

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      if (pipelineStatus === "running") {
        setMetrics((prev) => ({
          ...prev,
          recordsProcessed: prev.recordsProcessed + Math.floor(Math.random() * 1000) + 500,
          processingTime: prev.processingTime + 100,
          throughput: Math.floor(Math.random() * 2000) + 1000,
          errorRate: Math.random() * 2,
          qualityScore: 95 + Math.random() * 4,
        }))

        setHadoopMetrics((prev) => ({
          ...prev,
          hdfsUsed: prev.hdfsUsed + Math.floor(Math.random() * 1000),
          mapReduceJobs: Math.max(0, prev.mapReduceJobs + (Math.random() > 0.7 ? 1 : -1)),
          yarnApplications: Math.max(0, prev.yarnApplications + (Math.random() > 0.6 ? 1 : -1)),
        }))

        setSparkMetrics((prev) => ({
          ...prev,
          runningJobs: Math.max(0, prev.runningJobs + (Math.random() > 0.8 ? 1 : 0)),
          completedJobs: prev.completedJobs + (Math.random() > 0.9 ? 1 : 0),
          rddCount: Math.max(0, prev.rddCount + (Math.random() > 0.7 ? 1 : -1)),
        }))
      }

      setSystemMetrics((prev) => ({
        cpu: Math.max(20, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(20, Math.min(80, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(10, Math.min(95, prev.network + (Math.random() - 0.5) * 15)),
        temperature: Math.max(35, Math.min(65, prev.temperature + (Math.random() - 0.5) * 3)),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [pipelineStatus])

  const simulatePipeline = () => {
    setPipelineStatus("running")
    setMetrics((prev) => ({ ...prev, status: "running" }))

    setTimeout(() => {
      setPipelineStatus("completed")
      setMetrics((prev) => ({ ...prev, status: "completed" }))
    }, 15000)
  }

  const resetPipeline = () => {
    setPipelineStatus("idle")
    setMetrics({
      recordsProcessed: 0,
      processingTime: 0,
      throughput: 0,
      errorRate: 0,
      qualityScore: 0,
      status: "idle",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black text-white">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Cyberpunk Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⚡ BIG DATA ECOSYSTEM ⚡
              </h1>
              <p className="text-cyan-300 text-lg font-mono">{">"} HADOOP • SPARK • REAL-TIME PROCESSING_</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={simulatePipeline}
                disabled={pipelineStatus === "running"}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold border border-cyan-400 shadow-lg shadow-cyan-400/50"
              >
                <Zap className="w-4 h-4 mr-2" />
                {pipelineStatus === "running" ? "PROCESSING..." : "INITIATE ECOSYSTEM"}
              </Button>
              <Button
                onClick={resetPipeline}
                disabled={pipelineStatus === "running"}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border border-purple-400 shadow-lg shadow-purple-400/50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                RESET
              </Button>
            </div>
          </div>

          {/* Enhanced Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-black/60 border-cyan-400 shadow-lg shadow-cyan-400/20 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-400">RECORDS PROCESSED</CardTitle>
                <Database className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">
                  {metrics.recordsProcessed.toLocaleString()}
                </div>
                <p className="text-xs text-cyan-300">+{Math.floor(metrics.throughput)} per second</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-orange-400 shadow-lg shadow-orange-400/20 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">HDFS USAGE</CardTitle>
                <Server className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">
                  {((hadoopMetrics.hdfsUsed / hadoopMetrics.hdfsCapacity) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-orange-300">
                  {(hadoopMetrics.hdfsUsed / 1000).toFixed(1)}GB / {(hadoopMetrics.hdfsCapacity / 1000).toFixed(1)}GB
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-red-400 shadow-lg shadow-red-400/20 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-400">SPARK EXECUTORS</CardTitle>
                <Cpu className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{sparkMetrics.executors}</div>
                <p className="text-xs text-red-300">
                  {sparkMetrics.cores} cores, {sparkMetrics.memory}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-green-400 shadow-lg shadow-green-400/20 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-400">THROUGHPUT</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{metrics.throughput.toLocaleString()}</div>
                <p className="text-xs text-green-300">records/second</p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-purple-400 shadow-lg shadow-purple-400/20 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-400">DATA QUALITY</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{metrics.qualityScore.toFixed(1)}%</div>
                <p className="text-xs text-purple-300">Quality score</p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Cyberpunk Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-black/60 border border-cyan-400">
              <TabsTrigger
                value="3d-pipeline"
                className="data-[state=active]:bg-cyan-400 data-[state=active]:text-black text-cyan-400"
              >
                3D PIPELINE
              </TabsTrigger>
              <TabsTrigger
                value="hadoop-cluster"
                className="data-[state=active]:bg-orange-400 data-[state=active]:text-black text-orange-400"
              >
                🐘 HADOOP
              </TabsTrigger>
              <TabsTrigger
                value="spark-engine"
                className="data-[state=active]:bg-red-400 data-[state=active]:text-black text-red-400"
              >
                ⚡ SPARK
              </TabsTrigger>
              <TabsTrigger
                value="system-monitor"
                className="data-[state=active]:bg-green-400 data-[state=active]:text-black text-green-400"
              >
                SYSTEM MONITOR
              </TabsTrigger>
              <TabsTrigger
                value="data-streams"
                className="data-[state=active]:bg-purple-400 data-[state=active]:text-black text-purple-400"
              >
                DATA STREAMS
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-pink-400 data-[state=active]:text-black text-pink-400"
              >
                ANALYTICS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="3d-pipeline" className="space-y-6">
              <Card className="bg-black/60 border-cyan-400 shadow-lg shadow-cyan-400/20 backdrop-blur overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-cyan-400 font-mono">3D PIPELINE VISUALIZATION</CardTitle>
                  <CardDescription className="text-cyan-300">
                    Interactive 3D representation of data flow through the pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px]">
                    <NeonPipeline3D />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hadoop-cluster" className="space-y-6">
              <Card className="bg-black/60 border-orange-400 shadow-lg shadow-orange-400/20 backdrop-blur overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-orange-400 font-mono">🐘 HADOOP ECOSYSTEM</CardTitle>
                  <CardDescription className="text-orange-300">
                    HDFS cluster with MapReduce job visualization
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px]">
                    <HadoopSparkCluster3D />
                  </div>
                </CardContent>
              </Card>

              {/* Hadoop Status Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-black/60 border-orange-400 shadow-lg shadow-orange-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-orange-400 font-mono">HDFS STATUS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-300 font-mono">CAPACITY:</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {(hadoopMetrics.hdfsCapacity / 1000).toFixed(1)}GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-300 font-mono">USED:</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {(hadoopMetrics.hdfsUsed / 1000).toFixed(1)}GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-300 font-mono">DATANODES:</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {hadoopMetrics.activeNodes}/{hadoopMetrics.datanodes}
                      </span>
                    </div>
                    <Progress
                      value={(hadoopMetrics.hdfsUsed / hadoopMetrics.hdfsCapacity) * 100}
                      className="h-2 bg-black border border-orange-400"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-yellow-400 shadow-lg shadow-yellow-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 font-mono">MAPREDUCE JOBS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-300 font-mono">RUNNING:</span>
                      <span className="text-sm font-bold text-white font-mono">{hadoopMetrics.mapReduceJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-300 font-mono">COMPLETED:</span>
                      <span className="text-sm font-bold text-white font-mono">247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-300 font-mono">FAILED:</span>
                      <span className="text-sm font-bold text-white font-mono">3</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-green-400 shadow-lg shadow-green-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-green-400 font-mono">YARN APPLICATIONS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-300 font-mono">RUNNING:</span>
                      <span className="text-sm font-bold text-white font-mono">{hadoopMetrics.yarnApplications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-300 font-mono">PENDING:</span>
                      <span className="text-sm font-bold text-white font-mono">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-300 font-mono">MEMORY USED:</span>
                      <span className="text-sm font-bold text-white font-mono">67%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="spark-engine" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/60 border-red-400 shadow-lg shadow-red-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-red-400 font-mono">⚡ SPARK CLUSTER</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-red-300 font-mono">EXECUTORS:</span>
                      <span className="text-sm font-bold text-white font-mono">{sparkMetrics.executors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-300 font-mono">TOTAL CORES:</span>
                      <span className="text-sm font-bold text-white font-mono">{sparkMetrics.cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-300 font-mono">TOTAL MEMORY:</span>
                      <span className="text-sm font-bold text-white font-mono">{sparkMetrics.memory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-300 font-mono">RDD COUNT:</span>
                      <span className="text-sm font-bold text-white font-mono">{sparkMetrics.rddCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-purple-400 shadow-lg shadow-purple-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 font-mono">SPARK JOBS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-300 font-mono">RUNNING:</span>
                      <span className="text-sm font-bold text-white font-mono">{sparkMetrics.runningJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-300 font-mono">COMPLETED:</span>
                      <span className="text-sm font-bold text-white font-mono">{sparkMetrics.completedJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-300 font-mono">SUCCESS RATE:</span>
                      <span className="text-sm font-bold text-white font-mono">98.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-300 font-mono">AVG DURATION:</span>
                      <span className="text-sm font-bold text-white font-mono">2.3s</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Spark Operations */}
              <Card className="bg-black/60 border-red-400 shadow-lg shadow-red-400/20 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-red-400 font-mono">ACTIVE RDD OPERATIONS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["textFile", "filter", "map", "reduceByKey", "collect", "cache", "persist", "join"].map((op) => (
                      <div
                        key={op}
                        className="bg-black/40 border border-red-400/50 rounded p-3 text-center hover:border-red-400 transition-colors"
                      >
                        <div className="text-red-400 font-mono text-sm font-bold">{op.toUpperCase()}</div>
                        <div className="text-white text-xs mt-1">{Math.floor(Math.random() * 100)} ops</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system-monitor" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/60 border-green-400 shadow-lg shadow-green-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-green-400 font-mono">SYSTEM PERFORMANCE</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(systemMetrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-300 uppercase font-mono">{key}</span>
                          <span className="text-sm font-bold text-white font-mono">{Math.round(value)}%</span>
                        </div>
                        <Progress value={value} className="h-2 bg-black border border-green-400" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-yellow-400 shadow-lg shadow-yellow-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 font-mono">CLUSTER HEALTH</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "NameNode", status: "ACTIVE", icon: CheckCircle },
                      { name: "DataNodes", status: "HEALTHY", icon: CheckCircle },
                      { name: "Spark Master", status: "RUNNING", icon: CheckCircle },
                      { name: "YARN ResourceManager", status: "ACTIVE", icon: CheckCircle },
                      { name: "Network", status: "OPTIMAL", icon: CheckCircle },
                      { name: "Storage", status: "WARNING", icon: AlertTriangle },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <span className="text-sm text-yellow-300 font-mono">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono ${item.status === "WARNING" ? "text-yellow-400" : "text-green-400"}`}
                          >
                            {item.status}
                          </span>
                          <item.icon
                            className={`w-4 h-4 ${item.status === "WARNING" ? "text-yellow-400" : "text-green-400"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data-streams" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Kafka Stream", rate: "15,250/s", status: "ACTIVE", color: "cyan", type: "Real-time" },
                  { name: "HDFS Ingestion", rate: "8,900/s", status: "ACTIVE", color: "orange", type: "Batch" },
                  { name: "Spark Streaming", rate: "21,000/s", status: "ACTIVE", color: "red", type: "Micro-batch" },
                  { name: "Flume Agent", rate: "0/s", status: "ERROR", color: "gray", type: "Log Collection" },
                ].map((stream) => (
                  <Card
                    key={stream.name}
                    className={`bg-black/60 border-${stream.color}-400 shadow-lg shadow-${stream.color}-400/20 backdrop-blur`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-${stream.color}-400 font-mono text-lg`}>{stream.name}</CardTitle>
                        <Badge
                          className={`bg-${stream.color}-400/20 text-${stream.color}-400 border-${stream.color}-400 font-mono`}
                        >
                          {stream.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300 font-mono">TYPE:</span>
                          <span className={`font-bold text-${stream.color}-400 font-mono`}>{stream.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300 font-mono">RATE:</span>
                          <span className={`font-bold text-${stream.color}-400 font-mono`}>{stream.rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300 font-mono">LAST UPDATE:</span>
                          <span className="font-mono text-white">
                            {stream.status === "ACTIVE" ? "< 1s ago" : "5m ago"}
                          </span>
                        </div>
                        <Progress
                          value={stream.status === "ACTIVE" ? 85 : 0}
                          className={`h-2 bg-black border border-${stream.color}-400`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-black/60 border-pink-400 shadow-lg shadow-pink-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-pink-400 font-mono">PROCESSING VOLUME</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-pink-400 font-mono">24.7M</div>
                    <p className="text-sm text-pink-300 font-mono">Records processed today</p>
                    <div className="mt-4 text-sm text-green-400 font-mono">↗ +18% from yesterday</div>
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-cyan-400 shadow-lg shadow-cyan-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-cyan-400 font-mono">CLUSTER EFFICIENCY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-cyan-400 font-mono">94.2%</div>
                    <p className="text-sm text-cyan-300 font-mono">Resource utilization</p>
                    <div className="mt-4 text-sm text-green-400 font-mono">↗ +3% optimization</div>
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-purple-400 shadow-lg shadow-purple-400/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 font-mono">COST PER TB</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400 font-mono">$0.12</div>
                    <p className="text-sm text-purple-300 font-mono">Processing cost</p>
                    <div className="mt-4 text-sm text-green-400 font-mono">↘ -15% cost reduction</div>
                  </CardContent>
                </Card>
              </div>

              {/* Big Data Technologies Overview */}
              <Card className="bg-black/60 border-gradient-to-r from-cyan-400 to-purple-400 shadow-lg backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-mono">
                    BIG DATA TECHNOLOGIES STACK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Hadoop HDFS", version: "3.3.4", status: "Active" },
                      { name: "Apache Spark", version: "3.4.1", status: "Running" },
                      { name: "YARN", version: "3.3.4", status: "Active" },
                      { name: "Kafka", version: "2.8.1", status: "Streaming" },
                      { name: "Hive", version: "3.1.3", status: "Ready" },
                      { name: "HBase", version: "2.4.17", status: "Online" },
                      { name: "Zookeeper", version: "3.7.1", status: "Coordinating" },
                      { name: "Flume", version: "1.10.1", status: "Collecting" },
                    ].map((tech) => (
                      <div
                        key={tech.name}
                        className="bg-black/40 border border-cyan-400/50 rounded p-3 hover:border-cyan-400 transition-colors"
                      >
                        <div className="text-cyan-400 font-mono text-sm font-bold">{tech.name}</div>
                        <div className="text-white text-xs mt-1">v{tech.version}</div>
                        <div className="text-green-400 text-xs">{tech.status}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
