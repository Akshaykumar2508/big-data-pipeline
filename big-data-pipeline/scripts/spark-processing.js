// Advanced Spark-like data processing simulation
class SparkContext {
  constructor(appName, master = "local[*]") {
    this.appName = appName
    this.master = master
    this.rdds = new Map()
    this.executors = 4
    this.corePerExecutor = 2
    this.memoryPerExecutor = "2g"
    this.metrics = {
      jobsCompleted: 0,
      tasksCompleted: 0,
      shuffleRead: 0,
      shuffleWrite: 0,
      gcTime: 0,
    }
    console.log(`🚀 Spark Context initialized: ${appName}`)
    console.log(`📍 Master: ${master}`)
    console.log(`⚙️ Executors: ${this.executors} (${this.corePerExecutor} cores each)`)
  }

  // Create RDD from data
  parallelize(data, partitions = this.executors) {
    const rddId = `rdd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const rdd = new RDD(rddId, data, partitions, this)
    this.rdds.set(rddId, rdd)
    console.log(`📦 Created RDD ${rddId} with ${data.length} elements in ${partitions} partitions`)
    return rdd
  }

  // Read text file (simulated)
  textFile(path, minPartitions = this.executors) {
    console.log(`📖 Reading text file: ${path}`)
    // Simulate reading large text file
    const simulatedData = Array.from(
      { length: 100000 },
      (_, i) => `Line ${i}: Sample log entry with timestamp ${new Date().toISOString()}`,
    )
    return this.parallelize(simulatedData, minPartitions)
  }

  // Stop Spark context
  stop() {
    console.log("🛑 Stopping Spark Context...")
    console.log("📊 Final Metrics:", this.metrics)
    this.rdds.clear()
  }
}

class RDD {
  constructor(id, data, partitions, sparkContext) {
    this.id = id
    this.data = data
    this.partitions = partitions
    this.sparkContext = sparkContext
    this.dependencies = []
    this.cached = false
    this.storageLevel = null
  }

  // Transformation: Map
  map(func, description = "map operation") {
    console.log(`🔄 Applying map transformation: ${description}`)
    const startTime = Date.now()

    const newData = this.data.map(func)
    const newRDD = new RDD(`${this.id}_map`, newData, this.partitions, this.sparkContext)
    newRDD.dependencies.push(this)

    const duration = Date.now() - startTime
    console.log(`✅ Map completed in ${duration}ms, ${newData.length} records processed`)

    return newRDD
  }

  // Transformation: Filter
  filter(func, description = "filter operation") {
    console.log(`🔍 Applying filter transformation: ${description}`)
    const startTime = Date.now()

    const newData = this.data.filter(func)
    const newRDD = new RDD(`${this.id}_filter`, newData, this.partitions, this.sparkContext)
    newRDD.dependencies.push(this)

    const duration = Date.now() - startTime
    console.log(`✅ Filter completed in ${duration}ms, ${newData.length}/${this.data.length} records passed`)

    return newRDD
  }

  // Transformation: FlatMap
  flatMap(func, description = "flatMap operation") {
    console.log(`🔀 Applying flatMap transformation: ${description}`)
    const startTime = Date.now()

    const newData = this.data.flatMap(func)
    const newRDD = new RDD(`${this.id}_flatMap`, newData, this.partitions, this.sparkContext)
    newRDD.dependencies.push(this)

    const duration = Date.now() - startTime
    console.log(`✅ FlatMap completed in ${duration}ms, ${newData.length} records generated`)

    return newRDD
  }

  // Transformation: ReduceByKey (simulated)
  reduceByKey(func, description = "reduceByKey operation") {
    console.log(`🔄 Applying reduceByKey transformation: ${description}`)
    const startTime = Date.now()

    // Simulate shuffle operation
    console.log("📊 Shuffle phase: Grouping by key...")
    this.sparkContext.metrics.shuffleRead += this.data.length * 0.1
    this.sparkContext.metrics.shuffleWrite += this.data.length * 0.05

    const grouped = {}
    this.data.forEach((item) => {
      if (Array.isArray(item) && item.length === 2) {
        const [key, value] = item
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(value)
      }
    })

    const reduced = Object.entries(grouped).map(([key, values]) => [key, values.reduce(func)])

    const newRDD = new RDD(`${this.id}_reduceByKey`, reduced, this.partitions, this.sparkContext)
    newRDD.dependencies.push(this)

    const duration = Date.now() - startTime
    console.log(`✅ ReduceByKey completed in ${duration}ms, ${reduced.length} unique keys`)

    return newRDD
  }

  // Action: Collect
  collect() {
    console.log(`📥 Collecting RDD ${this.id}...`)
    const startTime = Date.now()

    // Simulate collecting data from all partitions
    console.log(`📦 Collecting from ${this.partitions} partitions...`)

    const result = [...this.data]
    this.sparkContext.metrics.tasksCompleted += this.partitions

    const duration = Date.now() - startTime
    console.log(`✅ Collect completed in ${duration}ms, ${result.length} records collected`)

    return result
  }

  // Action: Count
  count() {
    console.log(`🔢 Counting RDD ${this.id}...`)
    const startTime = Date.now()

    const count = this.data.length
    this.sparkContext.metrics.tasksCompleted += this.partitions

    const duration = Date.now() - startTime
    console.log(`✅ Count completed in ${duration}ms, result: ${count}`)

    return count
  }

  // Action: Take
  take(num) {
    console.log(`📋 Taking ${num} elements from RDD ${this.id}...`)
    const result = this.data.slice(0, num)
    console.log(`✅ Take completed, ${result.length} elements returned`)
    return result
  }

  // Transformation: Cache
  cache() {
    console.log(`💾 Caching RDD ${this.id}...`)
    this.cached = true
    this.storageLevel = "MEMORY_ONLY"
    console.log(`✅ RDD cached in memory`)
    return this
  }

  // Transformation: Persist
  persist(storageLevel = "MEMORY_AND_DISK") {
    console.log(`💾 Persisting RDD ${this.id} with storage level: ${storageLevel}`)
    this.cached = true
    this.storageLevel = storageLevel
    console.log(`✅ RDD persisted`)
    return this
  }
}

// Spark SQL simulation
class SparkSQL {
  constructor(sparkContext) {
    this.sparkContext = sparkContext
    this.tables = new Map()
    console.log("🗃️ Spark SQL initialized")
  }

  createDataFrame(data, schema) {
    const dfId = `df_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const dataFrame = {
      id: dfId,
      data: data,
      schema: schema,
      sparkContext: this.sparkContext,
    }

    console.log(`📊 Created DataFrame ${dfId} with ${data.length} rows`)
    console.log(`📋 Schema:`, schema)

    return dataFrame
  }

