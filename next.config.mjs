/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: true,
  },
  output: 'standalone',
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'],
  },
  // Desabilitar geração estática para páginas que precisam de autenticação
  staticPageGenerationTimeout: 0,
};

export default nextConfig;
