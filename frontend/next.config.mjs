/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'images.ashank.tech'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend',
        port: '4001',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.ashank.tech',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/images/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/images/:path*`,
      },
    ]
  },
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig