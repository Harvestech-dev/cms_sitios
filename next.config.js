/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'gvzandbzgyiobaaulpzh.supabase.co', // Dominio de Supabase Storage
      'localhost',
      'placehold.co',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gvzandbzgyiobaaulpzh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Otras configuraciones...
  typescript: {
    // ⚠️ Usar solo si necesitas ignorar errores de TS temporalmente
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Usar solo si necesitas ignorar errores de ESLint temporalmente
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 