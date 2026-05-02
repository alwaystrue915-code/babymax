/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for performance
  compress: true,
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.nexapk.in',
        pathname: '/**',
      },
    ],
  },
  // Turbopack configuration (Next.js 16+)
  turbopack: {},
  // Webpack optimizations (only used when --webpack flag is passed)
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Split GSAP into separate chunk (loaded lazily)
        gsap: {
          name: 'gsap',
          test: /[\\/]node_modules[\\/]gsap[\\/]/,
          priority: 20,
        },
        // Split OGL (Plasma) into separate chunk
        ogl: {
          name: 'ogl',
          test: /[\\/]node_modules[\\/]ogl[\\/]/,
          priority: 20,
        },
        // Common vendor libraries
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name: 'lib',
          priority: 10,
        },
      },
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://wingo-tool.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;

