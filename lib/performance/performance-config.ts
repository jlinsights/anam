/**
 * Performance Configuration
 * 중앙화된 성능 설정 관리
 */

// Core Web Vitals 목표값
export const PERFORMANCE_TARGETS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500, // 2.5초 이하
    needsImprovement: 4000, // 4초 이하
    poor: 4000, // 4초 초과
  },
  // First Input Delay (FID) / Interaction to Next Paint (INP)
  INP: {
    good: 200, // 200ms 이하
    needsImprovement: 500, // 500ms 이하
    poor: 500, // 500ms 초과
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1, // 0.1 이하
    needsImprovement: 0.25, // 0.25 이하
    poor: 0.25, // 0.25 초과
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800, // 1.8초 이하
    needsImprovement: 3000, // 3초 이하
    poor: 3000, // 3초 초과
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800, // 800ms 이하
    needsImprovement: 1800, // 1.8초 이하
    poor: 1800, // 1.8초 초과
  },
} as const

// 번들 크기 예산
export const BUNDLE_BUDGETS = {
  // 초기 로드 JavaScript
  initialJS: {
    good: 200 * 1024, // 200KB 이하
    needsImprovement: 400 * 1024, // 400KB 이하
    poor: 400 * 1024, // 400KB 초과
  },
  // 총 JavaScript
  totalJS: {
    good: 500 * 1024, // 500KB 이하
    needsImprovement: 1000 * 1024, // 1MB 이하
    poor: 1000 * 1024, // 1MB 초과
  },
  // CSS 크기
  CSS: {
    good: 100 * 1024, // 100KB 이하
    needsImprovement: 200 * 1024, // 200KB 이하
    poor: 200 * 1024, // 200KB 초과
  },
  // 이미지 크기 (개별)
  image: {
    good: 500 * 1024, // 500KB 이하
    needsImprovement: 1024 * 1024, // 1MB 이하
    poor: 1024 * 1024, // 1MB 초과
  },
} as const

// 캐싱 전략 설정
export const CACHE_STRATEGIES = {
  // 정적 자산 (이미지, 폰트 등)
  static: {
    maxAge: 31536000, // 1년
    staleWhileRevalidate: 86400, // 1일
  },
  // API 응답
  api: {
    maxAge: 300, // 5분
    staleWhileRevalidate: 60, // 1분
  },
  // 페이지 HTML
  page: {
    maxAge: 3600, // 1시간
    staleWhileRevalidate: 300, // 5분
  },
  // 메모리 캐시 (클라이언트)
  memory: {
    artworks: 5 * 60 * 1000, // 5분
    artist: 60 * 60 * 1000, // 1시간
  },
} as const

// 이미지 최적화 설정
export const IMAGE_OPTIMIZATION = {
  // 품질 설정
  quality: 85, // 85% (균형잡힌 품질/크기 비율)
  // 포맷 우선순위
  formats: ['avif', 'webp', 'jpg'] as const,
  // 반응형 크기
  sizes: {
    thumb: 300,
    medium: 600,
    large: 1200,
    full: 1920,
  },
  // Lazy loading 여백
  lazyLoadMargin: '200px',
  // Priority 이미지 개수 (Above the fold)
  priorityCount: 4,
} as const

// 코드 스플리팅 설정
export const CODE_SPLITTING = {
  // 동적 임포트 우선순위
  priorities: {
    critical: ['HeroSection', 'MinimalHeader'],
    high: ['ArtworkCard', 'GalleryGrid'],
    medium: ['UpcomingExhibition', 'ArtistProfile'],
    low: ['PerformanceDashboard', 'AdminPanel'],
  },
  // Preload 설정
  preload: {
    enabled: true,
    routes: ['/gallery', '/artist'],
  },
} as const

// 성능 모니터링 설정
export const MONITORING_CONFIG = {
  // 샘플링 비율 (0-1)
  samplingRate: 0.1, // 10%의 요청만 모니터링
  // 보고 주기 (ms)
  reportInterval: 60000, // 1분마다 리포트
  // 실시간 모니터링 활성화
  realtime: process.env.NODE_ENV === 'development',
} as const

// 네트워크 적응형 설정
export const ADAPTIVE_CONFIG = {
  // 느린 연결 감지
  slowConnection: {
    effectiveType: ['2g', 'slow-2g'],
    downlink: 1, // Mbps 이하
  },
  // 저사양 디바이스 감지
  lowEndDevice: {
    hardwareConcurrency: 4, // 코어 수 이하
    deviceMemory: 4, // GB 이하
  },
  // 적응형 이미지 품질
  adaptiveQuality: {
    slow: 70,
    normal: 85,
    fast: 90,
  },
} as const

