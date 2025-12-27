/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeFonts: true,
  },
  // Add this if you're using external image domains
  images: {
    domains: ['your-image-domain.com'],
  },
  // Enable static HTML export if needed
  // output: 'export',
}

module.exports = nextConfig
