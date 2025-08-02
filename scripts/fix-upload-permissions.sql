-- Ensure the storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('edu-resources', 'edu-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Drop all existing storage policies to start fresh
DROP POLICY IF EXISTS "Public read access for pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own pdfs" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'edu-resources');

CREATE POLICY "Allow users to update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Check if increment_download_count function exists, if not create it
CREATE OR REPLACE FUNCTION increment_download_count(pdf_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pdfs SET download_count = download_count + 1 WHERE id = pdf_id;
END;
$$;

-- Make sure all tables have proper RLS policies
-- Profiles policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;

CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- PDFs policies
DROP POLICY IF EXISTS "Enable read access for approved pdfs" ON pdfs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON pdfs;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON pdfs;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON pdfs;

CREATE POLICY "Enable read access for approved pdfs" ON pdfs
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON pdfs
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on user_id" ON pdfs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON pdfs
  FOR DELETE USING (auth.uid() = user_id);

-- PDF likes policies
DROP POLICY IF EXISTS "Enable read access for all users" ON pdf_likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON pdf_likes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON pdf_likes;

CREATE POLICY "Enable read access for all users" ON pdf_likes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON pdf_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for users based on user_id" ON pdf_likes
  FOR DELETE USING (auth.uid() = user_id);
