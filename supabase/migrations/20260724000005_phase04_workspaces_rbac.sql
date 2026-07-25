-- ====================================================================
-- LUSO DTF STUDIO - PHASE 04 WORKSPACES, TEAM MEMBERS & RBAC MIGRATION
-- ====================================================================

-- 1. Create Workspace Invitations Table
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workspace_invitations
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- 2. Create Future Subscription Plans Table Foundation
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  max_workspaces INT DEFAULT 1,
  max_team_members INT DEFAULT 5,
  max_designs INT DEFAULT 100,
  max_storage_mb INT DEFAULT 5000,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- Insert Default SaaS Plans
INSERT INTO public.subscription_plans (name, slug, description, max_workspaces, max_team_members, max_designs, max_storage_mb)
VALUES
  ('Gratuito', 'free', 'Plan inicial para pequeños talleres DTF', 1, 2, 50, 2000),
  ('Profesional', 'pro', 'Plan avanzado para talleres de alta producción', 3, 10, 500, 25000),
  ('Estudio / Empresa', 'studio', 'Plan ilimitado para grandes operaciones e imprentas', 10, 50, 10000, 200000)
ON CONFLICT (slug) DO NOTHING;

-- 3. Create Workspace Subscriptions Table Foundation
CREATE TABLE IF NOT EXISTS public.workspace_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workspace_subscriptions
ALTER TABLE public.workspace_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Helper Security Function: Get user role in a workspace
CREATE OR REPLACE FUNCTION public.get_workspace_user_role(target_workspace_id UUID, target_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. RLS Policies for workspace_invitations
CREATE POLICY "Workspace members can view invitations"
  ON public.workspace_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and Admins can create invitations"
  ON public.workspace_invitations FOR INSERT
  WITH CHECK (
    public.get_workspace_user_role(workspace_invitations.workspace_id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY "Owners and Admins can delete invitations"
  ON public.workspace_invitations FOR DELETE
  USING (
    public.get_workspace_user_role(workspace_invitations.workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- 6. RLS Policies for workspace_subscriptions
CREATE POLICY "Workspace members can view workspace subscription"
  ON public.workspace_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_subscriptions.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- 7. RBAC Production Data Modifications Safeguard: Update designs and print_sheets RLS to restrict Viewers from writing
CREATE POLICY "Viewers cannot insert designs"
  ON public.designs FOR INSERT
  WITH CHECK (
    public.get_workspace_user_role(designs.workspace_id, auth.uid()) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "Viewers cannot update designs"
  ON public.designs FOR UPDATE
  USING (
    public.get_workspace_user_role(designs.workspace_id, auth.uid()) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "Viewers cannot delete designs"
  ON public.designs FOR DELETE
  USING (
    public.get_workspace_user_role(designs.workspace_id, auth.uid()) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "Viewers cannot insert print sheets"
  ON public.print_sheets FOR INSERT
  WITH CHECK (
    public.get_workspace_user_role(print_sheets.workspace_id, auth.uid()) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "Viewers cannot update print sheets"
  ON public.print_sheets FOR UPDATE
  USING (
    public.get_workspace_user_role(print_sheets.workspace_id, auth.uid()) IN ('owner', 'admin', 'member')
  );

CREATE POLICY "Viewers cannot delete print sheets"
  ON public.print_sheets FOR DELETE
  USING (
    public.get_workspace_user_role(print_sheets.workspace_id, auth.uid()) IN ('owner', 'admin', 'member')
  );
