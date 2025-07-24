/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true
  },
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

export default nextConfig
