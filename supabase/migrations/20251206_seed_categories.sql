-- Add unique constraints to ensure ON CONFLICT works
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subcategories_name_category_id_key') THEN
        ALTER TABLE public.subcategories ADD CONSTRAINT subcategories_name_category_id_key UNIQUE (name, category_id);
    END IF;
END $$;

-- Seed Categories and Subcategories

-- Function to insert category and its subcategories
CREATE OR REPLACE FUNCTION seed_category_with_subcategories(
    cat_name TEXT,
    subcat_names TEXT[]
) RETURNS VOID AS $$
DECLARE
    cat_id UUID;
    subcat_name TEXT;
BEGIN
    -- Insert Category if not exists
    INSERT INTO public.categories (name)
    VALUES (cat_name)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    -- If category already existed, get its ID
    IF cat_id IS NULL THEN
        SELECT id INTO cat_id FROM public.categories WHERE name = cat_name;
    END IF;

    -- Insert Subcategories
    FOREACH subcat_name IN ARRAY subcat_names
    LOOP
        INSERT INTO public.subcategories (name, category_id)
        VALUES (subcat_name, cat_id)
        ON CONFLICT (name, category_id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Seed Data
SELECT seed_category_with_subcategories('Office Chairs', ARRAY['Ergonomic Chairs', 'Executive Chairs', 'Task Chairs', 'Conference Chairs']);
SELECT seed_category_with_subcategories('Desks', ARRAY['Standing Desks', 'Executive Desks', 'Computer Desks', 'L-Shaped Desks']);
SELECT seed_category_with_subcategories('Storage', ARRAY['Filing Cabinets', 'Bookshelves', 'Credenzas', 'Lockers']);
SELECT seed_category_with_subcategories('Conference', ARRAY['Conference Tables', 'Conference Chairs', 'Whiteboards', 'Presentation Carts']);
SELECT seed_category_with_subcategories('Reception', ARRAY['Reception Desks', 'Guest Seating', 'Coffee Tables', 'Magazine Racks']);
SELECT seed_category_with_subcategories('Accessories', ARRAY['Lighting', 'Monitor Arms', 'Chair Mats', 'Cable Management']);

-- Drop the helper function
DROP FUNCTION seed_category_with_subcategories(TEXT, TEXT[]);
