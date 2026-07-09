import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors in production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
