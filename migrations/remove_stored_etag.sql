-- migrations/remove_stored_etag.sql

-- Drop index if it exists
DROP INDEX IF EXISTS idx_sheets_stored_etag;

-- Drop the column
ALTER TABLE sheets DROP COLUMN IF EXISTS stored_etag;

-- Add comment to track migration
COMMENT ON TABLE sheets IS 'Removed stored_etag column on 2024-11-19';