/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Local backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/uploads/**',
      },

      // Render backend
      {
        protocol: 'https',
        hostname: 'himalayanchewbackend.onrender.com',
        pathname: '/uploads/**',
      },

      // VPS API domain
      {
        protocol: 'http',
        hostname: 'api.highlanddogchew.co.uk',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.highlanddogchew.co.uk',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
