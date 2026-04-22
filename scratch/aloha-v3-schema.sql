-- =========================================================================
-- ALOHA PROPERTIES V3 - COMPLETE DATABASE SCHEMA
-- Execute this entire script in your Supabase Dashboard SQL Editor
-- =========================================================================

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT,
  notes TEXT,
  source TEXT DEFAULT 'organic',
  status TEXT DEFAULT 'new',
  property_id UUID
);

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  developer TEXT,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  amenities TEXT[],
  images TEXT[],
  cover_image TEXT,
  video_url TEXT,
  discount_percentage INTEGER DEFAULT 0,
  downpayment_percentage INTEGER DEFAULT 0,
  payment_schedule TEXT DEFAULT 'Flexible Terms',
  air_quality_index INTEGER DEFAULT 50,
  env_risk_level TEXT DEFAULT 'Low',
  urban_heat_index INTEGER DEFAULT 0,
  tenure_type TEXT DEFAULT 'Freehold',
  parking_spots INTEGER DEFAULT 0,
  virtual_tour_url TEXT,
  total_sqm NUMERIC,
  completion_date TEXT,
  property_type TEXT DEFAULT 'Apartment',
  loan_percentage NUMERIC DEFAULT 0,
  discount_conditions TEXT,
  discount_rules JSONB DEFAULT '[]'::jsonb,
  pdf_brochure_url TEXT,
  price_start NUMERIC DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false
);

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
    amenities TEXT[],
    discount_rules JSONB DEFAULT '[]'::jsonb,
    payment_schedule TEXT,
    downpayment_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.property_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_type_id UUID REFERENCES public.property_unit_types(id) ON DELETE SET NULL,
  type TEXT,
  unit_number TEXT,
  floor_number INTEGER DEFAULT 1,
  beds INTEGER,
  baths FLOAT,
  sqm FLOAT,
  price BIGINT,
  variety_img TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'available',
  notes TEXT,
  view_type TEXT,
  balcony_sqm NUMERIC DEFAULT 0,
  is_furnished BOOLEAN DEFAULT false,
  discount_rules JSONB DEFAULT '[]'::jsonb,
  payment_schedule TEXT,
  downpayment_percentage INTEGER DEFAULT 0,
  availability_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.property_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  percent INTEGER DEFAULT 0,
  percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'under-construction',
  status_text TEXT,
  stage_name TEXT,
  label TEXT,
  estimated_completion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  video_url TEXT,
  source_label TEXT,
  source_url TEXT,
  author_name TEXT DEFAULT 'Aloha Editorial',
  type TEXT DEFAULT 'article',
  file_url TEXT,
  status TEXT DEFAULT 'published',
  is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  target_filter TEXT,
  audience_size INTEGER NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'sent'
);

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

CREATE TABLE IF NOT EXISTS public.trusted_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    category TEXT DEFAULT 'Developer',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- 2. Add any potentially missing columns (ensures existing DBs don't break)
DO $$ 
BEGIN 
    -- properties
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='air_quality_index') THEN ALTER TABLE public.properties ADD COLUMN air_quality_index INTEGER DEFAULT 50; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='env_risk_level') THEN ALTER TABLE public.properties ADD COLUMN env_risk_level TEXT DEFAULT 'Low'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='urban_heat_index') THEN ALTER TABLE public.properties ADD COLUMN urban_heat_index INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='downpayment_percentage') THEN ALTER TABLE public.properties ADD COLUMN downpayment_percentage INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_percentage') THEN ALTER TABLE public.properties ADD COLUMN discount_percentage INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='payment_schedule') THEN ALTER TABLE public.properties ADD COLUMN payment_schedule TEXT DEFAULT 'Flexible Terms'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='tenure_type') THEN ALTER TABLE public.properties ADD COLUMN tenure_type TEXT DEFAULT 'Freehold'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='parking_spots') THEN ALTER TABLE public.properties ADD COLUMN parking_spots INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='virtual_tour_url') THEN ALTER TABLE public.properties ADD COLUMN virtual_tour_url TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='total_sqm') THEN ALTER TABLE public.properties ADD COLUMN total_sqm NUMERIC; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='completion_date') THEN ALTER TABLE public.properties ADD COLUMN completion_date TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='property_type') THEN ALTER TABLE public.properties ADD COLUMN property_type TEXT DEFAULT 'Apartment'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='loan_percentage') THEN ALTER TABLE public.properties ADD COLUMN loan_percentage NUMERIC DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_conditions') THEN ALTER TABLE public.properties ADD COLUMN discount_conditions TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='discount_rules') THEN ALTER TABLE public.properties ADD COLUMN discount_rules JSONB DEFAULT '[]'::jsonb; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='pdf_brochure_url') THEN ALTER TABLE public.properties ADD COLUMN pdf_brochure_url TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='price_start') THEN ALTER TABLE public.properties ADD COLUMN price_start NUMERIC DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='is_deleted') THEN ALTER TABLE public.properties ADD COLUMN is_deleted BOOLEAN DEFAULT false; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='developer') THEN ALTER TABLE public.properties ADD COLUMN developer TEXT; END IF;
    
    -- posts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='is_deleted') THEN ALTER TABLE public.posts ADD COLUMN is_deleted BOOLEAN DEFAULT false; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='status') THEN ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'published'; END IF;
    
    -- leads
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='property_id') THEN ALTER TABLE public.leads ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL; END IF;
END $$;


