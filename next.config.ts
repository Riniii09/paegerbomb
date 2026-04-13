import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-lib needs node-compatible environment for some APIs
  // We process everything client-side, so no server config needed
  webpack: (config) => {
    // Suppress canvas warning from pdfjs (not used)
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
