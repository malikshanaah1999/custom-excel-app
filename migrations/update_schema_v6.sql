-- migrations/update_schema_v6.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS product_classification_tags CASCADE;
DROP TABLE IF EXISTS classifications CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS measurement_units CASCADE;
DROP TABLE IF EXISTS product_sources CASCADE;

-- Create product_categories table
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classifications table
CREATE TABLE classifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_classification_tags table
CREATE TABLE product_classification_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create measurement_units table
CREATE TABLE measurement_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_sources table
CREATE TABLE product_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better performance
CREATE INDEX idx_classifications_category ON classifications(category_id);
CREATE INDEX idx_product_tags_category ON product_classification_tags(category_id);

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_product_categories_timestamp
    BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_classifications_timestamp
    BEFORE UPDATE ON classifications
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_classification_tags_timestamp
    BEFORE UPDATE ON product_classification_tags
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_measurement_units_timestamp
    BEFORE UPDATE ON measurement_units
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_sources_timestamp
    BEFORE UPDATE ON product_sources
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
