import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Habilitar Turbopack explícitamente
  turbopack: {},

  // ✅ Optimización de imágenes
  images: {
    domains: ['cdn.discordapp.com', 'i.imgur.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // ✅ Compresión
  compress: true,

  // ✅ Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // ✅ Optimización de producción
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // ✅ Ocultar indicadores de desarrollo
  devIndicators: false,
};

export default nextConfig;