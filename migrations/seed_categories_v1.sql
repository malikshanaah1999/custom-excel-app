-- migrations/seed_categories_v1.sql

-- Insert initial data for product_categories
INSERT INTO product_categories (name) VALUES
    ('All / بهار'),
    ('All / خضار طازجة'),
    ('All / ديلي'),
    ('All / فواكه طازجة'),
    ('All / ماركت'),
    ('All / مبردات'),
    ('All / مخبز'),
    ('All / مستهلكات'),
    ('All / مسمكة'),
    ('All / معلبات'),
    ('All / مفرزات'),
    ('All / ملحمة طازج'),
    ('All / ملحمة مبرد'),
    ('All / ملحمة مجمد'),
    ('All / منظفات');

-- Insert initial data for measurement_units
INSERT INTO measurement_units (name) VALUES
    ('حبة'),
    ('ربطة'),
    ('دزينة'),
    ('كرتونة'),
    ('شوال'),
    ('سطل');

-- Insert initial data for product_sources
INSERT INTO product_sources (name) VALUES
    ('مورد داخلي'),
    ('مورد إسرائيل'),
    ('مورد خارجي'),
    ('استيراد');

-- Insert classifications for "All / ماركت"
WITH market_category AS (
    SELECT id FROM product_categories WHERE name = 'All / ماركت'
)
INSERT INTO classifications (name, category_id)
SELECT value, market_category.id
FROM market_category, unnest(ARRAY[
    'زيوت', 'ارز', 'سكر', 'ملح', 'سمن', 'طحين', 'سردين', 'تونة',
    'حليب مجفف', 'طحينة', 'حلاوة', 'معكرونة', 'نودلز', 'عصائر',
    'مشروبات ساخنة', 'مشروبات غازية', 'مياه معدنية', 'مشروبات طاقة',
    'شاي', 'قهوة', 'اسبرسو', 'مخللات', 'كاتشاب', 'ميونيز',
    'رانش/صوص', 'شيبس', 'حبوب كورنفلكس', 'ايس كريم', 'مربى',
    'عسل', 'علكة', 'سكاكر', 'دخان', 'بقوليات مبكت', 'صلصة بندورة',
    'معلبات', 'اغذية قابلة للدهن', 'تحضير حلويات', 'فواكة معلبة',
    'خليط كيك', 'طعام اطفال', 'فواكة مجففة', 'ويفر', 'بسكوت',
    'شوكولاتة', 'كراكر', 'sugar free', 'gluten free',
    'fitness bars food', 'مكسرات', 'زيتون'
]) AS value;

-- Insert classifications for "All / مفرزات"
WITH freezer_category AS (
    SELECT id FROM product_categories WHERE name = 'All / مفرزات'
)
INSERT INTO classifications (name, category_id)
SELECT value, freezer_category.id
FROM freezer_category, unnest(ARRAY[
    'اسماك مفرزة', 'اغذية بحرية مفرزة', 'خضار مفرزة', 'برجر مفرز',
    'عجائن مفرزة', 'بوريكس', 'دجاج بقسماط مفرز', 'فواكة مفرزة',
    'فطائر مفرزة', 'بطاطا مفرزة', 'كبة', 'اطعمة مفرزة'
]) AS value;

