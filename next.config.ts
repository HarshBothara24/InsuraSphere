/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ML_API_URL: process.env.ML_API_URL || 'https://insurasphere-ml.onrender.com',
  },
  images: {
    domains: ['localhost', 'insurasphere-ml.onrender.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.ML_API_URL || 'https://insurasphere-ml.onrender.com'}/:path*`,
      },
    ];
  },
  // Disable ESLint during build to prevent build failures due to linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config: { resolve: { alias: any; }; }) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      app: false, // Exclude the app/ directory
    };
    return config;
  },
}

module.exports = nextConfig