/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react', 'framer-motion'],
  },
  images: {
    // Serve Cloudinary images at original quality (Cloudinary handles its own optimisation)
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year — product images rarely change
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
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
