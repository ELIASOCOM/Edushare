-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned);

-- Function to make a user admin by username
CREATE OR REPLACE FUNCTION make_user_admin(username_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_found BOOLEAN := FALSE;
BEGIN
    UPDATE profiles 
    SET role = 'admin' 
    WHERE username = username_input;
    
    -- Check if any rows were affected
    IF FOUND THEN
        user_found := TRUE;
    END IF;
    
    RETURN user_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION make_user_admin(TEXT) TO authenticated;

-- Make ocomelias8 an admin
SELECT make_user_admin('ocomelias8');

-- Create RLS policies for admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

-- Admin policies for resources
DROP POLICY IF EXISTS "Admins can view all resources" ON resources;
CREATE POLICY "Admins can view all resources" ON resources
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update all resources" ON resources;
CREATE POLICY "Admins can update all resources" ON resources
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete all resources" ON resources;
CREATE POLICY "Admins can delete all resources" ON resources
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

-- Admin policies for other tables
DROP POLICY IF EXISTS "Admins can view all favorites" ON favorites;
CREATE POLICY "Admins can view all favorites" ON favorites
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete all favorites" ON favorites;
CREATE POLICY "Admins can delete all favorites" ON favorites
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view all ratings" ON ratings;
CREATE POLICY "Admins can view all ratings" ON ratings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete all ratings" ON ratings;
CREATE POLICY "Admins can delete all ratings" ON ratings
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view all downloads" ON downloads;
CREATE POLICY "Admins can view all downloads" ON downloads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete all downloads" ON downloads;
CREATE POLICY "Admins can delete all downloads" ON downloads
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