  sql(query) {
    console.log(`🔍 Executing SQL query: ${query}`)
    const startTime = Date.now()

    // Simulate SQL execution
    console.log("⚙️ Catalyst Optimizer: Analyzing query...")
    console.log("🔄 Code Generation: Generating optimized code...")
    console.log("📊 Execution: Running query across cluster...")

    const duration = Date.now() - startTime
    console.log(`✅ SQL query completed in ${duration}ms`)

    // Return mock result
    return {
      show: () => console.log("📋 Query results displayed"),
      collect: () => console.log("📥 Query results collected"),
      count: () => console.log("🔢 Query result count calculated"),
    }
  }
}

// Spark Streaming simulation
class SparkStreaming {
  constructor(sparkContext, batchDuration = 2000) {
    this.sparkContext = sparkContext
    this.batchDuration = batchDuration
    this.isRunning = false
    console.log(`🌊 Spark Streaming initialized with batch duration: ${batchDuration}ms`)
  }

  socketTextStream(hostname, port) {
    console.log(`🔌 Creating socket text stream: ${hostname}:${port}`)
    return {
      foreachRDD: (func) => {
        console.log("🔄 Setting up foreachRDD operation...")
        this.processStream(func)
      },
    }
  }

  processStream(func) {
    if (this.isRunning) return

    this.isRunning = true
    console.log("🚀 Starting stream processing...")

    const interval = setInterval(() => {
      // Simulate incoming batch
      const batchData = Array.from(
        { length: Math.floor(Math.random() * 1000) + 100 },
        (_, i) => `Stream record ${i} at ${new Date().toISOString()}`,
      )

      console.log(`📦 Processing batch with ${batchData.length} records...`)
      const rdd = this.sparkContext.parallelize(batchData)
      func(rdd)
    }, this.batchDuration)

    // Stop after demo period
    setTimeout(() => {
      clearInterval(interval)
      this.isRunning = false
      console.log("🛑 Stream processing stopped")
    }, 10000)
  }
}

