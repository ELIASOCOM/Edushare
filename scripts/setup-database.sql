-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pdfs table
CREATE TABLE IF NOT EXISTS pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pdf_likes table
CREATE TABLE IF NOT EXISTS pdf_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pdf_id UUID REFERENCES pdfs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pdf_id, user_id)
);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for pdfs
CREATE POLICY "Anyone can view pdfs" ON pdfs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own pdfs" ON pdfs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pdfs" ON pdfs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pdfs" ON pdfs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pdf_likes
CREATE POLICY "Anyone can view pdf_likes" ON pdf_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON pdf_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON pdf_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Anyone can view pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdfs');

CREATE POLICY "Users can upload pdfs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own pdfs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own pdfs" ON storage.objects
  FOR DELETE USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_pdf_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pdfs SET likes_count = likes_count + 1 WHERE id = NEW.pdf_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pdfs SET likes_count = likes_count - 1 WHERE id = OLD.pdf_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update likes count
DROP TRIGGER IF EXISTS pdf_likes_count_trigger ON pdf_likes;
CREATE TRIGGER pdf_likes_count_trigger
  AFTER INSERT OR DELETE ON pdf_likes
  FOR EACH ROW EXECUTE FUNCTION update_pdf_likes_count();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_likes ENABLE ROW LEVEL SECURITY;
