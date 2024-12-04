/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs']
  }
};

export default nextConfig;
