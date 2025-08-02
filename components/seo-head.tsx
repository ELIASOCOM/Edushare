"use client"

import Head from "next/head"

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
}

export default function SEOHead({
  title = "EduResources - Educational PDF Sharing Platform",
  description = "Discover, share, and access thousands of educational PDFs. Join our community of learners and educators.",
  keywords = "educational PDFs, academic resources, free textbooks, study materials",
  canonicalUrl = "https://eduresources.com",
  ogImage = "/og-image.png",
}: SEOHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* PWA */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="EduResources" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "EduResources",
            description: description,
            url: canonicalUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${canonicalUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </Head>
  )
}
