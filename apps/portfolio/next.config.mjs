/** @type {import('next').NextConfig} */
const nullTGToken = 'NULL_TG_TOKEN';
const nullTGChatId = 'NULL_TG_CHAT_ID';

const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.pdf$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'static/assets/cv/',
          publicPath: '/_next/static/assets/cv/',
        },
      },
    });

    config.module.rules.push({
      test: /\.(mp4|webm|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'static/assets/videos/',
          publicPath: '/_next/static/assets/videos/',
        },
      },
    });

    return config;
  },
  env: {
    NEXT_PUBLIC_TG_TOKEN: process.env.NEXT_PUBLIC_TG_TOKEN ?? nullTGToken,
    NEXT_PUBLIC_TG_CHAT_ID: process.env.NEXT_PUBLIC_TG_CHAT_ID ?? nullTGChatId,
  },
};

export default nextConfig;
