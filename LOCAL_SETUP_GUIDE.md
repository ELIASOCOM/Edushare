# 🚀 Educational File Manager - Local Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

## 📋 Step-by-Step Setup

### 1. Clone/Download the Project
\`\`\`bash
# If you have the project files, navigate to the directory
cd edu-file-manager
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Install all required packages
npm install

# Or if you prefer yarn
yarn install
\`\`\`

### 3. Set Up Supabase Project

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be ready (2-3 minutes)

#### B. Get Your Supabase Credentials
1. Go to Project Settings → API
2. Copy your Project URL and anon public key
3. Copy your service role key (keep this secret!)

### 4. Configure Environment Variables
Create a `.env.local` file in your project root:

\`\`\`env
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 5. Set Up Database

#### A. Run SQL Scripts in Order
Go to your Supabase dashboard → SQL Editor and run these scripts in order:

1. **Database Setup:**
   \`\`\`sql
   -- Copy and paste content from scripts/01-setup-database-updated.sql
   \`\`\`

2. **Security Policies:**
   \`\`\`sql
   -- Copy and paste content from scripts/02-setup-policies-updated.sql
   \`\`\`

3. **Database Functions:**
   \`\`\`sql
   -- Copy and paste content from scripts/03-setup-functions-fixed.sql
   \`\`\`

4. **Seed Data:**
   \`\`\`sql
   -- Copy and paste content from scripts/04-seed-data-fixed-final.sql
   \`\`\`

5. **Storage Bucket:**
   \`\`\`sql
   -- Copy and paste content from scripts/05-create-storage-bucket.sql
   \`\`\`

6. **Notifications:**
   \`\`\`sql
   -- Copy and paste content from scripts/06-notifications-table.sql
   \`\`\`

7. **Admin Roles:**
   \`\`\`sql
   -- Copy and paste content from scripts/07-admin-roles-fixed.sql
   \`\`\`

#### B. Enable Authentication
1. Go to Authentication → Settings
2. Enable Email authentication
3. Disable email confirmations for testing (optional)

#### C. Configure Storage
1. Go to Storage → Policies
2. The storage policies should be created by the SQL scripts

### 6. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Your app will be available at `http://localhost:3000`

## 🧪 Testing the Application

### 1. Create Test Account
1. Go to `http://localhost:3000/auth/register`
2. Register with username: `ocomelias8` (this will be auto-admin)
3. Or create any other test account

### 2. Test Core Features
- ✅ **Authentication:** Login/logout/register
- ✅ **File Upload:** Upload test files
- ✅ **Search:** Search for resources
- ✅ **Favorites:** Add/remove favorites
- ✅ **Profile:** Update profile information
- ✅ **Community:** View community features
- ✅ **Admin Panel:** Access `/admin` as ocomelias8

### 3. Test Admin Features (as ocomelias8)
- ✅ **User Management:** View, ban, promote users
- ✅ **Resource Management:** Approve, feature, delete resources
- ✅ **Statistics:** View system statistics

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Module not found" errors
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

#### 2. Supabase connection errors
- Check your `.env.local` file has correct credentials
- Ensure Supabase project is active
- Verify API keys are correct

#### 3. Database errors
- Ensure all SQL scripts ran successfully
- Check Supabase logs in dashboard
- Verify RLS policies are enabled

#### 4. Authentication issues
- Check Authentication settings in Supabase
- Ensure email confirmation is disabled for testing
- Clear browser cookies/localStorage

#### 5. File upload issues
- Verify storage bucket exists
- Check storage policies
- Ensure file size limits

### Development Commands:
\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
\`\`\`

## 📱 Features Available for Testing

### 🔐 Authentication System
- User registration and login
- Password reset functionality
- Profile management

### 📁 File Management
- File upload with drag & drop
- File categorization
- File search and filtering
- Download tracking

### ⭐ Social Features
- Favorites system
- User ratings
- Community interactions
- Achievement system

### 🛡️ Admin Panel
- User management (ban, promote, delete)
- Resource moderation
- System statistics
- Content approval workflow

### 🔔 Notifications
- Real-time notifications
- Activity tracking
- System alerts

## 🎯 Next Steps After Setup

1. **Test all features** thoroughly
2. **Upload sample files** to test file management
3. **Create multiple test users** to test social features
4. **Test admin functionality** with the ocomelias8 account
5. **Check responsive design** on different screen sizes

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure all SQL scripts executed without errors

Happy testing! 🚀
\`\`\`

Here's a quick installation script you can run:
