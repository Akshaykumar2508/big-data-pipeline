// Hadoop MapReduce simulation with HDFS integration
class HDFSClient {
  constructor() {
    this.nameNodeUrl = "hdfs://namenode:9000"
    this.blockSize = 128 * 1024 * 1024 // 128MB
    this.replicationFactor = 3
    this.files = new Map()
    console.log("🐘 HDFS Client initialized")
    console.log(`📍 NameNode: ${this.nameNodeUrl}`)
    console.log(`📦 Block Size: ${this.blockSize / (1024 * 1024)}MB`)
    console.log(`🔄 Replication Factor: ${this.replicationFactor}`)
  }

  put(localPath, hdfsPath) {
    console.log(`📤 Uploading ${localPath} to HDFS: ${hdfsPath}`)

    // Simulate file upload
    const fileSize = Math.floor(Math.random() * 1000000000) + 100000000 // 100MB - 1GB
    const numBlocks = Math.ceil(fileSize / this.blockSize)

    const blocks = Array.from({ length: numBlocks }, (_, i) => ({
      blockId: `blk_${Date.now()}_${i}`,
      size: i === numBlocks - 1 ? fileSize % this.blockSize : this.blockSize,
      replicas: Array.from({ length: this.replicationFactor }, (_, j) => `datanode-${j + 1}`),
      checksum: Math.random().toString(36).substr(2, 16),
    }))

    this.files.set(hdfsPath, {
      path: hdfsPath,
      size: fileSize,
      blocks: blocks,
      replication: this.replicationFactor,
      owner: "hadoop",
      group: "supergroup",
      permissions: "644",
      modificationTime: new Date().toISOString(),
    })

    console.log(`✅ Upload completed: ${numBlocks} blocks, ${(fileSize / (1024 * 1024)).toFixed(2)}MB`)
    return true
  }

  get(hdfsPath, localPath) {
    console.log(`📥 Downloading ${hdfsPath} from HDFS to ${localPath}`)

    const file = this.files.get(hdfsPath)
    if (!file) {
      console.error(`❌ File not found: ${hdfsPath}`)
      return false
    }

    console.log(`📦 Downloading ${file.blocks.length} blocks...`)
    file.blocks.forEach((block, i) => {
      console.log(
        `📋 Block ${i + 1}/${file.blocks.length}: ${block.blockId} (${(block.size / (1024 * 1024)).toFixed(2)}MB)`,
      )
    })

    console.log(`✅ Download completed: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
    return true
  }

  ls(path = "/") {
    console.log(`📂 Listing directory: ${path}`)
    const files = Array.from(this.files.values()).filter((f) => f.path.startsWith(path))

    console.log("📋 Directory contents:")
    files.forEach((file) => {
      console.log(
        `  ${file.permissions} ${file.owner} ${file.group} ${(file.size / (1024 * 1024)).toFixed(2)}MB ${file.modificationTime} ${file.path}`,
      )
    })

    return files
  }

  fsck(path) {
    console.log(`🔍 File system check for: ${path}`)
    const file = this.files.get(path)

    if (!file) {
      console.error(`❌ File not found: ${path}`)
      return false
    }

    console.log(`📊 File: ${file.path}`)
    console.log(`📏 Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
    console.log(`📦 Blocks: ${file.blocks.length}`)
    console.log(`🔄 Replication: ${file.replication}`)

    let healthyBlocks = 0
    file.blocks.forEach((block, i) => {
      const healthyReplicas = block.replicas.filter((replica) => Math.random() > 0.1) // 90% healthy
      if (healthyReplicas.length >= 2) {
        healthyBlocks++
        console.log(
          `✅ Block ${i + 1}: ${block.blockId} - ${healthyReplicas.length}/${block.replicas.length} replicas healthy`,
        )
      } else {
        console.log(
          `⚠️ Block ${i + 1}: ${block.blockId} - ${healthyReplicas.length}/${block.replicas.length} replicas healthy (UNDER-REPLICATED)`,
        )
      }
    })

    console.log(`📊 Health Summary: ${healthyBlocks}/${file.blocks.length} blocks healthy`)
    return healthyBlocks === file.blocks.length
  }
}

class MapReduceJob {
  constructor(jobName, inputPath, outputPath) {
    this.jobName = jobName
    this.inputPath = inputPath
    this.outputPath = outputPath
    this.jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.status = "PREP"
    this.mapTasks = []
    this.reduceTasks = []
    this.counters = {
      mapInputRecords: 0,
      mapOutputRecords: 0,
      reduceInputRecords: 0,
      reduceOutputRecords: 0,
      spilledRecords: 0,
      shuffledMaps: 0,
    }
    console.log(`🗺️ MapReduce Job created: ${jobName}`)
    console.log(`🆔 Job ID: ${this.jobId}`)
  }

