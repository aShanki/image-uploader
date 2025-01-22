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
  experimental: {
    serverActions: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:4001/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://backend:4001/images/:path*',
      },
    ]
  },
}

export default nextConfig