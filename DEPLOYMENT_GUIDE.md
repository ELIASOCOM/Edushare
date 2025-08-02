# EduResources - Complete Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- A Supabase account (free tier)
- A Vercel account (free tier)

## Step 1: Local Development Setup

### 1.1 Clone and Setup Project
\`\`\`bash
# Create new Next.js project
npx create-next-app@latest eduresources --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd eduresources

# Install additional dependencies
npm install @supabase/supabase-js @supabase/ssr lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-alert-dialog @radix-ui/react-progress @radix-ui/react-sheet @radix-ui/react-label
npm install @radix-ui/react-textarea @radix-ui/react-toast
\`\`\`

### 1.2 Copy Project Files
Copy all the files from the CodeProject into your local project directory, maintaining the same structure.

### 1.3 Environment Variables
Create `.env.local` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Step 2: Supabase Setup (Free Tier)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Create new project
4. Choose free tier
5. Wait for project to be ready

### 2.2 Get API Keys
1. Go to Project Settings > API
2. Copy Project URL and anon public key
3. Add to `.env.local`

### 2.3 Setup Database
1. Go to SQL Editor in Supabase dashboard
2. Run the setup script: `scripts/setup-database-final.sql`
3. Run the admin permissions script: `scripts/fix-admin-permissions.sql`

### 2.4 Configure Authentication
1. Go to Authentication > Settings
2. Disable "Enable email confirmations" for easier testing
3. Add your domain to "Site URL" (for production)

### 2.5 Setup Storage
1. Go to Storage
2. The bucket `edu-resources` should be created automatically
3. If not, create it manually with public access disabled

## Step 3: Local Testing

### 3.1 Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 3.2 Test Core Features
1. Sign up with your email (make sure it's `ocomelias8@gmail.com` for admin access)
2. Upload a PDF
3. Test viewing, downloading, liking
4. Test admin panel if you're admin

### 3.3 Common Issues & Solutions

**Issue: "This page has been blocked by Microsoft Edge"**
- This happens with PDF viewing in iframe
- Solution: Use Chrome/Firefox for development
- For production: Implement PDF.js viewer instead of iframe

**Issue: Upload fails**
- Check Supabase storage policies
- Verify bucket exists
- Check file size (max 10MB on free tier)

**Issue: Admin not working**
- Verify your email matches in the database setup
- Check profile creation in database

## Step 4: Production Deployment

### 4.1 Prepare for Production
\`\`\`bash
# Build the project
npm run build

# Test production build locally
npm start
\`\`\`

### 4.2 Deploy to Vercel (Free Tier)
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

### 4.3 Configure Supabase for Production
1. Go to Authentication > Settings
2. Add your Vercel domain to "Site URL"
3. Add redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
4. Update CORS settings if needed

### 4.4 Update Database for Production
Run this SQL to update any hardcoded URLs:
\`\`\`sql
-- Update any localhost references
UPDATE auth.config SET value = 'https://your-domain.vercel.app' WHERE name = 'SITE_URL';
\`\`\`

## Step 5: Free Tier Limitations & Optimizations

### 5.1 Supabase Free Tier Limits
- **Database**: 500MB storage
- **Storage**: 1GB file storage
- **Bandwidth**: 5GB/month
- **API requests**: 50,000/month

### 5.2 Vercel Free Tier Limits
- **Bandwidth**: 100GB/month
- **Function executions**: 100GB-hours/month
- **Build time**: 6,000 minutes/month

### 5.3 Optimizations for Free Tier

**Database Optimization:**
\`\`\`sql
-- Add these indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdfs_search_gin ON pdfs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_pdfs_user_approved ON pdfs(user_id, is_approved);
\`\`\`

**File Size Management:**
- Implement file compression before upload
- Set strict file size limits (5MB recommended)
- Regular cleanup of unused files

**Caching Strategy:**
\`\`\`typescript
// Add to your fetch functions
const { data, error } = await supabase
  .from('pdfs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20) // Limit results to save bandwidth
\`\`\`

## Step 6: Monitoring & Maintenance

### 6.1 Monitor Usage
1. Check Supabase dashboard for usage metrics
2. Monitor Vercel analytics
3. Set up alerts for approaching limits

### 6.2 Regular Maintenance
- Clean up unused files monthly
- Monitor database size
- Update dependencies regularly
- Backup important data

### 6.3 Scaling Considerations
When you hit free tier limits:
1. **Supabase Pro**: $25/month for more storage and bandwidth
2. **Vercel Pro**: $20/month for more bandwidth and features
3. **CDN**: Use Cloudflare for static assets
4. **Database**: Consider read replicas for better performance

## Step 7: Security Checklist

### 7.1 Environment Variables
- Never commit `.env.local` to git
- Use different keys for development/production
- Rotate keys regularly

### 7.2 Database Security
- Review RLS policies regularly
- Monitor for suspicious activity
- Keep Supabase updated

### 7.3 File Upload Security
- Validate file types strictly
- Scan for malware (consider external service)
- Implement rate limiting

## Step 8: Troubleshooting Common Issues

### 8.1 PDF Viewing Issues
\`\`\`typescript
// Alternative PDF viewer implementation
const PDFViewer = ({ pdfUrl }) => {
  return (
    <object
      data={pdfUrl}
      type="application/pdf"
      width="100%"
      height="600px"
    >
      <p>
        Your browser doesn't support PDF viewing.
        <a href={pdfUrl} download>Download the PDF</a>
      </p>
    </object>
  )
}
\`\`\`

### 8.2 Authentication Issues
\`\`\`typescript
// Debug authentication
const debugAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  console.log('Session:', session)
  console.log('Error:', error)
}
\`\`\`

### 8.3 Storage Issues
\`\`\`typescript
// Test storage connectivity
const testStorage = async () => {
  const { data, error } = await supabase.storage.listBuckets()
  console.log('Buckets:', data)
  console.log('Error:', error)
}
\`\`\`

## Step 9: Performance Optimization

### 9.1 Image Optimization
\`\`\`typescript
// Optimize images before upload
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = Math.min(800, img.width)
      canvas.height = (canvas.width / img.width) * img.height
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.8)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
\`\`\`

### 9.2 Database Query Optimization
\`\`\`typescript
// Use pagination and selective fields
const fetchPDFs = async (page: number = 1, limit: number = 12) => {
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await supabase
    .from('pdfs')
    .select('id, title, description, created_at, likes_count, download_count, user_id', { count: 'exact' })
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(from, to)
    
  return { data, error, count }
}
\`\`\`

This guide provides a complete path from local development to production deployment while staying within free tier limits. The key is to monitor usage and optimize as you grow.