  setMapper(mapperFunction) {
    this.mapper = mapperFunction
    console.log("🔧 Mapper function set")
    return this
  }

  setReducer(reducerFunction) {
    this.reducer = reducerFunction
    console.log("🔧 Reducer function set")
    return this
  }

  setCombiner(combinerFunction) {
    this.combiner = combinerFunction
    console.log("🔧 Combiner function set")
    return this
  }

  setNumReduceTasks(numTasks) {
    this.numReduceTasks = numTasks
    console.log(`🔧 Number of reduce tasks set: ${numTasks}`)
    return this
  }

  async submit() {
    console.log(`🚀 Submitting MapReduce job: ${this.jobName}`)
    this.status = "RUNNING"

    try {
      // Phase 1: Map Phase
      await this.runMapPhase()

      // Phase 2: Shuffle and Sort Phase
      await this.runShufflePhase()

      // Phase 3: Reduce Phase
      await this.runReducePhase()

      this.status = "SUCCEEDED"
      console.log(`🎉 Job completed successfully: ${this.jobId}`)
      this.printJobSummary()
    } catch (error) {
      this.status = "FAILED"
      console.error(`❌ Job failed: ${error.message}`)
    }
  }

  async runMapPhase() {
    console.log("\n📍 === MAP PHASE ===")

    // Simulate reading input splits
    const inputSplits = this.generateInputSplits()
    console.log(`📂 Generated ${inputSplits.length} input splits`)

    // Create map tasks
    this.mapTasks = inputSplits.map((split, i) => ({
      taskId: `task_${this.jobId}_m_${i.toString().padStart(6, "0")}`,
      splitId: split.id,
      inputRecords: split.records,
      status: "PENDING",
    }))

    console.log(`⚙️ Created ${this.mapTasks.length} map tasks`)

    // Execute map tasks
    for (const task of this.mapTasks) {
      await this.executeMapTask(task)
    }

    console.log("✅ Map phase completed")
  }

  async executeMapTask(task) {
    console.log(`🔄 Executing map task: ${task.taskId}`)
    task.status = "RUNNING"

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    // Simulate mapper execution
    const outputRecords = Math.floor(task.inputRecords * (0.8 + Math.random() * 0.4)) // 80-120% of input

    this.counters.mapInputRecords += task.inputRecords
    this.counters.mapOutputRecords += outputRecords

    task.status = "SUCCEEDED"
    task.outputRecords = outputRecords

    console.log(`✅ Map task completed: ${task.taskId} (${task.inputRecords} → ${outputRecords} records)`)
  }

  async runShufflePhase() {
    console.log("\n🔀 === SHUFFLE AND SORT PHASE ===")

    console.log("📊 Partitioning map outputs...")
    const totalMapOutput = this.counters.mapOutputRecords
    const numReducers = this.numReduceTasks || Math.ceil(this.mapTasks.length / 4)

    console.log(`🔄 Shuffling ${totalMapOutput} records to ${numReducers} reducers...`)

    // Simulate shuffle
    await new Promise((resolve) => setTimeout(resolve, 2000))

    this.counters.shuffledMaps = this.mapTasks.length
    this.counters.spilledRecords = Math.floor(totalMapOutput * 0.1) // 10% spilled

    console.log(`📦 Shuffle completed: ${this.counters.shuffledMaps} maps shuffled`)
    console.log(`💾 Spilled records: ${this.counters.spilledRecords}`)
  }