// Example Spark application
async function runSparkApplication() {
  console.log("🚀 Starting Advanced Spark Application...")

  // Initialize Spark Context
  const sc = new SparkContext("Advanced Big Data Pipeline", "spark://cluster:7077")

  try {
    // Example 1: Word Count (Classic Spark example)
    console.log("\n📖 === WORD COUNT EXAMPLE ===")
    const textRDD = sc.textFile("/data/large-text-file.txt")

    const wordCounts = textRDD
      .flatMap((line) => line.split(" "), "Split lines into words")
      .map((word) => [word.toLowerCase(), 1], "Create word-count pairs")
      .reduceByKey((a, b) => a + b, "Sum counts by word")
      .cache() // Cache for reuse

    const topWords = wordCounts.take(10)
    console.log("🏆 Top 10 words:", topWords)

    // Example 2: Log Analysis
    console.log("\n📊 === LOG ANALYSIS EXAMPLE ===")
    const logRDD = sc.textFile("/logs/access.log")

    const errorLogs = logRDD
      .filter((line) => line.includes("ERROR"), "Filter error logs")
      .map((line) => {
        const parts = line.split(" ")
        return {
          timestamp: parts[0],
          level: parts[1],
          message: parts.slice(2).join(" "),
        }
      }, "Parse log entries")
      .persist("MEMORY_AND_DISK")

    const errorCount = errorLogs.count()
    console.log(`❌ Total errors found: ${errorCount}`)

    // Example 3: Spark SQL
    console.log("\n🗃️ === SPARK SQL EXAMPLE ===")
    const sqlContext = new SparkSQL(sc)

    const salesData = [
      { product: "laptop", category: "electronics", price: 1200, quantity: 5 },
      { product: "phone", category: "electronics", price: 800, quantity: 10 },
      { product: "book", category: "education", price: 25, quantity: 100 },
    ]

    const salesDF = sqlContext.createDataFrame(salesData, ["product", "category", "price", "quantity"])

    sqlContext.sql(`
      SELECT category, 
             SUM(price * quantity) as total_revenue,
             AVG(price) as avg_price
      FROM sales 
      GROUP BY category 
      ORDER BY total_revenue DESC
    `)

    // Example 4: Spark Streaming
    console.log("\n🌊 === SPARK STREAMING EXAMPLE ===")
    const ssc = new SparkStreaming(sc, 2000)

    const stream = ssc.socketTextStream("localhost", 9999)
    stream.foreachRDD((rdd) => {
      const count = rdd.count()
      if (count > 0) {
        console.log(`📊 Processed ${count} streaming records`)

        // Process streaming data
        const processed = rdd
          .filter((record) => record.includes("important"), "Filter important records")
          .map(
            (record) => ({
              data: record,
              processed_at: new Date().toISOString(),
            }),
            "Add processing timestamp",
          )

        const results = processed.take(5)
        console.log("🔍 Sample processed records:", results)
      }
    })

    // Example 5: Machine Learning with MLlib (simulated)
    console.log("\n🤖 === MLLIB EXAMPLE ===")
    const features = Array.from({ length: 1000 }, () => [
      Math.random() * 100, // feature 1
      Math.random() * 50, // feature 2
      Math.random() * 25, // feature 3
    ])

    const featuresRDD = sc.parallelize(features)
    console.log("🧠 Training machine learning model...")
    console.log("📊 Feature extraction completed")
    console.log("🎯 Model training completed")
    console.log("✅ Model evaluation: Accuracy 94.2%")
  } catch (error) {
    console.error("❌ Spark application error:", error)
  } finally {
    // Clean up
    sc.stop()
  }
}

// Run the Spark application
runSparkApplication().catch(console.error)
