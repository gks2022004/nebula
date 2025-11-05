/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'your-cloudfront-domain.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
