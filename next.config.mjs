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

    // ✅ ENHANCED PRODUCTION CHUNK STRATEGY - Prevent null property errors
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000, // Reduced for better chunking
          maxSize: 300000, // Smaller chunks for stability
          maxAsyncRequests: 8,
          maxInitialRequests: 5,
          automaticNameDelimiter: '-',
          cacheGroups: {
            // Framework chunk (React + Next.js)
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 40,
              enforce: true,
              reuseExistingChunk: true,
            },
            // UI libraries consolidated
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react)[\\/]/,
              name: "ui-libs",
              chunks: "all",
              priority: 30,
              enforce: true,
              reuseExistingChunk: true,
            },
            // Utilities
            utils: {
              test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge|zod)[\\/]/,
              name: "utils",
              chunks: "all",
              priority: 25,
              reuseExistingChunk: true,
            },
            // Other vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendor",
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              minChunks: 1,
            },
            // Default group
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 200000,
            },
          },
        },
        // ✅ SAFER: Simplified module optimization to prevent null errors
        usedExports: true,
        sideEffects: false,
        // ✅ FIXED: Simpler runtime chunk naming to prevent null reference errors
        runtimeChunk: 'single',
        // ✅ ADDED: Better module resolution
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' data:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com data:",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://imagedelivery.net https://fonts.gstatic.com https://*.vercel.app",
              "connect-src 'self'",
              "media-src 'self' data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self'",
              "child-src 'self'",
              "worker-src 'self' blob:",
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
      {
        source: "/_next/static/css/(.*)",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/chunks/(.*)",
        headers: [
          {
            key: "Content-Type", 
            value: "application/javascript; charset=utf-8",
          },
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
