-- ====================================================================
-- LUSO DTF STUDIO - PHASE 03A IMAGE LAB METADATA EXTENSIONS
-- ====================================================================

-- Ensure designs table columns for Image Lab
ALTER TABLE public.designs
  ADD COLUMN IF NOT EXISTS original_format TEXT,
  ADD COLUMN IF NOT EXISTS processed_format TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS has_alpha BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS has_transparency BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS processing_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS analyzer_metadata JSONB DEFAULT '{}'::jsonb;
