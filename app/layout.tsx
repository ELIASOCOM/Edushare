import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduResources - Educational PDF Sharing Platform | Free Academic Resources",
  description:
    "Discover, share, and access thousands of educational PDFs. Join our community of learners and educators sharing valuable academic resources for free.",
  keywords:
    "educational PDFs, academic resources, free textbooks, study materials, research papers, educational content, learning resources",
  authors: [{ name: "EduResources Team" }],
  creator: "EduResources",
  publisher: "EduResources",
  robots: "index, follow",
  openGraph: {
    title: "EduResources - Free Educational PDF Sharing Platform",
    description:
      "Access thousands of educational PDFs shared by our community. Upload and discover academic resources, textbooks, and study materials.",
    url: "https://eduresources.com",
    siteName: "EduResources",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduResources - Educational PDF Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduResources - Educational PDF Sharing Platform",
    description: "Discover and share educational PDFs with our global community",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://eduresources.com" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduResources" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
