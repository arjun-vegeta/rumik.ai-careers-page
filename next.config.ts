import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speed up builds by optimizing common package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'motion'],
  },
  
  // Image optimization settings for better performance and quality
  images: {
    qualities: [25, 50, 70, 90],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
