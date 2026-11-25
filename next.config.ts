import type { NextConfig } from "next";

// Product photos are served from the Neon Object Storage endpoint (public_read bucket).
const storageEndpoint = process.env.STORAGE_ENDPOINT_URL ?? process.env.AWS_ENDPOINT_URL_S3;
const storageHost = storageEndpoint ? new URL(storageEndpoint).hostname : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Load at runtime instead of bundling (its CJS/ESM hybrid breaks webpack bundling).
  serverExternalPackages: ["@vercel/functions"],
  images: {
    remotePatterns: storageHost ? [{ protocol: "https", hostname: storageHost }] : [],
    // Keys are unique per upload, so optimized images can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    serverActions: {
      // Photos are shrunk in the browser first; this just leaves room for a few at once.
      bodySizeLimit: "4mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
