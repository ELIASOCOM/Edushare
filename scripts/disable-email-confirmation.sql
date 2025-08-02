-- This script helps configure settings, but the main changes need to be done in Supabase Dashboard

-- You can run this to check current auth settings
SELECT 
  name,
  value
FROM 
  auth.config 
WHERE 
  name IN ('DISABLE_SIGNUP', 'ENABLE_SIGNUP', 'SITE_URL', 'MAILER_AUTOCONFIRM');

-- Note: The main email confirmation settings must be changed in the Supabase Dashboard
-- Go to Authentication > Settings and disable "Enable email confirmations"
