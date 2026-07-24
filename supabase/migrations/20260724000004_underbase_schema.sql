-- ====================================================================
-- LUSO DTF STUDIO - PHASE 03C WHITE UNDERBASE SCHEMA MIGRATION
-- ====================================================================

-- Extend public.designs table for White Ink Underbase Lab
ALTER TABLE public.designs
  ADD COLUMN IF NOT EXISTS underbase_file_url TEXT,
  ADD COLUMN IF NOT EXISTS underbase_config JSONB DEFAULT '{}'::jsonb;
