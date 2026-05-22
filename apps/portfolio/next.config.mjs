/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
  transpilePackages: ['@repo/utils'],
  reactStrictMode: false,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Preserve the old /[lang]/performances/... URLs after the rename to /talks.
        source: '/:lang/performances/:path*',
        destination: '/:lang/talks/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
