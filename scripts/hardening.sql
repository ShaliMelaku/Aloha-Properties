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
    percent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'under-construction',
    status_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Extend Properties with Modern Metrics
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='air_quality_index') THEN
        ALTER TABLE public.properties ADD COLUMN air_quality_index INTEGER DEFAULT 50;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='env_risk_level') THEN
        ALTER TABLE public.properties ADD COLUMN env_risk_level TEXT DEFAULT 'Low';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='urban_heat_index') THEN
        ALTER TABLE public.properties ADD COLUMN urban_heat_index INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_percentage') THEN
        ALTER TABLE public.properties ADD COLUMN discount_percentage INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='downpayment_percentage') THEN
        ALTER TABLE public.properties ADD COLUMN downpayment_percentage INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='completion_date') THEN
        ALTER TABLE public.properties ADD COLUMN completion_date TEXT;
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
