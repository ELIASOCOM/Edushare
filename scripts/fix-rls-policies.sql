-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view approved pdfs" ON pdfs;
DROP POLICY IF EXISTS "Users can view own pdfs" ON pdfs;
DROP POLICY IF EXISTS "Users can insert own pdfs" ON pdfs;
DROP POLICY IF EXISTS "Users can update own pdfs" ON pdfs;
DROP POLICY IF EXISTS "Users can delete own pdfs" ON pdfs;
DROP POLICY IF EXISTS "Admins can manage all pdfs" ON pdfs;

-- Create simple, non-recursive RLS policies for profiles
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Create simple RLS policies for pdfs
CREATE POLICY "Enable read access for approved pdfs" ON pdfs
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON pdfs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON pdfs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON pdfs
  FOR DELETE USING (auth.uid() = user_id);

-- Create simple RLS policies for pdf_likes
CREATE POLICY "Enable read access for all users" ON pdf_likes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON pdf_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON pdf_likes
  FOR DELETE USING (auth.uid() = user_id);
