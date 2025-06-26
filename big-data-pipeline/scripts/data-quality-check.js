// Data quality validation pipeline
class DataQualityChecker {
  constructor() {
    this.rules = []
    this.results = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      qualityScore: 0,
      issues: [],
    }
  }

  addRule(name, checkFn, severity = "error") {
    this.rules.push({ name, checkFn, severity })
    return this
  }

  async validateDataset(data) {
    console.log("🔍 Starting data quality validation...")

    this.results.totalRecords = data.length
    let validCount = 0

    for (let i = 0; i < data.length; i++) {
      const record = data[i]
      let recordValid = true

      for (const rule of this.rules) {
        try {
          const isValid = rule.checkFn(record)
          if (!isValid) {
            recordValid = false
            this.results.issues.push({
              recordIndex: i,
              rule: rule.name,
              severity: rule.severity,
              record: record,
            })
          }
        } catch (error) {
          recordValid = false
          this.results.issues.push({
            recordIndex: i,
            rule: rule.name,
            severity: "error",
            error: error.message,
            record: record,
          })
        }
      }

      if (recordValid) validCount++
    }

    this.results.validRecords = validCount
    this.results.invalidRecords = this.results.totalRecords - validCount
    this.results.qualityScore = (validCount / this.results.totalRecords) * 100

    console.log("📊 Data Quality Results:")
    console.log(`Total Records: ${this.results.totalRecords}`)
    console.log(`Valid Records: ${this.results.validRecords}`)
    console.log(`Invalid Records: ${this.results.invalidRecords}`)
    console.log(`Quality Score: ${this.results.qualityScore.toFixed(2)}%`)
    console.log(`Issues Found: ${this.results.issues.length}`)

    return this.results
  }
}

// Example usage
async function runDataQualityCheck() {
  const sampleData = [
    { id: 1, email: "user@example.com", age: 25, salary: 50000 },
    { id: 2, email: "invalid-email", age: -5, salary: null },
    { id: 3, email: "user3@test.com", age: 30, salary: 75000 },
    { id: 4, email: "", age: 150, salary: -1000 },
    { id: 5, email: "user5@domain.com", age: 28, salary: 60000 },
  ]

  const checker = new DataQualityChecker()

  const results = await checker
    .addRule("Valid Email", (record) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email))
    .addRule("Positive Age", (record) => record.age > 0 && record.age < 120)
    .addRule("Valid Salary", (record) => record.salary !== null && record.salary >= 0)
    .addRule("Required ID", (record) => record.id !== null && record.id !== undefined)
    .validateDataset(sampleData)

  return results
}

// Run the quality check
runDataQualityCheck().catch(console.error)
