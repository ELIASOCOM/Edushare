-- Update PDFs table to set default approval based on user admin status
-- This will be handled in the application logic, but we can update existing data

-- Set all existing PDFs from admin users to approved
UPDATE pdfs 
SET is_approved = true 
WHERE user_id IN (
  SELECT id FROM profiles WHERE is_admin = true
);

-- Set all PDFs from non-admin users to pending approval (false)
UPDATE pdfs 
SET is_approved = false 
WHERE user_id IN (
  SELECT id FROM profiles WHERE is_admin = false OR is_admin IS NULL
);

-- Create an index for better performance on approval queries
CREATE INDEX IF NOT EXISTS idx_pdfs_approval_status ON pdfs(is_approved, created_at);
CREATE INDEX IF NOT EXISTS idx_pdfs_user_approval ON pdfs(user_id, is_approved);

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_set_pdf_approval ON pdfs;
DROP FUNCTION IF EXISTS set_pdf_approval_status();

-- Create a safer function to automatically set approval status based on user admin status
CREATE OR REPLACE FUNCTION set_pdf_approval_status()
RETURNS TRIGGER AS $$
DECLARE
  user_is_admin BOOLEAN DEFAULT FALSE;
BEGIN
  -- Check if the user is an admin
  SELECT COALESCE(is_admin, FALSE) INTO user_is_admin
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Set approval status based on admin status
  NEW.is_approved = user_is_admin;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set approval status on insert
CREATE TRIGGER trigger_set_pdf_approval
  BEFORE INSERT ON pdfs
  FOR EACH ROW
  EXECUTE FUNCTION set_pdf_approval_status();

-- Update existing PDFs to have proper approval status
UPDATE pdfs 
SET is_approved = COALESCE(
  (SELECT is_admin FROM profiles WHERE profiles.id = pdfs.user_id), 
  FALSE
);
