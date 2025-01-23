/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4001',
        pathname: '/images/**',
      }
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
        destination: 'http://localhost:4001/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:4001/images/:path*',
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
  experimental: {
    optimizeCss: true
  }
}