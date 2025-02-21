import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

// Base Next.js configuration
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ppr: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  reactStrictMode: true,
};

// PWA configuration
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

// Export the combined configuration
export default withPWA(nextConfig);
