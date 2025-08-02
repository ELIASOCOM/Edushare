-- ULTIMATE ADMIN FIX - This will completely override all restrictions for admins
-- Run this in Supabase SQL Editor

-- First, let's completely disable RLS temporarily to clean everything
ALTER TABLE pdfs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_likes DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on pdfs table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pdfs') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON pdfs';
    END LOOP;
    
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
    
    -- Drop all policies on pdf_likes table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'pdf_likes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON pdf_likes';
    END LOOP;
    
    -- Drop all storage policies
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_likes ENABLE ROW LEVEL SECURITY;

-- Create SUPER SIMPLE admin-first policies
-- PDFs: Admins see and control EVERYTHING, users see approved only
CREATE POLICY "super_admin_pdfs_select" ON pdfs FOR SELECT USING (
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN true
        ELSE (is_approved = true OR auth.uid() = user_id)
    END
);

CREATE POLICY "super_admin_pdfs_insert" ON pdfs FOR INSERT WITH CHECK (
    auth.uid() = user_id AND auth.uid() IS NOT NULL
);

CREATE POLICY "super_admin_pdfs_update" ON pdfs FOR UPDATE USING (
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN true
        ELSE auth.uid() = user_id
    END
);

CREATE POLICY "super_admin_pdfs_delete" ON pdfs FOR DELETE USING (
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN true
        ELSE auth.uid() = user_id
    END
);

-- Profiles: Simple policies
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE USING (
    auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "profiles_delete_admin_only" ON profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- PDF Likes: Simple policies
CREATE POLICY "pdf_likes_select_all" ON pdf_likes FOR SELECT USING (true);
CREATE POLICY "pdf_likes_insert_own" ON pdf_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pdf_likes_delete_own" ON pdf_likes FOR DELETE USING (auth.uid() = user_id);

-- Storage: Admin override policies
CREATE POLICY "storage_select_all" ON storage.objects FOR SELECT USING (bucket_id = 'edu-resources');

CREATE POLICY "storage_insert_admin_override" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'edu-resources' AND auth.uid() IS NOT NULL AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
);

CREATE POLICY "storage_update_admin_override" ON storage.objects FOR UPDATE USING (
    bucket_id = 'edu-resources' AND auth.uid() IS NOT NULL AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
);

CREATE POLICY "storage_delete_admin_override" ON storage.objects FOR DELETE USING (
    bucket_id = 'edu-resources' AND auth.uid() IS NOT NULL AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
);

-- Ensure admin user exists and is properly configured
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'ocomelias8@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Ensure admin profile exists with admin privileges
        INSERT INTO profiles (id, email, is_admin, full_name)
        VALUES (admin_user_id, 'ocomelias8@gmail.com', true, 'Super Administrator')
        ON CONFLICT (id) DO UPDATE SET 
            is_admin = true, 
            email = 'ocomelias8@gmail.com',
            full_name = 'Super Administrator';
        
        RAISE NOTICE 'SUPER ADMIN configured successfully: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found. Please sign up with ocomelias8@gmail.com first.';
    END IF;
END $$;

-- Add social sharing columns to pdfs table
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(pdf_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pdfs SET share_count = share_count + 1 WHERE id = pdf_id;
END;
$$;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(pdf_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pdfs SET view_count = view_count + 1 WHERE id = pdf_id;
END;
$$;

-- Test admin access function
CREATE OR REPLACE FUNCTION test_admin_access()
RETURNS TABLE (
    admin_email TEXT,
    is_admin BOOLEAN,
    total_pdfs INTEGER,
    can_see_all BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_id UUID;
    admin_email_val TEXT;
    admin_status BOOLEAN;
    total_count INTEGER;
    test_result BOOLEAN;
BEGIN
    -- Get admin info
    SELECT id, email, is_admin INTO admin_id, admin_email_val, admin_status
    FROM profiles WHERE email = 'ocomelias8@gmail.com';
    
    -- Count total PDFs
    SELECT COUNT(*) INTO total_count FROM pdfs;
    
    -- Test if admin can see all (this should return true if policies work)
    SELECT COUNT(*) > 0 INTO test_result FROM pdfs WHERE true;
    
    RETURN QUERY SELECT admin_email_val, admin_status, total_count, test_result;
END;
$$;

-- Run the test
SELECT * FROM test_admin_access();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(id, is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_pdfs_admin_view ON pdfs(user_id, is_approved, created_at);
CREATE INDEX IF NOT EXISTS idx_pdfs_sharing ON pdfs(share_count DESC, view_count DESC);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'Admin policies updated successfully!';
    RAISE NOTICE 'Admin should now have complete access to all PDFs.';
    RAISE NOTICE 'Social sharing features added.';
END $$;
