-- =========================================================================
-- ALOHA PROPERTIES - LEAD BATCHES SCHEMA UPDATE
-- Execute this script in your Supabase Dashboard SQL Editor
-- =========================================================================

-- 1. Create Lead Batches Table
CREATE TABLE IF NOT EXISTS public.lead_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    lead_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add batch_id to existing leads table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='batch_id') THEN 
        ALTER TABLE public.leads ADD COLUMN batch_id UUID REFERENCES public.lead_batches(id) ON DELETE SET NULL; 
    END IF;
END $$;

-- 3. RLS Policies for lead_batches
ALTER TABLE public.lead_batches ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Allow admins full access to lead_batches" ON public.lead_batches;
    CREATE POLICY "Allow admins full access to lead_batches" ON public.lead_batches FOR ALL USING (true);
END $$;

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
