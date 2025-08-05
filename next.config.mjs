import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // React 18 호환성을 위한 설정
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
    optimizePackageImports: [
      "lucide-react", 
      "@radix-ui/react-icons",
      "framer-motion",
      "zustand",
      "date-fns",
      "recharts"
    ],
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
    // React 18 호환성을 위한 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // 개발 환경에서 안정성을 위한 설정
    if (dev) {
      config.watchOptions = {
        poll: false,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
      };
    }

    // Deprecation 경고 억제
    config.infrastructureLogging = {
      level: 'error',
    };

    // Console 경고 억제
    config.stats = {
      ...config.stats,
      warningsFilter: [
        /punycode/,
        /DeprecationWarning/,
        /\[DEP0040\]/,
      ],
    };

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 10,
          },
        },
      },
    };

    return config;
  },
  serverRuntimeConfig: {
    // 서버 사이드 설정
  },
  publicRuntimeConfig: {
    // 클라이언트 사이드 설정
  },
  compress: true,
  poweredByHeader: false,
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
              "img-src 'self' data: blob:",
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
