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

-- 4. Enable RLS and Policies (Optional, but recommended)
ALTER TABLE public.property_unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.property_unit_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.property_progress FOR SELECT USING (true);
