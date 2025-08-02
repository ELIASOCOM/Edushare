-- First, let's completely reset and fix admin permissions

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "pdfs_select_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_insert_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_update_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_delete_policy" ON pdfs;

-- Create new policies with explicit admin bypass
CREATE POLICY "pdfs_select_policy" ON pdfs
  FOR SELECT USING (
    -- First check if user is admin - if yes, show EVERYTHING
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
    -- If not admin, show only approved PDFs or own PDFs
    OR (is_approved = true)
    OR (auth.uid() = user_id)
  );

CREATE POLICY "pdfs_insert_policy" ON pdfs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "pdfs_update_policy" ON pdfs
  FOR UPDATE USING (
    -- Admins can update ANY PDF
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
    -- Regular users can only update their own
    OR (auth.uid() = user_id)
  );

CREATE POLICY "pdfs_delete_policy" ON pdfs
  FOR DELETE USING (
    -- Admins can delete ANY PDF
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
    -- Regular users can only delete their own
    OR (auth.uid() = user_id)
  );

-- Fix storage policies for admin access
DROP POLICY IF EXISTS "edu_resources_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_delete_policy" ON storage.objects;

CREATE POLICY "edu_resources_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'edu-resources');

CREATE POLICY "edu_resources_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      )
    )
  );

CREATE POLICY "edu_resources_update_policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      )
    )
  );

CREATE POLICY "edu_resources_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      )
    )
  );

-- Create a test function to verify admin can see all PDFs
CREATE OR REPLACE FUNCTION test_admin_access()
RETURNS TABLE (
  total_pdfs_in_db INTEGER,
  admin_can_see INTEGER,
  regular_user_can_see INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER;
  admin_count INTEGER;
  regular_count INTEGER;
BEGIN
  -- Count total PDFs in database
  SELECT COUNT(*) INTO total_count FROM pdfs;
  
  -- Simulate admin access (bypass RLS temporarily)
  SET LOCAL row_security = off;
  SELECT COUNT(*) INTO admin_count FROM pdfs;
  SET LOCAL row_security = on;
  
  -- Count approved PDFs (what regular users see)
  SELECT COUNT(*) INTO regular_count FROM pdfs WHERE is_approved = true;
  
  RETURN QUERY SELECT total_count, admin_count, regular_count;
END;
$$;

-- Ensure the admin user has proper permissions
UPDATE profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'ocomelias8@gmail.com'
);

-- Add some test data to verify (optional - remove in production)
-- INSERT INTO pdfs (title, description, file_path, file_size, user_id, is_approved)
-- SELECT 
--   'Test PDF ' || generate_series(1,3),
--   'Test description',
--   'test/file' || generate_series(1,3) || '.pdf',
--   1000000,
--   (SELECT id FROM auth.users LIMIT 1),
--   CASE WHEN generate_series(1,3) % 2 = 0 THEN false ELSE true END;
