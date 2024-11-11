-- migrations/update_schema_v2.sql

-- First, remove existing indices temporarily
DROP INDEX IF EXISTS idx_sheets_name;
DROP INDEX IF EXISTS idx_sheets_updated_at;

-- Add constraint to ensure name is not empty
ALTER TABLE sheets 
ADD CONSTRAINT sheets_name_not_empty CHECK (name != '' AND name IS NOT NULL);

-- Update any existing empty names to default value
UPDATE sheets 
SET name = 'Untitled Sheet' 
WHERE name IS NULL OR name = '';

-- Recreate indices for better performance
CREATE INDEX idx_sheets_name ON sheets(name);
CREATE INDEX idx_sheets_updated_at ON sheets(updated_at);

-- Add comment to track migration
COMMENT ON TABLE sheets IS 'Updated with name validation on 2024-11-11';