  async runReducePhase() {
    console.log("\n🔄 === REDUCE PHASE ===")

    const numReducers = this.numReduceTasks || Math.ceil(this.mapTasks.length / 4)

    // Create reduce tasks
    this.reduceTasks = Array.from({ length: numReducers }, (_, i) => ({
      taskId: `task_${this.jobId}_r_${i.toString().padStart(6, "0")}`,
      inputRecords: Math.floor(this.counters.mapOutputRecords / numReducers),
      status: "PENDING",
    }))

    console.log(`⚙️ Created ${this.reduceTasks.length} reduce tasks`)

    // Execute reduce tasks
    for (const task of this.reduceTasks) {
      await this.executeReduceTask(task)
    }

    console.log("✅ Reduce phase completed")
  }

  async executeReduceTask(task) {
    console.log(`🔄 Executing reduce task: ${task.taskId}`)
    task.status = "RUNNING"

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 1000))

    // Simulate reducer execution
    const outputRecords = Math.floor(task.inputRecords * (0.3 + Math.random() * 0.4)) // 30-70% of input

    this.counters.reduceInputRecords += task.inputRecords
    this.counters.reduceOutputRecords += outputRecords

    task.status = "SUCCEEDED"
    task.outputRecords = outputRecords

    console.log(`✅ Reduce task completed: ${task.taskId} (${task.inputRecords} → ${outputRecords} records)`)
  }

  generateInputSplits() {
    // Simulate input file splitting
    const totalSize = Math.floor(Math.random() * 10000000000) + 1000000000 // 1-10GB
    const splitSize = 128 * 1024 * 1024 // 128MB splits
    const numSplits = Math.ceil(totalSize / splitSize)

    return Array.from({ length: numSplits }, (_, i) => ({
      id: `split_${i}`,
      start: i * splitSize,
      length: i === numSplits - 1 ? totalSize % splitSize : splitSize,
      records: Math.floor(Math.random() * 100000) + 10000, // 10K-110K records per split
    }))
  }

  printJobSummary() {
    console.log("\n📊 === JOB SUMMARY ===")
    console.log(`🆔 Job ID: ${this.jobId}`)
    console.log(`📋 Job Name: ${this.jobName}`)
    console.log(`📈 Status: ${this.status}`)
    console.log(`⚙️ Map Tasks: ${this.mapTasks.length}`)
    console.log(`🔄 Reduce Tasks: ${this.reduceTasks.length}`)
    console.log("\n📊 Counters:")
    Object.entries(this.counters).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.toLocaleString()}`)
    })
  }
}

// YARN Resource Manager simulation
class YARNResourceManager {
  constructor() {
    this.applications = new Map()
    this.nodeManagers = [
      { id: "nm-1", hostname: "worker1", cores: 8, memory: 16384, available: true },
      { id: "nm-2", hostname: "worker2", cores: 8, memory: 16384, available: true },
      { id: "nm-3", hostname: "worker3", cores: 8, memory: 16384, available: true },
      { id: "nm-4", hostname: "worker4", cores: 8, memory: 16384, available: true },
    ]
    console.log("🧵 YARN Resource Manager initialized")
    console.log(`🖥️ Node Managers: ${this.nodeManagers.length}`)
    console.log(`💾 Total Cluster Memory: ${this.nodeManagers.reduce((sum, nm) => sum + nm.memory, 0)}MB`)
    console.log(`⚙️ Total Cluster Cores: ${this.nodeManagers.reduce((sum, nm) => sum + nm.cores, 0)}`)
  }

  submitApplication(appName, appType = "MAPREDUCE") {
    const appId = `application_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`

    const application = {
      id: appId,
      name: appName,
      type: appType,
      status: "SUBMITTED",
      startTime: new Date().toISOString(),
      allocatedContainers: [],
      requestedMemory: Math.floor(Math.random() * 4096) + 1024, // 1-5GB
      requestedCores: Math.floor(Math.random() * 4) + 1, // 1-4 cores
    }

    this.applications.set(appId, application)
    console.log(`📋 Application submitted: ${appName} (${appId})`)

    // Simulate resource allocation
    this.allocateResources(application)

    return appId
  }

  allocateResources(application) {
    console.log(`🔄 Allocating resources for: ${application.name}`)

    // Find available node managers
    const availableNodes = this.nodeManagers.filter(
      (nm) => nm.available && nm.memory >= application.requestedMemory && nm.cores >= application.requestedCores,
    )

    if (availableNodes.length === 0) {
      console.log("⚠️ No resources available, queuing application...")
      application.status = "ACCEPTED"
      return
    }

    // Allocate container
    const selectedNode = availableNodes[0]
    const container = {
      id: `container_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nodeId: selectedNode.id,
      memory: application.requestedMemory,
      cores: application.requestedCores,
    }

    application.allocatedContainers.push(container)
    application.status = "RUNNING"

    // Update node resources
    selectedNode.memory -= container.memory
    selectedNode.cores -= container.cores

    console.log(`✅ Container allocated: ${container.id} on ${selectedNode.hostname}`)
    console.log(`💾 Allocated: ${container.memory}MB memory, ${container.cores} cores`)
  }

  getApplicationStatus(appId) {
    const app = this.applications.get(appId)
    if (!app) {
      console.log(`❌ Application not found: ${appId}`)
      return null
    }

    console.log(`📊 Application Status: ${app.name}`)
    console.log(`🆔 ID: ${app.id}`)
    console.log(`📈 Status: ${app.status}`)
    console.log(`🕐 Start Time: ${app.startTime}`)
    console.log(`📦 Containers: ${app.allocatedContainers.length}`)

    return app
  }

  listApplications() {
    console.log("📋 Active Applications:")
    this.applications.forEach((app) => {
      console.log(`  ${app.id} | ${app.name} | ${app.status} | ${app.type}`)
    })
  }
}