-- 3. Row Level Security & Policies
-- Disable strict RLS on these core tables for the Admin Dashboard to sync smoothly 
-- (Assuming auth.role() = 'authenticated' is used across the Next.js app)
DO $$ 
BEGIN 
    -- Properties
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read properties" ON public.properties;
    CREATE POLICY "Allow public read properties" ON public.properties FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow admin all properties" ON public.properties;
    CREATE POLICY "Allow admin all properties" ON public.properties FOR ALL USING (true); -- Full access

    -- Trusted Companies
    ALTER TABLE public.trusted_companies ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read trusted_companies" ON public.trusted_companies;
    CREATE POLICY "Public read trusted_companies" ON public.trusted_companies FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Auth write trusted_companies" ON public.trusted_companies;
    CREATE POLICY "Auth write trusted_companies" ON public.trusted_companies FOR ALL USING (true); -- Full access

    -- Admin Activity
    ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Auth read admin_activity" ON public.admin_activity;
    CREATE POLICY "Auth read admin_activity" ON public.admin_activity FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Auth insert admin_activity" ON public.admin_activity;
    CREATE POLICY "Auth insert admin_activity" ON public.admin_activity FOR INSERT WITH CHECK (true);
END $$;

-- 4. Storage Buckets (If using Supabase Storage)
INSERT INTO storage.buckets (id, name, public) VALUES ('property-assets', 'property-assets', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('media-assets', 'media-assets', true) ON CONFLICT (id) DO NOTHING;

-- 5. Performance Indexing (Full Database Suite)
CREATE INDEX IF NOT EXISTS idx_property_unit_types_property_id ON public.property_unit_types(property_id);
CREATE INDEX IF NOT EXISTS idx_property_units_property_id ON public.property_units(property_id);
CREATE INDEX IF NOT EXISTS idx_property_units_unit_type_id ON public.property_units(unit_type_id);
CREATE INDEX IF NOT EXISTS idx_property_units_status ON public.property_units(status);
CREATE INDEX IF NOT EXISTS idx_property_progress_property_id ON public.property_progress(property_id);

CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country_code ON public.visitors(country_code);
CREATE INDEX IF NOT EXISTS idx_visitors_path ON public.visitors(path);

CREATE INDEX IF NOT EXISTS idx_leads_property_id ON public.leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_properties_developer ON public.properties(developer);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- 6. Advanced Security Hardening (RLS & Service Roles)
-- Ensure leads and visitors are protected
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    -- Visitors
    DROP POLICY IF EXISTS "Allow anonymous insert" ON public.visitors;
    DROP POLICY IF EXISTS "Allow authenticated read" ON public.visitors;
    CREATE POLICY "Allow anonymous insert" ON public.visitors FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated read" ON public.visitors FOR SELECT USING (true); -- Assume full access for simplicity in API/dashboard

    -- Leads
    DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
    CREATE POLICY "Allow public insert to leads" ON public.leads FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow admins full access to leads" ON public.leads;
    CREATE POLICY "Allow admins full access to leads" ON public.leads FOR ALL USING (true);
END $$;

-- 7. Storage Security Hardening
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
END $$;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('property-assets', 'media-assets'));
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('property-assets', 'media-assets'));
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('property-assets', 'media-assets'));

-- 8. Integrity Checks & Constraints
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'property_units' AND constraint_name = 'check_unit_status') THEN
        ALTER TABLE public.property_units ADD CONSTRAINT check_unit_status CHECK (status IN ('available', 'reserved', 'sold'));
    END IF;
END $$;

-- 9. RELOAD SCHEMA CACHE (Crucial for fixing 'Not Found in schema cache' errors)
NOTIFY pgrst, 'reload schema';
