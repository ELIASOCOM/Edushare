-- Create storage bucket for file uploads (if you plan to add file upload functionality)
-- Run this in your Supabase SQL Editor

-- Create a storage bucket with a valid name (only letters, digits, underscores)
INSERT INTO storage.buckets (id, name, public)
VALUES ('edu_resources', 'edu_resources', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'edu_resources');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'edu_resources' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE 
USING (bucket_id = 'edu_resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE 
USING (bucket_id = 'edu_resources' AND auth.uid()::text = (storage.foldername(name))[1]);