// Example: Complete Hadoop ecosystem workflow
async function runHadoopWorkflow() {
  console.log("🚀 Starting Complete Hadoop Ecosystem Workflow...")

  // Initialize Hadoop components
  const hdfs = new HDFSClient()
  const yarn = new YARNResourceManager()

  try {
    // Step 1: Upload data to HDFS
    console.log("\n📤 === HDFS DATA UPLOAD ===")
    hdfs.put("/local/data/web-logs.txt", "/data/input/web-logs.txt")
    hdfs.put("/local/data/user-data.csv", "/data/input/user-data.csv")

    // Step 2: Check HDFS health
    console.log("\n🔍 === HDFS HEALTH CHECK ===")
    hdfs.fsck("/data/input/web-logs.txt")
    hdfs.ls("/data/input")

    // Step 3: Submit YARN application
    console.log("\n🧵 === YARN APPLICATION SUBMISSION ===")
    const appId = yarn.submitApplication("Web Log Analysis", "MAPREDUCE")

    // Step 4: Run MapReduce job
    console.log("\n🗺️ === MAPREDUCE JOB EXECUTION ===")
    const job = new MapReduceJob("Web Log Analysis", "/data/input/web-logs.txt", "/data/output/log-analysis")

    // Configure job
    job.setMapper((key, value) => {
      // Simulate log parsing
      const logEntry = value.split(" ")
      const ip = logEntry[0]
      const status = logEntry[8]
      return [
        [ip, 1],
        [status, 1],
      ]
    })

    job.setReducer((key, values) => {
      return values.reduce((sum, val) => sum + val, 0)
    })

    job.setNumReduceTasks(4)

    // Submit and wait for completion
    await job.submit()

    // Step 5: Check application status
    console.log("\n📊 === APPLICATION STATUS ===")
    yarn.getApplicationStatus(appId)
    yarn.listApplications()

    // Step 6: Download results
    console.log("\n📥 === RESULT DOWNLOAD ===")
    hdfs.get("/data/output/log-analysis/part-r-00000", "/local/results/log-analysis.txt")

    console.log("\n🎉 Hadoop workflow completed successfully!")
  } catch (error) {
    console.error("❌ Hadoop workflow error:", error)
  }
}

// Run the complete workflow
runHadoopWorkflow().catch(console.error)
