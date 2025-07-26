// 콘텐츠 보안 정책 설정
export function generateCSPHeader(isDev = false) {
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Next.js 개발 모드에서 필요
      "'unsafe-inline'", // 개발 모드에서만 허용
      ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
      'https://vercel.live', // Vercel Analytics
      'https://va.vercel-scripts.com', // Vercel Analytics
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind CSS inline styles
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // Base64 encoded fonts
    ],
    'img-src': [
      "'self'",
      'data:', // Base64 encoded images
      'https:', // External images (placeholder.svg, etc.)
      'blob:', // Blob URLs
    ],
    'connect-src': [
      "'self'",
      'https://vercel.live',
      'https://vitals.vercel-insights.com', // Vercel Web Vitals
      ...(isDev ? ['ws:', 'wss:'] : []), // WebSocket for dev mode
    ],
    'frame-src': ["'none'"], // iframe 차단
    'object-src': ["'none'"], // object, embed, applet 차단
    'base-uri': ["'self'"], // base tag 제한
    'form-action': ["'self'"], // form 제출 제한
    'frame-ancestors': ["'none'"], // clickjacking 방지
    'upgrade-insecure-requests': isDev ? [] : [''], // HTTPS 강제 (프로덕션만)
  }

  // CSP 문자열 생성
  return Object.entries(cspDirectives)
    .filter(([_, values]) => values.length > 0)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ')
}

// 보안 헤더들
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

// CSRF 토큰 생성 (필요시)
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// 입력 검증 함수들
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .trim()
    .slice(0, 1000) // 길이 제한
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug) && slug.length <= 100
}
