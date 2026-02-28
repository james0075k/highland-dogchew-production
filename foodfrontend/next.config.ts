/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Serve Cloudinary images at original quality (Cloudinary handles its own optimisation)
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // 1 hour cache for product images
    remotePatterns: [
      // ── Cloudinary CDN (primary — works on localhost & production) ──────────
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },

      // ── Local backend (dev fallback when Cloudinary not configured) ─────────
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/uploads/**',
      },

      // ── Production VPS backend ───────────────────────────────────────────────
      {
        protocol: 'https',
        hostname: 'api.highlanddogchew.co.uk',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'api.highlanddogchew.co.uk',
        pathname: '/uploads/**',
      },

      // ── Render backend ───────────────────────────────────────────────────────
      {
        protocol: 'https',
        hostname: 'himalayanchewbackend.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
