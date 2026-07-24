-- ====================================================================
-- LUSO DTF STUDIO - PHASE 02.5 SECURITY HARDENING & RLS POLICIES
-- ====================================================================

-- 1. Hardened is_workspace_member with explicit search_path
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE workspace_id = ws_id 
      AND user_id = auth.uid()
  );
$$;

-- 2. New helper for Admin/Owner role checks with explicit search_path
CREATE OR REPLACE FUNCTION public.is_workspace_admin_or_owner(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE workspace_id = ws_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- 3. Harden WORKSPACE_MEMBERS mutation policies
DROP POLICY IF EXISTS "Owners can manage workspace members" ON public.workspace_members;

CREATE POLICY "Admins and Owners can insert workspace members" 
  ON public.workspace_members FOR INSERT 
  WITH CHECK (public.is_workspace_admin_or_owner(workspace_id));

CREATE POLICY "Admins and Owners can update workspace members" 
  ON public.workspace_members FOR UPDATE 
  USING (public.is_workspace_admin_or_owner(workspace_id));

CREATE POLICY "Admins and Owners can delete workspace members" 
  ON public.workspace_members FOR DELETE 
  USING (public.is_workspace_admin_or_owner(workspace_id));

-- 4. Harden WORKSPACES update policy
DROP POLICY IF EXISTS "Workspace owners & members can update workspace" ON public.workspaces;

CREATE POLICY "Admins and Owners can update workspace" 
  ON public.workspaces FOR UPDATE 
  USING (public.is_workspace_admin_or_owner(id));
