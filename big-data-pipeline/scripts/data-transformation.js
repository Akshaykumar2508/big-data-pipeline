// Data transformation pipeline simulating Spark-like operations
class DataTransformer {
  constructor() {
    this.transformations = []
    this.metrics = {
      recordsProcessed: 0,
      transformationsApplied: 0,
      errors: 0,
      startTime: null,
      endTime: null,
    }
  }

  // Simulate Spark's map operation
  map(transformFn, description) {
    this.transformations.push({
      type: "map",
      fn: transformFn,
      description,
    })
    return this
  }

  // Simulate Spark's filter operation
  filter(filterFn, description) {
    this.transformations.push({
      type: "filter",
      fn: filterFn,
      description,
    })
    return this
  }

  // Simulate Spark's reduce operation
  reduce(reduceFn, description) {
    this.transformations.push({
      type: "reduce",
      fn: reduceFn,
      description,
    })
    return this
  }

  // Simulate Spark's groupBy operation
  groupBy(keyFn, description) {
    this.transformations.push({
      type: "groupBy",
      fn: keyFn,
      description,
    })
    return this
  }

  async execute(inputData) {
    console.log("🔄 Starting data transformation pipeline...")
    this.metrics.startTime = Date.now()

    let data = [...inputData]

    for (const transformation of this.transformations) {
      console.log(`⚙️  Applying ${transformation.type}: ${transformation.description}`)

      try {
        switch (transformation.type) {
          case "map":
            data = data.map(transformation.fn)
            break
          case "filter":
            data = data.filter(transformation.fn)
            break
          case "reduce":
            data = [data.reduce(transformation.fn)]
            break
          case "groupBy":
            const grouped = {}
            data.forEach((item) => {
              const key = transformation.fn(item)
              if (!grouped[key]) grouped[key] = []
              grouped[key].push(item)
            })
            data = Object.entries(grouped).map(([key, items]) => ({ key, items, count: items.length }))
            break
        }

        this.metrics.transformationsApplied++
        console.log(`✅ Transformation completed. Records: ${Array.isArray(data) ? data.length : 1}`)

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`❌ Error in ${transformation.type}:`, error.message)
        this.metrics.errors++
      }
    }

    this.metrics.recordsProcessed = Array.isArray(data) ? data.length : 1
    this.metrics.endTime = Date.now()

    console.log("🎉 Data transformation completed!")
    console.log("Metrics:", this.metrics)

    return {
      data,
      metrics: this.metrics,
    }
  }
}

// Example transformation pipeline
async function runTransformationPipeline() {
  // Generate sample e-commerce data
  const sampleData = Array.from({ length: 10000 }, (_, i) => ({
    orderId: `order_${i}`,
    customerId: `customer_${Math.floor(Math.random() * 1000)}`,
    amount: Math.random() * 500 + 10,
    category: ["electronics", "clothing", "books", "home"][Math.floor(Math.random() * 4)],
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    status: ["completed", "pending", "cancelled"][Math.floor(Math.random() * 3)],
  }))

  const transformer = new DataTransformer()

  const result = await transformer
    .filter((order) => order.status === "completed", "Filter completed orders only")
    .map(
      (order) => ({
        ...order,
        revenue: order.amount * 0.1, // 10% commission
        month: order.timestamp.getMonth(),
      }),
      "Calculate revenue and extract month",
    )
    .filter((order) => order.amount > 50, "Filter high-value orders (>$50)")
    .groupBy((order) => order.category, "Group by product category")
    .execute(sampleData)

  return result
}

// Run the transformation
runTransformationPipeline().catch(console.error)
