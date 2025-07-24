#!/bin/bash

echo "🚀 Educational File Manager - Quick Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local template..."
    cat > .env.local << EOL
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EOL
    echo "📝 Please update .env.local with your Supabase credentials"
else
    echo "✅ .env.local already exists"
fi

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check your configuration."
    exit 1
fi

echo "✅ Build successful"

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run the SQL scripts in your Supabase dashboard"
echo "3. Start development server: npm run dev"
echo "4. Visit http://localhost:3000"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for deployment options"
