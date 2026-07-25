-- ====================================================================
-- LUSO DTF STUDIO - PHASE 05A.6 PRODUCT ANALYTICS & FEEDBACK MIGRATION
-- ====================================================================

-- 1. Create Product Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 2. Create User Feedback Table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_feedback
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Policies for analytics_events
DROP POLICY IF EXISTS "Workspace members can view workspace analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert analytics events" ON public.analytics_events;

CREATE POLICY "Workspace members can view workspace analytics"
  ON public.analytics_events FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = analytics_events.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- 4. RLS Security Policies for user_feedback
DROP POLICY IF EXISTS "Users can view own or workspace feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON public.user_feedback;

CREATE POLICY "Users can view own or workspace feedback"
  ON public.user_feedback FOR SELECT
  USING (
    user_id = auth.uid() OR
    (
      workspace_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = user_feedback.workspace_id
          AND wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );
