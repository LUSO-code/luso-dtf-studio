-- ====================================================================
-- LUSO DTF STUDIO - PHASE 05A SAAS COMMERCIAL FOUNDATION MIGRATION
-- ====================================================================

-- 1. Extend subscription_plans Table with Numerical Limits, Features JSONB, & Commercial Fields
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS max_print_sheets INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_monthly_exports INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS max_monthly_processing_jobs INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS yearly_price NUMERIC(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Extend workspace_subscriptions Table with Trial and Lifecycle Fields
ALTER TABLE public.workspace_subscriptions
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT 'none' CHECK (trial_status IN ('none', 'active', 'expired', 'converted')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- 3. Upsert Standard SaaS Plans (FREE, PRO, STUDIO)
INSERT INTO public.subscription_plans (
  name,
  slug,
  description,
  max_workspaces,
  max_team_members,
  max_designs,
  max_print_sheets,
  max_storage_mb,
  max_monthly_exports,
  max_monthly_processing_jobs,
  monthly_price,
  yearly_price,
  currency,
  is_active,
  sort_order,
  features
)
VALUES
  (
    'Gratuito',
    'free',
    'Plan inicial esencial para talleres DTF y emprendedores',
    1,
    2,
    15,
    5,
    1000,
    10,
    25,
    0.00,
    0.00,
    'EUR',
    TRUE,
    1,
    '{
      "image_lab": true,
      "background_removal": true,
      "underbase": true,
      "smart_nesting": true,
      "print_sheet_export": true,
      "dual_export": true,
      "team_members": true,
      "advanced_underbase": false,
      "priority_processing": false,
      "future_ai_tools": false
    }'::jsonb
  ),
  (
    'Profesional',
    'pro',
    'Plan completo para talleres de alta producción y equipos',
    3,
    10,
    200,
    50,
    25000,
    250,
    500,
    29.00,
    290.00,
    'EUR',
    TRUE,
    2,
    '{
      "image_lab": true,
      "background_removal": true,
      "underbase": true,
      "smart_nesting": true,
      "print_sheet_export": true,
      "dual_export": true,
      "team_members": true,
      "advanced_underbase": true,
      "priority_processing": true,
      "future_ai_tools": false
    }'::jsonb
  ),
  (
    'Estudio / Empresa',
    'studio',
    'Plan ilimitado para grandes operaciones e imprentas industriales',
    10,
    50,
    5000,
    1000,
    200000,
    5000,
    10000,
    79.00,
    790.00,
    'EUR',
    TRUE,
    3,
    '{
      "image_lab": true,
      "background_removal": true,
      "underbase": true,
      "smart_nesting": true,
      "print_sheet_export": true,
      "dual_export": true,
      "team_members": true,
      "advanced_underbase": true,
      "priority_processing": true,
      "future_ai_tools": true
    }'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  max_workspaces = EXCLUDED.max_workspaces,
  max_team_members = EXCLUDED.max_team_members,
  max_designs = EXCLUDED.max_designs,
  max_print_sheets = EXCLUDED.max_print_sheets,
  max_storage_mb = EXCLUDED.max_storage_mb,
  max_monthly_exports = EXCLUDED.max_monthly_exports,
  max_monthly_processing_jobs = EXCLUDED.max_monthly_processing_jobs,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- 4. RLS Security Enforcement for Billing Tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to ensure idempotent re-execution
DROP POLICY IF EXISTS "Workspace members can view workspace subscription policy" ON public.workspace_subscriptions;
DROP POLICY IF EXISTS "Owners and Admins can update workspace subscription policy" ON public.workspace_subscriptions;

-- Allow workspace members to view their workspace's subscription
CREATE POLICY "Workspace members can view workspace subscription policy"
  ON public.workspace_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_subscriptions.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Only Owners and Admins can modify workspace subscription
CREATE POLICY "Owners and Admins can update workspace subscription policy"
  ON public.workspace_subscriptions FOR UPDATE
  USING (
    public.get_workspace_user_role(workspace_subscriptions.workspace_id, auth.uid()) IN ('owner', 'admin')
  );
