import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image Docker memakai output standalone (server.js minimal).
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
