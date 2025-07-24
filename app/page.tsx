import type { Metadata } from "next"
import { Header } from "@/components/header"
import { FileManager } from "@/components/file-manager"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "EduHub - Educational Resources Platform | Free Learning Materials",
  description:
    "Discover, preview, and download high-quality educational materials curated for students and educators. Access thousands of resources across Mathematics, Science, Literature, and more.",
  keywords:
    "education, learning resources, educational materials, study guides, academic resources, free education, online learning, student resources, teacher materials",
  authors: [{ name: "EduHub Team" }],
  creator: "EduHub",
  publisher: "EduHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://eduhub.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EduHub - Educational Resources Platform",
    description:
      "Discover, preview, and download high-quality educational materials curated for students and educators",
    url: "https://eduhub.vercel.app",
    siteName: "EduHub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EduHub - Educational Resources Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduHub - Educational Resources Platform",
    description:
      "Discover, preview, and download high-quality educational materials curated for students and educators",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 mb-4">
            Educational Resources Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover, preview, and download high-quality educational materials curated for students and educators
          </p>
        </div>
        <FileManager />
      </main>
      <Footer />
    </div>
  )
}
