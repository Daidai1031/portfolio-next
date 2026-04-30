import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '100.110.169.144'],
}

export default nextConfig