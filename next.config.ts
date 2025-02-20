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
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

// PWA configuration
const withPWA = withPWAInit({
  dest: "public",
  disable: false,
});

// Export the combined configuration
export default withPWA(nextConfig);
