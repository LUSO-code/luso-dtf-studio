-- Ensure public storage bucket 'designs' exists for Image Lab and Underbase assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'designs' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public designs bucket read access'
  ) THEN
    CREATE POLICY "Public designs bucket read access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'designs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users upload access to designs bucket'
  ) THEN
    CREATE POLICY "Authenticated users upload access to designs bucket"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'designs' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users update access to designs bucket'
  ) THEN
    CREATE POLICY "Authenticated users update access to designs bucket"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'designs' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users delete access to designs bucket'
  ) THEN
    CREATE POLICY "Authenticated users delete access to designs bucket"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'designs' AND auth.role() = 'authenticated');
  END IF;
END $$;
