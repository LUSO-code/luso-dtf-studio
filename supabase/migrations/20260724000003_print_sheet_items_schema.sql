-- ====================================================================
-- LUSO DTF STUDIO - PHASE 03B PRINT SHEET ITEMS SCHEMA & RLS
-- ====================================================================

-- 1. Ensure print_sheets table has required columns
ALTER TABLE public.print_sheets
  ADD COLUMN IF NOT EXISTS sheet_width_cm NUMERIC DEFAULT 58,
  ADD COLUMN IF NOT EXISTS sheet_height_cm NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS target_dpi INTEGER DEFAULT 300,
  ADD COLUMN IF NOT EXISTS margin_cm NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS spacing_cm NUMERIC DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS efficiency_percentage NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS export_file_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create print_sheet_items table
CREATE TABLE IF NOT EXISTS public.print_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  print_sheet_id UUID NOT NULL REFERENCES public.print_sheets(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  x_cm NUMERIC NOT NULL DEFAULT 0,
  y_cm NUMERIC NOT NULL DEFAULT 0,
  width_cm NUMERIC NOT NULL,
  height_cm NUMERIC NOT NULL,
  rotation INTEGER NOT NULL DEFAULT 0 CHECK (rotation IN (0, 90, 180, 270)),
  z_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_print_sheet_items_sheet_id ON public.print_sheet_items(print_sheet_id);
CREATE INDEX IF NOT EXISTS idx_print_sheet_items_design_id ON public.print_sheet_items(design_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.print_sheet_items ENABLE ROW LEVEL SECURITY;

-- 5. Security RLS Policies (Workspace Isolated via parent print_sheets)
CREATE POLICY "Users can view print sheet items in their workspace"
  ON public.print_sheet_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.print_sheets ps
      WHERE ps.id = print_sheet_items.print_sheet_id
        AND public.is_workspace_member(ps.workspace_id)
    )
  );

CREATE POLICY "Users can create print sheet items in their workspace"
  ON public.print_sheet_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.print_sheets ps
      WHERE ps.id = print_sheet_items.print_sheet_id
        AND public.is_workspace_member(ps.workspace_id)
    )
  );

CREATE POLICY "Users can update print sheet items in their workspace"
  ON public.print_sheet_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.print_sheets ps
      WHERE ps.id = print_sheet_items.print_sheet_id
        AND public.is_workspace_member(ps.workspace_id)
    )
  );

CREATE POLICY "Users can delete print sheet items in their workspace"
  ON public.print_sheet_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.print_sheets ps
      WHERE ps.id = print_sheet_items.print_sheet_id
        AND public.is_workspace_member(ps.workspace_id)
    )
  );
