-- Ensure the storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('edu-resources', 'edu-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies (these we can modify)
DROP POLICY IF EXISTS "Public read access for pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- Create new storage policies with unique names
CREATE POLICY "edu_resources_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'edu-resources');

CREATE POLICY "edu_resources_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "edu_resources_update_policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "edu_resources_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Ensure increment_download_count function exists
CREATE OR REPLACE FUNCTION increment_download_count(pdf_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pdfs SET download_count = download_count + 1 WHERE id = pdf_id;
END;
$$;

-- Make sure our custom tables have proper policies
-- Note: We're not touching storage.objects table properties, only policies

-- Verify profiles table policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Verify pdfs table policies
DROP POLICY IF EXISTS "pdfs_select_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_insert_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_update_policy" ON pdfs;
DROP POLICY IF EXISTS "pdfs_delete_policy" ON pdfs;

CREATE POLICY "pdfs_select_policy" ON pdfs
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "pdfs_insert_policy" ON pdfs
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "pdfs_update_policy" ON pdfs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pdfs_delete_policy" ON pdfs
  FOR DELETE USING (auth.uid() = user_id);

-- Verify pdf_likes table policies
DROP POLICY IF EXISTS "pdf_likes_select_policy" ON pdf_likes;
DROP POLICY IF EXISTS "pdf_likes_insert_policy" ON pdf_likes;
DROP POLICY IF EXISTS "pdf_likes_delete_policy" ON pdf_likes;

CREATE POLICY "pdf_likes_select_policy" ON pdf_likes
  FOR SELECT USING (true);

CREATE POLICY "pdf_likes_insert_policy" ON pdf_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "pdf_likes_delete_policy" ON pdf_likes
  FOR DELETE USING (auth.uid() = user_id);
