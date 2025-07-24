# 🚀 Complete Supabase Setup Guide for EduHub

## 📋 Prerequisites
- Supabase account created
- Project created with URL: `https://qovcenajobqpvpsolrki.supabase.co`

## 🔧 Step-by-Step Setup

### 1. Environment Variables
Create a `.env.local` file in your project root with:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://qovcenajobqpvpsolrki.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmNlbmFqb2JxcHZwc29scmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODE2ODgsImV4cCI6MjA2ODg1NzY4OH0.iG9TxgN-nFwwJZswNrO7jjYqfit-5DTXCjdOCG4GaQI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmNlbmFqb2JxcHZwc29scmtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI4MTY4OCwiZXhwIjoyMDY4ODU3Njg4fQ.ifteUn9nNtBiLZUTGxawr8UTIAIdpn8vji70UQZpXLo
\`\`\`

### 2. Database Setup
Run these SQL scripts in your Supabase SQL Editor **in this exact order**:

#### Script 1: Create Tables
\`\`\`sql
-- Run: scripts/01-setup-database-updated.sql
\`\`\`

#### Script 2: Setup Policies  
\`\`\`sql
-- Run: scripts/02-setup-policies-updated.sql
\`\`\`

#### Script 3: Create Functions
\`\`\`sql
-- Run: scripts/03-setup-functions-fixed.sql
\`\`\`

#### Script 4: Seed Sample Data
\`\`\`sql
-- Run: scripts/04-seed-data-fixed-final.sql
\`\`\`

#### Script 5: Create Storage Bucket (Optional)
\`\`\`sql
-- Run: scripts/05-create-storage-bucket.sql
\`\`\`

### 3. Authentication Setup

#### Enable Email Authentication:
1. Go to **Authentication > Settings** in Supabase Dashboard
2. Enable **Email** provider
3. Configure **Site URL**: `http://localhost:3000` (for development)
4. Add **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

#### Email Templates (Optional):
1. Go to **Authentication > Email Templates**
2. Customize confirmation and reset password emails

### 4. Row Level Security (RLS)
All tables should have RLS enabled automatically by the setup scripts:
- ✅ `profiles` - Users can only edit their own profile
- ✅ `resources` - Public read, authenticated users can create
- ✅ `favorites` - Users can only manage their own favorites  
- ✅ `ratings` - Users can rate resources, everyone can view ratings
- ✅ `downloads` - Users can only see their own download history

### 5. Storage Setup (For File Uploads)
If you plan to add file upload functionality:

1. Go to **Storage** in Supabase Dashboard
2. Create bucket named: `edu_resources`
3. Set as **Public bucket**
4. Run the storage policies script

### 6. Verify Setup

#### Check Tables:
Go to **Table Editor** and verify these tables exist:
- `profiles`
- `resources` (should have 25 sample resources)
- `favorites`
- `ratings`
- `downloads`

#### Test Authentication:
1. Start your app: `npm run dev`
2. Go to `http://localhost:3000`
3. Try registering a new account
4. Check if profile is created automatically

#### Test Features:
- ✅ Browse resources
- ✅ Search and filter
- ✅ Add to favorites (requires login)
- ✅ Rate resources (requires login)
- ✅ Download tracking

### 7. Production Deployment

#### Vercel Environment Variables:
Add these to your Vercel project settings:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://qovcenajobqpvpsolrki.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmNlbmFqb2JxcHZwc29scmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODE2ODgsImV4cCI6MjA2ODg1NzY4OH0.iG9TxgN-nFwwJZswNrO7jjYqfit-5DTXCjdOCG4GaQI
\`\`\`

#### Update Supabase Auth Settings:
1. Add your production domain to **Site URL**
2. Add production callback URLs
3. Update CORS settings if needed

### 8. Common Issues & Solutions

#### "Invalid characters" error:
- ✅ Fixed: Use `edu_resources` for bucket names (underscores only)
- ✅ Avoid hyphens, spaces, or special characters in Supabase names

#### Foreign key constraint errors:
- ✅ Fixed: Sample data uses NULL for uploaded_by
- ✅ Real users will be properly referenced when they sign up

#### RLS policy errors:
- ✅ Fixed: Policies allow system resources and user resources
- ✅ Anonymous users can browse, authenticated users can interact

### 9. Next Steps

After setup is complete:
- 🎯 Test all functionality thoroughly
- 🎯 Customize the sample data for your needs
- 🎯 Add file upload functionality (optional)
- 🎯 Set up email notifications (optional)
- 🎯 Add admin panel for content management (optional)

## 🆘 Need Help?

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify all environment variables are set correctly
3. Ensure all SQL scripts ran without errors
4. Test with a fresh browser session (clear cookies)

Your EduHub platform should now be fully functional with authentication, database integration, and all features working! 🎉
