-- migrations/update_schema_v4.sql
-- Create dropdown_options table
CREATE TABLE IF NOT EXISTS dropdown_options (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_dropdown_category ON dropdown_options(category);

-- Insert initial data for dropdowns
INSERT INTO dropdown_options (category, value) VALUES
-- Category options
('category', 'All'),
('category', 'غذائية'),
('category', 'مشروبات غازية'),

-- وحدة القياس options
('وحدة القياس', 'حبة'),
('وحدة القياس', 'كرتونة'),
('وحدة القياس', 'صندوق'),

-- التصنيف options
('التصنيف', 'زيت'),
('التصنيف', 'سيريلاك'),
('التصنيف', 'كوكاكولا'),

-- مصدر المنتج options
('مصدر المنتج', 'مورد محلي'),
('مصدر المنتج', 'مستورد');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_dropdown_options_updated_at
    BEFORE UPDATE ON dropdown_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();