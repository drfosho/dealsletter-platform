import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint configuration moved to eslint.config.mjs in Next.js 16
  // TypeScript errors are checked during build by default
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
