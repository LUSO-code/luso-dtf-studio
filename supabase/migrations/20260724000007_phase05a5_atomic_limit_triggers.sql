-- ====================================================================
-- LUSO DTF STUDIO - PHASE 05A.5 ATOMIC LIMIT ENFORCEMENT TRIGGERS
-- ====================================================================

-- 1. Atomic Trigger Function for Design Limits
CREATE OR REPLACE FUNCTION public.check_workspace_design_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  allowed_max INT;
  active_plan_id UUID;
BEGIN
  -- Determine allowed max designs for workspace
  SELECT sp.max_designs INTO allowed_max
  FROM public.workspace_subscriptions ws
  JOIN public.subscription_plans sp ON ws.plan_id = sp.id
  WHERE ws.workspace_id = NEW.workspace_id;

  -- Fallback to default FREE limit (15) if no subscription row exists
  IF allowed_max IS NULL THEN
    allowed_max := 15;
  END IF;

  -- Count existing designs for workspace
  SELECT COUNT(*) INTO current_count
  FROM public.designs
  WHERE workspace_id = NEW.workspace_id;

  IF current_count >= allowed_max THEN
    RAISE EXCEPTION 'Límite de diseños alcanzado para tu plan comercial (% / %)', current_count, allowed_max
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists for idempotent re-execution
DROP TRIGGER IF EXISTS trigger_check_workspace_design_limit ON public.designs;

CREATE TRIGGER trigger_check_workspace_design_limit
  BEFORE INSERT ON public.designs
  FOR EACH ROW
  EXECUTE FUNCTION public.check_workspace_design_limit();


-- 2. Atomic Trigger Function for Print Sheet Limits
CREATE OR REPLACE FUNCTION public.check_workspace_sheet_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  allowed_max INT;
BEGIN
  -- Determine allowed max sheets for workspace
  SELECT sp.max_print_sheets INTO allowed_max
  FROM public.workspace_subscriptions ws
  JOIN public.subscription_plans sp ON ws.plan_id = sp.id
  WHERE ws.workspace_id = NEW.workspace_id;

  -- Fallback to default FREE limit (5) if no subscription row exists
  IF allowed_max IS NULL THEN
    allowed_max := 5;
  END IF;

  -- Count existing print sheets for workspace
  SELECT COUNT(*) INTO current_count
  FROM public.print_sheets
  WHERE workspace_id = NEW.workspace_id;

  IF current_count >= allowed_max THEN
    RAISE EXCEPTION 'Límite de planchas alcanzado para tu plan comercial (% / %)', current_count, allowed_max
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists for idempotent re-execution
DROP TRIGGER IF EXISTS trigger_check_workspace_sheet_limit ON public.print_sheets;

CREATE TRIGGER trigger_check_workspace_sheet_limit
  BEFORE INSERT ON public.print_sheets
  FOR EACH ROW
  EXECUTE FUNCTION public.check_workspace_sheet_limit();
