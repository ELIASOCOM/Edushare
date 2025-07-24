# EduHub - Educational Resources Platform

A modern, responsive educational file manager built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX** - Glassmorphism design with smooth animations
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Advanced Search** - Filter by category, file type, and search terms
- **File Preview** - Preview files before downloading
- **Interactive Navigation** - Dropdown menus with subject categories
- **Dark Mode Support** - Built-in theme switching
- **Performance Optimized** - Fast loading and smooth interactions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Animations**: Tailwind CSS + CSS transitions

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Build
\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── header.tsx    # Navigation header
│   ├── file-manager.tsx # Main file manager
│   ├── footer.tsx    # Footer component
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts      # Utility functions
└── public/           # Static assets
\`\`\`

## 🎨 Customization

- **Colors**: Modify `tailwind.config.ts` and `globals.css`
- **Components**: Edit files in `/components`
- **Data**: Update the resources array in `file-manager.tsx`

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Environment Variables

No environment variables required for basic functionality.

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for education
