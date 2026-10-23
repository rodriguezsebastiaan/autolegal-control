import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  experimental: { externalDir: true },
};

export default nextConfig;
