-- Create database schema for the big data pipeline
-- This simulates the data warehouse structure

-- Raw data ingestion table
CREATE TABLE IF NOT EXISTS raw_events (
    id VARCHAR(255) PRIMARY KEY,
    source_system VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Processed events table
CREATE TABLE IF NOT EXISTS processed_events (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    timestamp TIMESTAMP NOT NULL,
    metadata JSON,
    quality_score DECIMAL(3,2),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data quality metrics table
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL,
    total_records INTEGER NOT NULL,
    valid_records INTEGER NOT NULL,
    invalid_records INTEGER NOT NULL,
    quality_score DECIMAL(5,2) NOT NULL,
    issues JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline execution logs
CREATE TABLE IF NOT EXISTS pipeline_executions (
    id SERIAL PRIMARY KEY,
    pipeline_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    records_processed INTEGER,
    processing_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    metadata JSON
);

-- Aggregated analytics table
CREATE TABLE IF NOT EXISTS daily_analytics (
    date DATE PRIMARY KEY,
    total_events INTEGER NOT NULL,
    unique_users INTEGER NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    avg_processing_time_ms INTEGER NOT NULL,
    error_rate DECIMAL(5,4) NOT NULL,
    quality_score DECIMAL(5,2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raw_events_source ON raw_events(source_system);
CREATE INDEX IF NOT EXISTS idx_raw_events_processed ON raw_events(processed);
CREATE INDEX IF NOT EXISTS idx_processed_events_timestamp ON processed_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_processed_events_user ON processed_events(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_status ON pipeline_executions(status);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);

-- Insert sample data for demonstration
INSERT INTO pipeline_executions (pipeline_name, status, records_processed, processing_time_ms, started_at, completed_at) VALUES
('data-ingestion', 'completed', 15000, 2300, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '58 minutes'),
('data-transformation', 'completed', 14750, 3200, NOW() - INTERVAL '58 minutes', NOW() - INTERVAL '55 minutes'),
('data-quality-check', 'completed', 14750, 1800, NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '53 minutes'),
('data-aggregation', 'running', 12000, NULL, NOW() - INTERVAL '10 minutes', NULL);

INSERT INTO data_quality_metrics (batch_id, total_records, valid_records, invalid_records, quality_score) VALUES
('batch_001', 15000, 14750, 250, 98.33),
('batch_002', 12500, 12100, 400, 96.80),
('batch_003', 18000, 17650, 350, 98.06);

INSERT INTO daily_analytics (date, total_events, unique_users, total_revenue, avg_processing_time_ms, error_rate, quality_score) VALUES
(CURRENT_DATE - INTERVAL '1 day', 2400000, 45000, 125000.50, 1200, 0.015, 98.2),
(CURRENT_DATE - INTERVAL '2 days', 2100000, 42000, 118000.25, 1350, 0.018, 97.8),
(CURRENT_DATE - INTERVAL '3 days', 2600000, 48000, 135000.75, 1100, 0.012, 98.5);
