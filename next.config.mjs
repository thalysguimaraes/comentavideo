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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bcegudkpoimfabjrviqi.supabase.co',
        pathname: '/storage/v1/object/public/videos/**',
      }
    ],
    unoptimized: true
  },
}

export default nextConfig
