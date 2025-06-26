// Simulate data ingestion from multiple sources
const dataSources = [
  { name: "User Events", endpoint: "/api/events", recordsPerBatch: 1000 },
  { name: "Transaction Logs", endpoint: "/api/transactions", recordsPerBatch: 500 },
  { name: "System Metrics", endpoint: "/api/metrics", recordsPerBatch: 2000 },
  { name: "Social Media Feed", endpoint: "/api/social", recordsPerBatch: 1500 },
]

function generateSampleData(source, batchSize) {
  const data = []
  const now = new Date()

  for (let i = 0; i < batchSize; i++) {
    switch (source.name) {
      case "User Events":
        data.push({
          id: `evt_${Date.now()}_${i}`,
          userId: `user_${Math.floor(Math.random() * 10000)}`,
          event: ["click", "view", "purchase", "signup"][Math.floor(Math.random() * 4)],
          timestamp: new Date(now.getTime() - Math.random() * 86400000),
          metadata: { page: `/page${Math.floor(Math.random() * 10)}` },
        })
        break
      case "Transaction Logs":
        data.push({
          id: `txn_${Date.now()}_${i}`,
          amount: Math.random() * 1000,
          currency: ["USD", "EUR", "GBP"][Math.floor(Math.random() * 3)],
          status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)],
          timestamp: new Date(now.getTime() - Math.random() * 86400000),
        })
        break
      case "System Metrics":
        data.push({
          id: `metric_${Date.now()}_${i}`,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          timestamp: new Date(now.getTime() - Math.random() * 3600000),
        })
        break
      case "Social Media Feed":
        data.push({
          id: `social_${Date.now()}_${i}`,
          platform: ["twitter", "facebook", "instagram"][Math.floor(Math.random() * 3)],
          sentiment: Math.random() * 2 - 1, // -1 to 1
          engagement: Math.floor(Math.random() * 1000),
          timestamp: new Date(now.getTime() - Math.random() * 86400000),
        })
        break
    }
  }
  return data
}

async function ingestData() {
  console.log("🚀 Starting data ingestion pipeline...")

  const results = []

  for (const source of dataSources) {
    console.log(`📥 Ingesting data from ${source.name}...`)

    const startTime = Date.now()
    const data = generateSampleData(source, source.recordsPerBatch)
    const endTime = Date.now()

    const result = {
      source: source.name,
      recordsProcessed: data.length,
      processingTime: endTime - startTime,
      status: "success",
      timestamp: new Date().toISOString(),
    }

    results.push(result)
    console.log(`✅ ${source.name}: ${data.length} records processed in ${result.processingTime}ms`)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log("🎉 Data ingestion completed!")
  console.log("Summary:", results)

  return results
}

// Run the ingestion
ingestData().catch(console.error)
