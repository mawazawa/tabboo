-- Security Fix: Remove overly permissive public storage policies
-- This prevents anonymous users from uploading or reading files

-- Drop public storage policies on uploads bucket
DROP POLICY IF EXISTS "uploads_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_select_policy" ON storage.objects;

-- Drop public storage policies on restorations bucket
DROP POLICY IF EXISTS "restorations_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "restorations_select_policy" ON storage.objects;

-- Ensure buckets are marked as private (not publicly accessible)
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('uploads', 'restorations');

-- Verify authenticated user policies remain in place
-- These policies should already exist and restrict access to file owners only:
-- - "Users can upload own files" (authenticated users only)
-- - "Users can read own files" (authenticated users only)
-- - "Users can update own files" (authenticated users only)
-- - "Users can delete own files" (authenticated users only)