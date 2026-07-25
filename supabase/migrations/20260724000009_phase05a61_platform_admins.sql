-- ====================================================================
-- LUSO DTF STUDIO - PHASE 05A.6.1 PLATFORM ADMIN SECURITY MIGRATION
-- ====================================================================

-- 1. Create Dedicated Platform Admins Table
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Index for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON public.platform_admins(user_id);

-- Enable Row Level Security
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- 2. Security Definer Helper Function to Prevent RLS Recursion
CREATE OR REPLACE FUNCTION public.is_platform_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. RLS Security Policies for platform_admins
DROP POLICY IF EXISTS "Platform admins can view admin list" ON public.platform_admins;

CREATE POLICY "Platform admins can view admin list"
  ON public.platform_admins FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
  );
