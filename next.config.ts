import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Admin photo uploads send one image of up to 10 MB per request.
    serverActions: { bodySizeLimit: "11mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
