import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  experimental: {
    // Otimiza o import do Sanity no bundle server
    optimizePackageImports: ["lucide-react", "@sanity/client"],
  },
};

export default nextConfig;
