import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Não falha o build por lint em desenvolvimento.
    // Mudar para true quando o projeto estiver estável.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Não falha o build por erros de tipo não-fatais.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@sanity/client"],
  },
};

export default nextConfig;
