-- migrations/update_schema_v5.sql

-- Safely add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name='sheets' 
                  AND column_name='stored_etag') THEN
        ALTER TABLE sheets ADD COLUMN stored_etag VARCHAR(64);
    END IF;
END $$;

-- Drop index if it exists and recreate it
DROP INDEX IF EXISTS idx_sheets_stored_etag;
CREATE INDEX idx_sheets_stored_etag ON sheets(stored_etag);

-- Update existing records with calculated etags where they're NULL
DO $$
DECLARE
    batch_size INTEGER := 1000;
    total_rows INTEGER;
    processed_rows INTEGER := 0;
BEGIN
    -- Get total number of rows that need updating
    SELECT COUNT(*) INTO total_rows 
    FROM sheets 
    WHERE stored_etag IS NULL;
    
    RAISE NOTICE 'Found % rows to update', total_rows;
    
    WHILE processed_rows < total_rows LOOP
        -- Update in batches
        WITH batch AS (
            SELECT id, data
            FROM sheets
            WHERE stored_etag IS NULL
            LIMIT batch_size
            FOR UPDATE
        )
        UPDATE sheets s
        SET stored_etag = encode(
            sha256(
                CASE 
                    WHEN b.data IS NULL THEN ''
                    ELSE b.data::text
                END::bytea
            ), 'hex'
        )
        FROM batch b
        WHERE s.id = b.id;
        
        GET DIAGNOSTICS processed_rows = ROW_COUNT;
        RAISE NOTICE 'Processed % rows', processed_rows;
        
        -- Commit each batch
        COMMIT;
        
        -- Small delay between batches
        PERFORM pg_sleep(0.1);
    END LOOP;
END $$;