import { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // React 19 호환성을 위한 설정
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년 캐시
    domains: [
      "imagedelivery.net",
      // 필요시 다른 외부 도메인도 추가
    ],
  },
  experimental: {
    // ✅ REDUCED OPTIMIZATION SCOPE - Prevent chunk conflicts
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "clsx",
      "tailwind-merge"
    ],
    // ✅ WEBPACK OPTIMIZATION FOR CHUNK STABILITY
    webpackBuildWorker: false,
    // ✅ FIXED: Disable problematic CSS optimization causing critters error
    // optimizeCss: true,
  },
  // Next.js 15에 맞는 설정
  serverExternalPackages: [],
  ...(process.env.NODE_ENV === "development" && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000,
      pagesBufferLength: 2,
    },
  }),
  webpack: (config, { dev, isServer }) => {
    // ✅ ENHANCED React 19 + Next.js 15 COMPATIBILITY
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      
      // ✅ CHUNK LOADING OPTIMIZATION - Removed problematic React aliases
    }

    // ✅ DEVELOPMENT ENVIRONMENT OPTIMIZATION
    if (dev) {
      config.watchOptions = {
        poll: false,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
      };
      
      // ✅ DEV: Simplified chunk configuration for development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Simple vendor chunk for development
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              enforce: true,
            },
          },
        },
      };
    }

    // ✅ ENHANCED LOGGING CONFIGURATION
    config.infrastructureLogging = {
      level: 'error',
      debug: false,
    };

    // ✅ COMPREHENSIVE WARNING SUPPRESSION
    config.stats = {
      ...config.stats,
      warningsFilter: [
        /punycode/,
        /DeprecationWarning/,
        /\[DEP0040\]/,
        /Critical dependency/,
        /Module not found/,
        /Failed to parse source map/,
      ],
    };

    // ✅ PRODUCTION CHUNK STRATEGY - Only apply in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 30000, // Increased minimum size
          maxSize: 500000, // Relaxed maximum size for better bundling
          maxAsyncRequests: 6, // Limit async requests
          maxInitialRequests: 4, // Limit initial requests
          cacheGroups: {
            // Consolidate vendor chunks for better performance
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
              enforce: true,
              reuseExistingChunk: true,
            },
            // React ecosystem in single chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-.*|@react)[\\/]/,
              name: "react-vendor",
              chunks: "all",
              priority: 20,
              enforce: true,
            },
            // UI libraries consolidated
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react)[\\/]/,
              name: "ui-vendor",
              chunks: "all",
              priority: 15,
              enforce: true,
            },
            // Utilities and async libraries
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority|tailwind-merge|zustand|zod)[\\/]/,
              name: "utils-vendor",
              chunks: "all",
              priority: 12,
            },
            // Performance monitoring (keep async for better performance)
            monitoring: {
              test: /[\\/]node_modules[\\/](web-vitals|@sentry)[\\/]/,
              name: "monitoring",
              chunks: "async",
              priority: 8,
            },
            // Default group for remaining vendor code
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 300000,
            },
          },
        },
        // Enhanced module concatenation for React 19
        concatenateModules: true,
        usedExports: true,
        sideEffects: false,
        // Improved runtime chunk optimization
        runtimeChunk: {
          name: 'runtime'
        },
      };
    }

    return config;
  },
  compress: true,
  poweredByHeader: false,
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  // Bundle optimization
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://imagedelivery.net https://fonts.gstatic.com",
              "connect-src 'self'",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
