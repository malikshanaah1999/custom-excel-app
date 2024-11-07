-- Run this to update existing database
ALTER TABLE sheets 
ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Untitled Sheet',
ADD COLUMN description TEXT,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN record_count INTEGER DEFAULT 0;

-- Add indices for better performance
CREATE INDEX idx_sheets_name ON sheets(name);
CREATE INDEX idx_sheets_updated_at ON sheets(updated_at);