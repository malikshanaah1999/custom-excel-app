-- migrations/update_schema_v3.sql

-- Update duplicate names by adding ID to them
UPDATE sheets s
SET name = s.name || ' ' || s.id
WHERE s.name IN (
    SELECT name
    FROM sheets
    GROUP BY name
    HAVING COUNT(*) > 1
);

-- Now add the unique constraint
ALTER TABLE sheets 
ADD CONSTRAINT unique_sheet_name UNIQUE (name);