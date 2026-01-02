import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // ✅ Aumentar a 10MB para soportar imágenes
    },
  },
};

export default nextConfig;