-- Make storage buckets private and add RLS policies

-- Update buckets to be private (this updates the metadata)
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('uploads', 'restorations');

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Users can only upload files to their own folder in uploads bucket
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text) OR
  (bucket_id = 'restorations' AND (storage.foldername(name))[1] = auth.uid()::text)
);

-- Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text) OR
  (bucket_id = 'restorations' AND (storage.foldername(name))[1] = auth.uid()::text)
);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text) OR
  (bucket_id = 'restorations' AND (storage.foldername(name))[1] = auth.uid()::text)
);