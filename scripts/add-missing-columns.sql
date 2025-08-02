-- Add is_admin column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Add missing columns to pdfs table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pdfs' AND column_name = 'download_count') THEN
        ALTER TABLE pdfs ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pdfs' AND column_name = 'is_approved') THEN
        ALTER TABLE pdfs ADD COLUMN is_approved BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Update admin status for the admin email
UPDATE profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'ocomelias8@gmail.com'
);

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'ocomelias8@gmail.com' THEN true 
      ELSE false 
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
