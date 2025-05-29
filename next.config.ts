import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure server external packages
  serverExternalPackages: [],
  // Disable React strict mode to prevent double rendering in development
  reactStrictMode: true,
};

export default nextConfig;
