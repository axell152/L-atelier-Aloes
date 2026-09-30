/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      { source: '/tarifs', destination: '/personnalisation/tarifs', permanent: true },
      { source: '/tarifs/:category', destination: '/personnalisation/tarifs/:category', permanent: true },
    ];
  },
};

export default nextConfig;
