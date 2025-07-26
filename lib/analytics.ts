// Web Vitals 타입 정의
interface WebVital {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
}

// Web Vitals 임계값
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint
} as const

// 성능 등급 계산
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Web Vitals 리포터
export function reportWebVitals(metric: WebVital) {
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    })
  }

  // 프로덕션에서는 분석 서비스로 전송
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Vercel Analytics로 전송 (자동)
    // 또는 커스텀 분석 서비스로 전송
    sendToAnalytics(metric)
  }
}

// 분석 서비스로 데이터 전송
function sendToAnalytics(metric: WebVital) {
  try {
    // Google Analytics 4 (예시)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        metric_id: metric.id,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      })
    }

    // 성능 모니터링 API로 전송
    fetch('/api/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'web-vital',
        data: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          connection: getConnectionInfo(),
        },
      }),
    }).catch(() => {
      // 에러 발생 시 무시 (분석 데이터 전송 실패가 사용자 경험에 영향 주지 않도록)
    })
  } catch (error) {
    // 에러 발생 시 무시
  }
}

// 네트워크 연결 정보 수집
function getConnectionInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    }
  }
  return null
}

// 성능 마크 및 측정
export class PerformanceTracker {
  private static marks = new Map<string, number>()

  static mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name)
      this.marks.set(name, performance.now())
    }
  }

  static measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      try {
        const measurement = endMark
          ? performance.measure(name, startMark, endMark)
          : performance.measure(name, startMark)

        console.log(`⏱️ ${name}: ${Math.round(measurement.duration)}ms`)
        return measurement.duration
      } catch (error) {
        console.warn('Performance measurement failed:', error)
      }
    }
    return 0
  }

  static getNavigationTiming() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const [navigation] = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[]
      if (navigation) {
        return {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          connection: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
          load: navigation.loadEventEnd - navigation.fetchStart,
        }
      }
    }
    return null
  }
}

// 리소스 로딩 모니터링
export function monitorResourceLoading() {
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[]

    const slowResources = resources.filter(
      (resource) => resource.duration > 1000
    )
    if (slowResources.length > 0) {
      console.warn(
        '🐌 Slow loading resources:',
        slowResources.map((r) => ({
          name: r.name,
          duration: Math.round(r.duration),
          size: r.transferSize,
        }))
      )
    }
  }
}

// 메모리 사용량 모니터링
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    }
  }
  return null
}

// Google Analytics 4 및 성능 모니터링 시스템
import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

// Analytics 설정
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// Google Analytics 4 타입 정의
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

// Google Analytics 초기화
export const initGA = () => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  // GA4 스크립트 로드
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', {
      page_title: document.title,
      page_location: window.location.href,
    });
  `
  document.head.appendChild(script2)

  window.gtag =
    window.gtag ||
    function () {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push(arguments)
    }
}

// 페이지 뷰 추적
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
  })
}

// 이벤트 추적
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// 작품 조회 추적
export const trackArtworkView = (artworkTitle: string, artworkSlug: string) => {
  trackEvent('view_artwork', 'artwork', artworkTitle)

  // 로컬 스토리지에 조회 기록 저장
  const viewHistory = getViewHistory()
  const timestamp = Date.now()

  viewHistory.push({
    slug: artworkSlug,
    title: artworkTitle,
    timestamp,
    date: new Date().toISOString(),
  })

  // 최근 100개 기록만 유지
  if (viewHistory.length > 100) {
    viewHistory.shift()
  }

  localStorage.setItem('artwork_views', JSON.stringify(viewHistory))
}

// 검색 추적
export const trackSearch = (query: string, resultCount: number) => {
  trackEvent('search', 'gallery', query, resultCount)
}

// 필터 사용 추적
export const trackFilter = (filterType: string, filterValue: string) => {
  trackEvent('use_filter', 'gallery', `${filterType}:${filterValue}`)
}

// 공유 추적
export const trackShare = (platform: string, artworkTitle: string) => {
  trackEvent('share', 'social', `${platform}:${artworkTitle}`)
}

// 언어 변경 추적
export const trackLanguageChange = (fromLang: string, toLang: string) => {
  trackEvent('change_language', 'ui', `${fromLang}_to_${toLang}`)
}

// 조회 기록 타입
interface ViewRecord {
  slug: string
  title: string
  timestamp: number
  date: string
}

// 조회 기록 가져오기
export const getViewHistory = (): ViewRecord[] => {
  if (typeof window === 'undefined') return []

  try {
    const history = localStorage.getItem('artwork_views')
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

// 인기 작품 계산
export const getPopularArtworks = (
  limit = 5
): Array<{ slug: string; title: string; views: number }> => {
  const history = getViewHistory()
  const counts: Record<string, { title: string; count: number }> = {}

  history.forEach((record) => {
    if (counts[record.slug]) {
      counts[record.slug].count++
    } else {
      counts[record.slug] = {
        title: record.title,
        count: 1,
      }
    }
  })

  return Object.entries(counts)
    .map(([slug, data]) => ({
      slug,
      title: data.title,
      views: data.count,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

// Web Vitals 성능 모니터링
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return

  // Core Web Vitals 메트릭 수집
  onCLS((metric: Metric) => {
    trackEvent(
      'web_vitals',
      'performance',
      'CLS',
      Math.round(metric.value * 1000)
    )
  })

  // FID는 더 이상 사용되지 않으므로 INP로 대체하거나 제거
  onFCP((metric: Metric) => {
    trackEvent('web_vitals', 'performance', 'FCP', Math.round(metric.value))
  })

  onLCP((metric: Metric) => {
    trackEvent('web_vitals', 'performance', 'LCP', Math.round(metric.value))
  })

  onTTFB((metric: Metric) => {
    trackEvent('web_vitals', 'performance', 'TTFB', Math.round(metric.value))
  })
}

// 사용자 행동 분석을 위한 세션 추적
export const trackSession = () => {
  if (typeof window === 'undefined') return

  const sessionStart = Date.now()
  const referrer = document.referrer
  const userAgent = navigator.userAgent
  const language = navigator.language

  trackEvent(
    'session_start',
    'user',
    `${language}_${referrer ? 'referral' : 'direct'}`
  )

  // 페이지 떠날 때 세션 시간 추적
  window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - sessionStart
    trackEvent(
      'session_end',
      'user',
      'duration',
      Math.round(sessionDuration / 1000)
    )
  })
}

// 에러 추적
export const trackError = (error: Error, errorInfo?: any) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('event', 'exception', {
    description: error.message,
    fatal: false,
    error_details: errorInfo ? JSON.stringify(errorInfo) : undefined,
  })
}

// 다크 모드 사용 추적
export const trackThemeChange = (theme: string) => {
  trackEvent('change_theme', 'ui', theme)
}
