-- SQL for 'Mighty' Dashboard Hardening
-- Run this in your Supabase SQL Editor if you see table errors.

-- 1. Create Property Unit Types (Missing)
CREATE TABLE IF NOT EXISTS public.property_unit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    beds INTEGER DEFAULT 0,
    baths INTEGER DEFAULT 0,
    sqm NUMERIC DEFAULT 0,
    price_from NUMERIC DEFAULT 0,
    type_image TEXT,
    total_units INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Property Progress (Missing)
CREATE TABLE IF NOT EXISTS public.property_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    stage_name TEXT,
    percent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'under-construction',
    status_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Extend Properties with ESG and Financial Fields (If missing)
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='payment_schedule') THEN
        ALTER TABLE public.properties ADD COLUMN payment_schedule TEXT DEFAULT 'Flexible';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='images') THEN
        ALTER TABLE public.properties ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 4. Enable RLS and Policies (Hardened)
ALTER TABLE public.property_unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_progress ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Allow public read" ON public.property_unit_types;
    DROP POLICY IF EXISTS "Allow public read" ON public.property_progress;
    
    -- Fix for Storage Objects policy conflict if applicable
    -- Note: storage.objects is in the storage schema
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
END $$;

CREATE POLICY "Allow public read" ON public.property_unit_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.property_progress FOR SELECT USING (true);


-- 5. Storage Sanitization (Optional but unblocks 'Bucket not found' errors)
-- Create bucket if not exists via SQL if API fails
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('property-assets', 'property-assets', true)
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('media-assets', 'media-assets', true)
-- ON CONFLICT (id) DO NOTHING;

-- SQL Policy for Storage Objects (If manual setup is needed)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('property-assets', 'media-assets', 'aloha-assets'));

