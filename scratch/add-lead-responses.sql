-- 1. Create Lead Responses Table
CREATE TABLE IF NOT EXISTS public.lead_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    response_text TEXT,
    interest_level TEXT DEFAULT 'Medium',
    location TEXT,
    interest_summary TEXT,
    notes TEXT
);

-- 2. Enable RLS
ALTER TABLE public.lead_responses ENABLE ROW LEVEL SECURITY;

-- 3. Add Admin Policy
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Allow admins full access to lead_responses" ON public.lead_responses;
    CREATE POLICY "Allow admins full access to lead_responses" ON public.lead_responses FOR ALL USING (true);
END $$;

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
