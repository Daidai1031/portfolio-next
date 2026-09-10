import type { NextConfig } from 'next'

// Category slugs were renamed: physical-computing → tangible, ai-digital-products →
// software, creative-media → creative, architecture-fabrication → built.
const legacyCategorySlugs: Record<string, string> = {
  'physical-computing': 'tangible',
  'ai-digital-products': 'software',
  'creative-media': 'creative',
  'architecture-fabrication': 'built',
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '100.110.169.144'],
  async redirects() {
    const categoryRedirects = Object.entries(legacyCategorySlugs).flatMap(
      ([oldSlug, newSlug]) => [
        {
          source: `/projects/${oldSlug}/:path*`,
          destination: `/projects/${newSlug}/:path*`,
          permanent: true,
        },
        {
          source: '/projects',
          has: [{ type: 'query' as const, key: 'category', value: oldSlug }],
          destination: `/projects?category=${newSlug}`,
          permanent: true,
        },
        {
          source: `/categories/${oldSlug}/:path*`,
          destination: `/projects/${newSlug}/:path*`,
          permanent: true,
        },
      ],
    )

    return [
      ...categoryRedirects,
      {
        source: '/categories/:category*',
        destination: '/projects/:category*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
