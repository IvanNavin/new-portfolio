export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const backendUrl =
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3000';