-- Insert product_classification_tags for "All / ماركت"
WITH market_category AS (
    SELECT id FROM product_categories WHERE name = 'All / ماركت'
)
INSERT INTO product_classification_tags (name, category_id)
SELECT value, market_category.id
FROM market_category, unnest(ARRAY[
    'زيت ذرة', 'زيت شمس', 'جرانولا', 'زيت زيتون', 'ارز حبة طويلة',
    'ارز حبة قصيرة', 'ارز حبة مدور', 'ارز مطحون', 'سكر ابيض',
    'سكر بني', 'سكر مطحون', 'ملح ابيض', 'ملح خشن', 'ملح نكهات',
    'ملح زهري', 'سمن نباتي', 'سمن حيواني', 'سمن بلدي', 'سمن حلوب',
    'طحين ابيض', 'طحين بلدي', 'طحين فري جلوتين', 'طحين كيك', 'حلو',
    'حار', 'ذرة حلو', 'ذرة حار', 'قليل السم', 'كامل الدسم', 'سادة',
    'شوكولاتة', 'فانيلا', 'حلاوة مكسرات', 'حلاوة شعر', 'حلاوة دهن',
    'معكرونة سباجيتي', 'معكرونة كوع', 'معكرونة ماسورة', 'معكرونة اصابع',
    'معكرونة دبوكي', 'اندومي', 'ليمون', 'برتقال', 'مانجا', 'فيمتو',
    'تانك', 'الزهراء', 'نسكافية', 'مبيض', 'شوكو', 'نسكافية جولد',
    'كابتشينو', 'كوكا كولا', 'سبرايت', 'فانتا', 'بيبسي', 'ميرندا',
    'سفن اب', 'سما', 'ماتركس', 'تشات كولا', 'عبواة', 'قاروة', 'كاسات',
    'XL', 'هايبي', 'هوبي', 'بلو', 'ريد بول', 'باور هورس', 'شاي عادي',
    'نكهات', 'حلل', 'شقراء', 'نص بنص', 'محروقة', 'خليجية', 'كبسولات',
    'حبوب اسبرسو', 'خيار', 'زيتون حب', 'زيتون بدون نوى', 'باذنجان',
    'فلفل', 'كلاسيك', 'باربكيو', 'صويا صوص', 'سيزر', 'ليز', 'دوريتوز',
    'ماستر شيبس', 'بيوجليز', 'برينجلز', 'بطاطا طبيعي', 'نستلي',
    'كونفلكس الديك', 'سيريال', 'حبات', 'علب', 'تين', 'فراولة', 'مشمش',
    'صدر', 'طبيعي', 'ملكات', 'اوربت', 'سهم', 'ستيميرول', 'جوم',
    'ملبس', 'مصاص', 'نوجا', 'سجائر', 'سجائر الكترونية', 'معسل', 'تمباك',
    'ايكوس', 'عدس حب', 'بوشار', 'لوبيا', 'برغل', 'عدس مجروش',
    'صلصة بندورة', 'ذرة', 'فاصوليا بيضاء', 'فاصوليا حمراء', 'بازيلا',
    'ورق عنب', 'لحوم معلبة', 'حمص حب', 'حمص مسلوق', 'حمص مطحون',
    'فول مدمس', 'شوربة سريعة التحضير', 'زينة الحلويات', 'زبدة فول سوداني',
    'زبدة فستق حلبي', 'زبدة البندق', 'قشطة حلويات', 'حليب مبخر',
    'حليب مكثف', 'باكينج باودر', 'فانيلا سائل', 'اناناس مقطع',
    'اناناس شرائح', 'سلطة فواكة', 'كرز', 'بلاك بيري', 'بلو بيري',
    'كيك', 'موس', 'بان كيك', 'خليط عواة', 'دونات', 'طعام اطفال',
    'حليب اطفال', 'كيوي', 'جارينا', 'علي بابا', 'ماري', 'ليدي فنجر',
    'الواح', 'بار', 'دايت', 'دارك', 'مملح', 'نكهات', 'بيجلا', 'بزر بطيخ',
    'بزر شمس', 'فستق عبيد', 'كاجو', 'فستق حلبي'
]) AS value;

-- Insert product_classification_tags for "All / مفرزات"
WITH freezer_category AS (
    SELECT id FROM product_categories WHERE name = 'All / مفرزات'
)
INSERT INTO product_classification_tags (name, category_id)
SELECT value, freezer_category.id
FROM freezer_category, unnest(ARRAY[
    'سمك بكلا', 'سمك فيله', 'سمك سلمون', 'جمبري اسود', 'جمبري احمر',
    'بازيلا مع جزر', 'بازيلا', 'خضار', 'بروكلي', 'فول صويا',
    'بيف برجر', 'تشكن برجر', 'عجينة سمبوسك', 'باف بيستري', 'عجينة بقلاوة',
    'جبنة', 'لحمة', 'بطاطا', 'سكالوب', 'كرسبي', 'اجنحة دجاج', 'نبوت',
    'ناجتس', 'مانجا', 'فراولة', 'بلاك بيري', 'بلو بيري', 'كيوي', 'بيتزا',
    'اقراص زعتر', 'ستيك', 'اصابع', 'ودجيز', 'كيري', 'سمايل',
    'كبة لحمة', 'كبة رز', 'كبة دجاج', 'كبة طازجة', 'كباب', 'ششبرك', 'مفتول'
]) AS value;