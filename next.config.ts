import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js not to bundle pino as it relies on Node.js worker threads
  serverExternalPackages: ['pino', 'pino-pretty'],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
