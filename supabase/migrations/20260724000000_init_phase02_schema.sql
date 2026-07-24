-- ====================================================================
-- LUSO DTF STUDIO - PHASE 02 DATABASE SCHEMA & ROW LEVEL SECURITY
-- ====================================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create WORKSPACES Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Mi espacio',
  slug TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create WORKSPACE_MEMBERS Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

-- 4. Create PROJECTS Table (Print preparation workflow container)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'exported')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create DESIGNS Table
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_file_url TEXT,
  processed_file_url TEXT,
  width_mm NUMERIC,
  height_mm NUMERIC,
  dpi INTEGER DEFAULT 300,
  print_width_cm NUMERIC,
  print_height_cm NUMERIC,
  processing_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create PRINT_SHEETS Table
CREATE TABLE IF NOT EXISTS public.print_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sheet_width_cm NUMERIC DEFAULT 58,
  sheet_height_cm NUMERIC DEFAULT 100,
  efficiency_percentage NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE workspace_id = ws_id 
      AND user_id = auth.uid()
  );
$$;

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_sheets ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- WORKSPACES POLICIES
CREATE POLICY "Workspace members can view workspace" 
  ON public.workspaces FOR SELECT 
  USING (public.is_workspace_member(id));

CREATE POLICY "Users can create workspace" 
  ON public.workspaces FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners & members can update workspace" 
  ON public.workspaces FOR UPDATE 
  USING (public.is_workspace_member(id));

CREATE POLICY "Workspace owners can delete workspace" 
  ON public.workspaces FOR DELETE 
  USING (auth.uid() = owner_id);

-- WORKSPACE MEMBERS POLICIES
CREATE POLICY "Members can view workspace members" 
  ON public.workspace_members FOR SELECT 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Owners can manage workspace members" 
  ON public.workspace_members FOR ALL 
  USING (public.is_workspace_member(workspace_id));

-- PROJECTS POLICIES
CREATE POLICY "Workspace members can view projects" 
  ON public.projects FOR SELECT 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update projects" 
  ON public.projects FOR UPDATE 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete projects" 
  ON public.projects FOR DELETE 
  USING (public.is_workspace_member(workspace_id));

-- DESIGNS POLICIES
CREATE POLICY "Workspace members can view designs" 
  ON public.designs FOR SELECT 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert designs" 
  ON public.designs FOR INSERT 
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update designs" 
  ON public.designs FOR UPDATE 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete designs" 
  ON public.designs FOR DELETE 
  USING (public.is_workspace_member(workspace_id));

-- PRINT SHEETS POLICIES
CREATE POLICY "Workspace members can view print sheets" 
  ON public.print_sheets FOR SELECT 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert print sheets" 
  ON public.print_sheets FOR INSERT 
  WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update print sheets" 
  ON public.print_sheets FOR UPDATE 
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete print sheets" 
  ON public.print_sheets FOR DELETE 
  USING (public.is_workspace_member(workspace_id));

-- AUTOMATIC NEW USER TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ws_id UUID;
  user_name TEXT;
BEGIN
  -- Extract display name or email prefix
  user_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));

  -- 1. Create Profile
  INSERT INTO public.profiles (id, user_id, display_name, avatar_url)
  VALUES (new.id, new.id, user_name, new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Default Workspace
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES ('Mi espacio', 'mi-espacio-' || substr(new.id::text, 1, 8), new.id)
  RETURNING id INTO new_ws_id;

  -- 3. Add User as Workspace Member (owner role)
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_ws_id, new.id, 'owner');

  RETURN new;
END;
$$;

-- ATTACH TRIGGER TO AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
