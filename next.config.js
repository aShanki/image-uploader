/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.discordapp.com'], // Allow Discord avatar images
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'sharp'];
    return config;
  },
}

module.exports = nextConfig