-- First, let's ensure the foreign key relationship exists
-- Drop and recreate the pdfs table with proper foreign key
ALTER TABLE pdfs DROP CONSTRAINT IF EXISTS pdfs_user_id_fkey;

-- Add the foreign key constraint explicitly
ALTER TABLE pdfs ADD CONSTRAINT pdfs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also ensure we have a proper relationship to profiles
-- Note: We can't directly reference profiles from pdfs because profiles references auth.users
-- So we'll need to handle this in our queries differently

-- Let's also make sure all our functions are working
CREATE OR REPLACE FUNCTION increment_download_count(pdf_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pdfs SET download_count = download_count + 1 WHERE id = pdf_id;
END;
$$;

-- Ensure the handle_new_user function is working
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
