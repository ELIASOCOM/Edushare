-- Drop all existing storage policies for edu-resources bucket
DROP POLICY IF EXISTS "Anyone can view pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view approved pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to storage" ON storage.objects;

-- Ensure the storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('edu-resources', 'edu-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Create new storage policies with unique names
CREATE POLICY "Public read access for pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'edu-resources');

CREATE POLICY "Authenticated users can upload pdfs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own pdfs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own pdfs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'edu-resources' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins have full access to storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'edu-resources' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );
