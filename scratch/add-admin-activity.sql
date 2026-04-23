-- 1. Create Admin Activity Table
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    admin_id UUID DEFAULT auth.uid(), -- Automatically capture user ID if available
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT
);

-- 2. Enable RLS
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- 3. Add Admin Policy
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Allow admins full access to admin_activity" ON public.admin_activity;
    CREATE POLICY "Allow admins full access to admin_activity" ON public.admin_activity FOR ALL USING (true);
END $$;

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
