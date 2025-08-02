-- COMPLETELY RESET AND FIX ADMIN PERMISSIONS
-- This will ensure admins have ABSOLUTE control over ALL files

-- First, disable RLS temporarily to clean up
ALTER TABLE pdfs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_likes DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "pdfs_select_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_insert_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_update_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_delete_policy" ON pdfs;

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

DROP POLICY IF EXISTS "pdf_likes_select_policy" ON pdf_likes;
DROP POLICY IF EXISTS "pdf_likes_insert_policy" ON pdf_likes;
DROP POLICY IF EXISTS "pdf_likes_delete_policy" ON pdf_likes;

-- Storage policies
DROP POLICY IF EXISTS "edu_resources_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "edu_resources_delete_policy" ON storage.objects;

-- Re-enable RLS
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_likes ENABLE ROW LEVEL SECURITY;

-- Create SUPER ADMIN policies that give admins COMPLETE access
CREATE POLICY "admin_full_access_pdfs_select" ON pdfs
  FOR SELECT USING (
    -- ADMINS SEE EVERYTHING - NO RESTRICTIONS
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    -- Regular users see approved PDFs or their own
    OR (is_approved = true)
    OR (auth.uid() = user_id)
  );

CREATE POLICY "admin_full_access_pdfs_insert" ON pdfs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "admin_full_access_pdfs_update" ON pdfs
  FOR UPDATE USING (
    -- ADMINS CAN UPDATE ANY PDF
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    -- Regular users can only update their own
    OR (auth.uid() = user_id)
  );

CREATE POLICY "admin_full_access_pdfs_delete" ON pdfs
  FOR DELETE USING (
    -- ADMINS CAN DELETE ANY PDF
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    -- Regular users can only delete their own
    OR (auth.uid() = user_id)
  );

-- Profiles policies
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own_or_admin" ON profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

CREATE POLICY "profiles_delete_admin_only" ON profiles
  FOR DELETE USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- PDF likes policies
CREATE POLICY "pdf_likes_select_all" ON pdf_likes
  FOR SELECT USING (true);

CREATE POLICY "pdf_likes_insert_own" ON pdf_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pdf_likes_delete_own" ON pdf_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies with FULL admin access
CREATE POLICY "storage_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'edu-resources');

CREATE POLICY "storage_insert_own_or_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Users can upload to their own folder
      auth.uid()::text = (storage.foldername(name))[1]
      -- ADMINS CAN UPLOAD ANYWHERE
      OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    )
  );

CREATE POLICY "storage_update_own_or_admin" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Users can update their own files
      auth.uid()::text = (storage.foldername(name))[1]
      -- ADMINS CAN UPDATE ANY FILE
      OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    )
  );

CREATE POLICY "storage_delete_own_or_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND (
      -- Users can delete their own files
      auth.uid()::text = (storage.foldername(name))[1]
      -- ADMINS CAN DELETE ANY FILE
      OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    )
  );

-- Ensure admin user exists and has proper permissions
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
    
    RAISE NOTICE 'SUPER ADMIN configured: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found. Please sign up with ocomelias8@gmail.com first.';
  END IF;
END $$;

-- Create a function to verify admin can see ALL PDFs
CREATE OR REPLACE FUNCTION verify_admin_access()
RETURNS TABLE (
  total_pdfs INTEGER,
  admin_can_see INTEGER,
  regular_can_see INTEGER,
  admin_email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER;
  admin_count INTEGER;
  regular_count INTEGER;
  admin_email_val TEXT;
BEGIN
  -- Count total PDFs
  SELECT COUNT(*) INTO total_count FROM pdfs;
  
  -- Get admin email
  SELECT email INTO admin_email_val FROM profiles WHERE is_admin = true LIMIT 1;
  
  -- Count what admin can see (should be all)
  SELECT COUNT(*) INTO admin_count 
  FROM pdfs 
  WHERE (SELECT is_admin FROM profiles WHERE id = (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)) = true;
  
  -- Count what regular users see
  SELECT COUNT(*) INTO regular_count FROM pdfs WHERE is_approved = true;
  
  RETURN QUERY SELECT total_count, admin_count, regular_count, admin_email_val;
END;
$$;

-- Test the function
SELECT * FROM verify_admin_access();
