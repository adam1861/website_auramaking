/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' }
    ],
    unoptimized: true
  },
  // Vercel optimizations
  poweredByHeader: false,
  compress: true
};

export default nextConfig;
