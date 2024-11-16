-- migrations/seed_dropdown_options.sql
INSERT INTO dropdown_options (category, value) 
SELECT d.category, d.value
FROM (
    VALUES
        ('category', 'All'),
        ('category', 'غذائية'),
        ('category', 'مشروبات غازية'),
        ('وحدة القياس', 'حبة'),
        ('وحدة القياس', 'كرتونة'),
        ('وحدة القياس', 'صندوق'),
        ('التصنيف', 'زيت'),
        ('التصنيف', 'سيريلاك'),
        ('التصنيف', 'كوكاكولا'),
        ('مصدر المنتج', 'مورد محلي'),
        ('مصدر المنتج', 'مستورد')
) AS d(category, value)
WHERE NOT EXISTS (
    SELECT 1 
    FROM dropdown_options 
    WHERE category = d.category AND value = d.value
);