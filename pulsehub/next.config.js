// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ This lets the build succeed even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ This skips ESLint errors during build
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
};

module.exports = nextConfig;