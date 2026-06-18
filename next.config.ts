import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  serverExternalPackages: ["exceljs"],
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version, 
  }
};

export default nextConfig;
