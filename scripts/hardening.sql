-- SQL for 'Mighty' Dashboard Hardening
-- Run this in your Supabase SQL Editor to ensure schema parity.

-- 1. Create Property Unit Types (Models)
CREATE TABLE IF NOT EXISTS public.property_unit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    beds INTEGER DEFAULT 0,
    baths NUMERIC DEFAULT 0,
    sqm NUMERIC DEFAULT 0,
    price_from NUMERIC DEFAULT 0,
    type_image TEXT,
    total_units INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Individual Property Units (Inventory)
CREATE TABLE IF NOT EXISTS public.property_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_number TEXT,
    floor_number INTEGER,
    status TEXT DEFAULT 'available', -- available, reserved, sold
    price NUMERIC,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Property Progress Tracking
CREATE TABLE IF NOT EXISTS public.property_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    stage_name TEXT,
    label TEXT,
    percent INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'under-construction',
    status_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Visitors Table for Analytics
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country TEXT,
    country_code TEXT,
    city TEXT,
    region TEXT,
    lat NUMERIC,
    lng NUMERIC,
    device_type TEXT,
    browser TEXT,
    traffic_source TEXT DEFAULT 'direct',
    path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Extend Meta-Tables with Modern Metrics
DO $$ 
BEGIN 
    -- Properties Extensions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='air_quality_index') THEN
        ALTER TABLE public.properties ADD COLUMN air_quality_index INTEGER DEFAULT 50;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='env_risk_level') THEN
        ALTER TABLE public.properties ADD COLUMN env_risk_level TEXT DEFAULT 'Low';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='urban_heat_index') THEN
        ALTER TABLE public.properties ADD COLUMN urban_heat_index INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='downpayment_percentage') THEN
        ALTER TABLE public.properties ADD COLUMN downpayment_percentage INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_percentage') THEN
        ALTER TABLE public.properties ADD COLUMN discount_percentage INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='payment_schedule') THEN
        ALTER TABLE public.properties ADD COLUMN payment_schedule TEXT DEFAULT 'Flexible Terms';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='tenure_type') THEN
        ALTER TABLE public.properties ADD COLUMN tenure_type TEXT DEFAULT 'Freehold';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='parking_spots') THEN
        ALTER TABLE public.properties ADD COLUMN parking_spots INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='virtual_tour_url') THEN
        ALTER TABLE public.properties ADD COLUMN virtual_tour_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='total_sqm') THEN
        ALTER TABLE public.properties ADD COLUMN total_sqm NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='completion_date') THEN
        ALTER TABLE public.properties ADD COLUMN completion_date TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='property_type') THEN
        ALTER TABLE public.properties ADD COLUMN property_type TEXT DEFAULT 'Apartment';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='loan_percentage') THEN
        ALTER TABLE public.properties ADD COLUMN loan_percentage NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_conditions') THEN
        ALTER TABLE public.properties ADD COLUMN discount_conditions TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_rules') THEN
        ALTER TABLE public.properties ADD COLUMN discount_rules JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Unit Types Extensions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_unit_types' AND column_name='amenities') THEN
        ALTER TABLE public.property_unit_types ADD COLUMN amenities TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_unit_types' AND column_name='discount_rules') THEN
        ALTER TABLE public.property_unit_types ADD COLUMN discount_rules JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_unit_types' AND column_name='payment_schedule') THEN
        ALTER TABLE public.property_unit_types ADD COLUMN payment_schedule TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_unit_types' AND column_name='downpayment_percentage') THEN
        ALTER TABLE public.property_unit_types ADD COLUMN downpayment_percentage INTEGER DEFAULT 0;
    END IF;

    -- Property Units Extensions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='unit_type_id') THEN
        ALTER TABLE public.property_units ADD COLUMN unit_type_id UUID REFERENCES public.property_unit_types(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='discount_rules') THEN
        ALTER TABLE public.property_units ADD COLUMN discount_rules JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='payment_schedule') THEN
        ALTER TABLE public.property_units ADD COLUMN payment_schedule TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='downpayment_percentage') THEN
        ALTER TABLE public.property_units ADD COLUMN downpayment_percentage INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='availability_date') THEN
        ALTER TABLE public.property_units ADD COLUMN availability_date TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='unit_number') THEN
        ALTER TABLE public.property_units ADD COLUMN unit_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='floor_number') THEN
        ALTER TABLE public.property_units ADD COLUMN floor_number INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='status') THEN
        ALTER TABLE public.property_units ADD COLUMN status TEXT DEFAULT 'available';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='notes') THEN
        ALTER TABLE public.property_units ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='image_url') THEN
        ALTER TABLE public.property_units ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='view_type') THEN
        ALTER TABLE public.property_units ADD COLUMN view_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='balcony_sqm') THEN
        ALTER TABLE public.property_units ADD COLUMN balcony_sqm NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_units' AND column_name='is_furnished') THEN
        ALTER TABLE public.property_units ADD COLUMN is_furnished BOOLEAN DEFAULT false;
    END IF;

    -- Campaigns Extensions (for campaign redux / repeat)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='body') THEN
        ALTER TABLE public.campaigns ADD COLUMN body TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='target_filter') THEN
        ALTER TABLE public.campaigns ADD COLUMN target_filter TEXT;
    END IF;
END $$;

-- 5. Enable RLS and Policies
ALTER TABLE public.property_unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_progress ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Allow public read" ON public.property_unit_types;
    DROP POLICY IF EXISTS "Allow public read" ON public.property_units;
    DROP POLICY IF EXISTS "Allow public read" ON public.property_progress;
    DROP POLICY IF EXISTS "Allow authenticated full access" ON public.property_unit_types;
    DROP POLICY IF EXISTS "Allow authenticated full access" ON public.property_units;
    DROP POLICY IF EXISTS "Allow authenticated full access" ON public.property_progress;
END $$;

CREATE POLICY "Allow public read" ON public.property_unit_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.property_units FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.property_progress FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access" ON public.property_unit_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON public.property_units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON public.property_progress FOR ALL USING (auth.role() = 'authenticated');

-- 6. Storage Policies
-- Note: storage.buckets and storage.objects are in the 'storage' schema
-- Ensure the storage buckets exist (API might fail, so SQL is fallback)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-assets', 'property-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-assets', 'media-assets', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
END $$;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('property-assets', 'media-assets'));
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('property-assets', 'media-assets'));
