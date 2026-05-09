import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@invoice-app/api-contracts',
    '@invoice-app/shared-api',
    '@invoice-app/shared-utils',
    '@invoice-app/shared-ui',
  ],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
