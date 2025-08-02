-- Ensure admins have complete access to ALL PDFs regardless of approval status or ownership

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "pdfs_select_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_insert_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_update_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_delete_policy" ON pdfs;

-- Create comprehensive policies that give admins full access
CREATE POLICY "pdfs_select_policy" ON pdfs
  FOR SELECT USING (
    -- Regular users see only approved PDFs or their own PDFs
    (is_approved = true AND auth.uid() IS NOT NULL)
    OR (auth.uid() = user_id)
    -- Admins see ALL PDFs regardless of approval status or ownership
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "pdfs_insert_policy" ON pdfs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "pdfs_update_policy" ON pdfs
  FOR UPDATE USING (
    -- Users can update their own PDFs
    auth.uid() = user_id 
    -- Admins can update ANY PDF
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "pdfs_delete_policy" ON pdfs
  FOR DELETE USING (
    -- Users can delete their own PDFs
    auth.uid() = user_id 
    -- Admins can delete ANY PDF
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Ensure storage policies also give admins full access
DROP POLICY IF EXISTS "edu_resources_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_delete_policy" ON storage.objects;

CREATE POLICY "edu_resources_select_policy" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'edu-resources'
  );

CREATE POLICY "edu_resources_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Users can upload to their own folder
      auth.uid()::text = (storage.foldername(name))[1]
      -- Admins can upload anywhere
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
      -- Users can update files in their own folder
      auth.uid()::text = (storage.foldername(name))[1]
      -- Admins can update any file
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
      -- Users can delete files in their own folder
      auth.uid()::text = (storage.foldername(name))[1]
      -- Admins can delete any file
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
      )
    )
  );

-- Create a function to help debug admin access
CREATE OR REPLACE FUNCTION check_admin_access(user_id UUID)
RETURNS TABLE (
  is_admin BOOLEAN,
  can_see_all_pdfs BOOLEAN,
  total_pdfs_visible INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_status BOOLEAN;
  pdf_count INTEGER;
BEGIN
  -- Check if user is admin
  SELECT COALESCE(profiles.is_admin, false) INTO admin_status
  FROM profiles 
  WHERE profiles.id = user_id;
  
  -- Count visible PDFs based on admin status
  IF admin_status THEN
    SELECT COUNT(*) INTO pdf_count FROM pdfs;
  ELSE
    SELECT COUNT(*) INTO pdf_count FROM pdfs WHERE is_approved = true;
  END IF;
  
  RETURN QUERY SELECT admin_status, admin_status, pdf_count;
END;
$$;

-- Test the admin access (replace with actual admin user ID)
-- SELECT * FROM check_admin_access('your-admin-user-id-here');

-- Add helpful indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_pdfs_admin_view ON pdfs(created_at DESC, is_approved, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_check ON profiles(id, is_admin) WHERE is_admin = true;

-- Verify admin user exists and has proper permissions
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'ocomelias8@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Ensure admin profile exists and is marked as admin
    INSERT INTO profiles (id, email, is_admin)
    VALUES (admin_user_id, 'ocomelias8@gmail.com', true)
    ON CONFLICT (id) 
    DO UPDATE SET is_admin = true, email = 'ocomelias8@gmail.com';
    
    RAISE NOTICE 'Admin user configured: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found. Please sign up with ocomelias8@gmail.com first.';
  END IF;
END $$;
