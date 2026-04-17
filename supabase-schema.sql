-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. Create the Leads Table (organic incoming forms)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT,
  notes TEXT,
  -- Admin interaction notes
  source TEXT DEFAULT 'organic',
  status TEXT DEFAULT 'new' -- 'new', 'contacted', 'viewing', 'qualified', 'closed', 'lost'
);
-- 2. Create the Property Portfolio Tables
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  developer TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  amenities TEXT [],
  images TEXT [],
  cover_image TEXT,
  discount_percentage INTEGER DEFAULT 0,
  payment_schedule TEXT DEFAULT 'Flexible Terms'
);
CREATE TABLE IF NOT EXISTS public.property_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  -- e.g. '2 Bedroom'
  beds INTEGER,
  baths FLOAT,
  sqm FLOAT,
  price BIGINT,
  variety_img TEXT
);
CREATE TABLE IF NOT EXISTS public.property_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'under-construction',
  status_text TEXT,
  estimated_completion TEXT
);
-- 3. Create the News/Blog Table
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
  -- 'article', 'report', 'guide'
  file_url TEXT -- Link to PDF for reports
);
-- 4. Create the Campaigns Table (to log mass broadcast history)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  subject TEXT NOT NULL,
  audience_size INTEGER NOT NULL,
  sent_by UUID REFERENCES auth.users(id)
);
-- 5. Row Level Security (RLS) Settings
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- Allow public insert to leads
CREATE POLICY "Allow public insert to leads" ON public.leads FOR
INSERT WITH CHECK (true);
-- Allow public read of properties, units, and posts
CREATE POLICY "Allow direct read access to properties" ON public.properties FOR
SELECT USING (true);
CREATE POLICY "Allow direct read access to units" ON public.property_units FOR
SELECT USING (true);
CREATE POLICY "Allow direct read access to progress" ON public.property_progress FOR
SELECT USING (true);
CREATE POLICY "Allow direct read access to posts" ON public.posts FOR
SELECT USING (true);
-- Admin Full Access (Note: Service Role usage in API routes bypasses these)
CREATE POLICY "Allow admins full access to leads" ON public.leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins full access to campaigns" ON public.campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins full access to properties" ON public.properties FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins full access to units" ON public.property_units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins full access to posts" ON public.posts FOR ALL USING (auth.role() = 'authenticated');
-- ADMIN TABLE (ADDED FIX)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);