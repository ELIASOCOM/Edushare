-- Update RLS policies to give admins full access to manage all PDFs

-- Drop existing PDF policies
DROP POLICY IF EXISTS "pdfs_select_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_insert_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_update_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_delete_policy" ON pdfs;

-- Create new comprehensive PDF policies
CREATE POLICY "pdfs_select_policy" ON pdfs
  FOR SELECT USING (
    is_approved = true 
    OR auth.uid() = user_id 
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
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "pdfs_delete_policy" ON pdfs
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Update storage policies to give admins full access
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdfs_approval_user ON pdfs(is_approved, user_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_created_at ON pdfs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdfs_likes_count ON pdfs(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_pdfs_download_count ON pdfs(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_pdfs_search ON pdfs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
