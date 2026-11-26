import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(process.cwd()),
  serverExternalPackages: ["sharp", "paper", "opentype.js", "@prisma/client"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
