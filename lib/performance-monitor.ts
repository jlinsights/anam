/**
 * Advanced Performance Monitoring System for ANAM Gallery
 * - Real User Monitoring (RUM) with detailed metrics collection
 * - Core Web Vitals tracking with performance budgets
 * - Gallery-specific performance metrics
 * - Error tracking and performance correlation
 * - Performance alerts and thresholds
 * - Bundle analysis and optimization tracking
 * - Comprehensive performance reports and analytics
 */

// web-vitals를 동적 import로 변경하여 클라이언트 사이드에서만 로드

// Gallery-specific performance metrics
export interface GalleryPerformanceMetrics {
  // Gallery browsing metrics
  artworkListLoadTime?: number
  artworkDetailLoadTime?: number
  searchResponseTime?: number
  filterResponseTime?: number
  imageLoadingTime?: number
  thumbnailLoadTime?: number
  infiniteScrollPerformance?: number
  virtualScrollPerformance?: number

  // User interaction metrics
  searchInputLatency?: number
  filterToggleLatency?: number
  artworkModalOpenTime?: number
  artworkModalCloseTime?: number
  navigationLatency?: number

  // Memory and performance
  galleryMemoryUsage?: number
  imageMemoryUsage?: number
  scrollPerformance?: number
  animationFrameRate?: number
}

// Enhanced performance metrics
export interface PerformanceMetrics extends GalleryPerformanceMetrics {
  // Core Web Vitals
  cls?: number
  fcp?: number
  fid?: number
  lcp?: number
  ttfb?: number
  inp?: number

  // 사용자 정의 메트릭
  firstInteraction?: number
  domInteractive?: number
  resourceLoadTime?: number
  fontLoadTime?: number
  imageLoadTime?: number
  jsExecutionTime?: number

  // 네트워크 성능
  connectionType?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  networkLatency?: number
  bandwidth?: number

  // 디바이스 정보
  deviceMemory?: number
  hardwareConcurrency?: number
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  screenResolution?: string
  pixelRatio?: number

  // 페이지 로딩 타임라인
  navigationTiming?: NavigationTiming

  // Bundle and optimization metrics
  bundleSize?: number
  chunkLoadTime?: number
  cacheHitRate?: number
  compressionRatio?: number
  criticalResourceCount?: number

  // Error correlation metrics
  errorRate?: number
  errorCount?: number
  performanceErrorCorrelation?: number
}

interface NavigationTiming {
  dns: number
  tcp: number
  ssl: number
  ttfb: number
  download: number
  domContentLoaded: number
  complete: number
}

// Performance budgets and thresholds
const PERFORMANCE_BUDGETS = {
  // Gallery-specific budgets
  GALLERY_LOAD_TIME: 2000, // 2 seconds
  ARTWORK_DETAIL_LOAD: 1500, // 1.5 seconds
  SEARCH_RESPONSE: 300, // 300ms
  FILTER_RESPONSE: 200, // 200ms
  IMAGE_LOAD_BUDGET: 3000, // 3 seconds for high-res images
  THUMBNAIL_LOAD_BUDGET: 500, // 500ms for thumbnails
  MODAL_OPEN_BUDGET: 150, // 150ms for modal opening
  SCROLL_BUDGET: 16.67, // 60fps (16.67ms per frame)
  ANIMATION_BUDGET: 16, // 60fps for animations

  // Memory budgets
  GALLERY_MEMORY_BUDGET: 30 * 1024 * 1024, // 30MB for gallery
  IMAGE_MEMORY_BUDGET: 50 * 1024 * 1024, // 50MB for images
  TOTAL_MEMORY_BUDGET: 100 * 1024 * 1024, // 100MB total

  // Bundle budgets
  MAIN_BUNDLE_BUDGET: 300 * 1024, // 300KB for main bundle
  CHUNK_BUNDLE_BUDGET: 100 * 1024, // 100KB per chunk
  TOTAL_BUNDLE_BUDGET: 1024 * 1024, // 1MB total

  // Error thresholds
  ERROR_RATE_WARNING: 0.01, // 1% error rate
  ERROR_RATE_CRITICAL: 0.05, // 5% error rate
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (Google 기준)
  LCP_GOOD: 2500,
  LCP_POOR: 4000,
  FID_GOOD: 100,
  FID_POOR: 300,
  CLS_GOOD: 0.1,
  CLS_POOR: 0.25,
  FCP_GOOD: 1800,
  FCP_POOR: 3000,
  TTFB_GOOD: 800,
  TTFB_POOR: 1800,
  INP_GOOD: 200,
  INP_POOR: 500,

  // 리소스 로딩
  SLOW_RESOURCE: 1000, // 1초
  LARGE_RESOURCE: 500 * 1024, // 500KB

  // 메모리 사용량
  MEMORY_WARNING: 50, // 50MB
  MEMORY_CRITICAL: 100, // 100MB

  // Gallery-specific thresholds
  GALLERY_LOAD_SLOW: PERFORMANCE_BUDGETS.GALLERY_LOAD_TIME,
  SEARCH_SLOW: PERFORMANCE_BUDGETS.SEARCH_RESPONSE,
  FILTER_SLOW: PERFORMANCE_BUDGETS.FILTER_RESPONSE,
  IMAGE_LOAD_SLOW: PERFORMANCE_BUDGETS.IMAGE_LOAD_BUDGET,
  MODAL_SLOW: PERFORMANCE_BUDGETS.MODAL_OPEN_BUDGET
} as const

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []
  private isMonitoring = false
  private performanceAlerts: PerformanceAlert[] = []
  private errorCorrelationData: ErrorCorrelationData[] = []
  private bundleAnalytics: BundleAnalytics | null = null

  // 성능 데이터 수집 콜백
  private onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  private onPerformanceIssue?: (issue: PerformanceIssue) => void
  private onPerformanceAlert?: (alert: PerformanceAlert) => void
  private onBudgetExceeded?: (budget: BudgetExceededEvent) => void

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Debounce utility to prevent excessive callback invocations
  private debounce<T extends (...args: any[]) => void>(
    func: T | undefined,
    wait: number
  ): T | undefined {
    if (!func) return undefined
    
    let timeout: NodeJS.Timeout
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  }

  // 모니터링 시작 - useEffect 의존성 최적화를 위한 debounced callbacks
  async startMonitoring(options?: {
    onMetricsUpdate?: (metrics: PerformanceMetrics) => void
    onPerformanceIssue?: (issue: PerformanceIssue) => void
  }) {
    if (this.isMonitoring || typeof window === 'undefined') return

    // Debounce callbacks to prevent excessive re-renders
    this.onMetricsUpdate = this.debounce(options?.onMetricsUpdate, 100)
    this.onPerformanceIssue = this.debounce(options?.onPerformanceIssue, 200)
    this.isMonitoring = true

    // Core Web Vitals 수집 (동적 import)
    await this.collectWebVitals()

    // 네트워크 정보 수집
    this.collectNetworkInfo()

    // 디바이스 정보 수집
    this.collectDeviceInfo()

    // 네비게이션 타이밍 수집
    this.collectNavigationTiming()

    // 리소스 성능 모니터링
    this.monitorResources()

    // 메모리 사용량 모니터링
    this.monitorMemoryUsage()

    // 사용자 인터랙션 모니터링
    this.monitorUserInteractions()

    console.log('🚀 Performance monitoring started')
  }

  // 모니터링 중지
  stopMonitoring() {
    this.isMonitoring = false
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
    console.log('⏹️ Performance monitoring stopped')
  }

  // Core Web Vitals 수집 - 동적 import로 변경
  private async collectWebVitals() {
    try {
      const webVitals = await import('web-vitals')
      const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitals
      type Metric = any // web-vitals Metric 타입

      // 현재 Web Vitals 값 가져오기
      onCLS((metric: Metric) => {
        this.metrics.cls = metric.value
        this.updateMetrics()
        this.checkThreshold(
          'CLS',
          metric.value,
          PERFORMANCE_THRESHOLDS.CLS_GOOD,
          PERFORMANCE_THRESHOLDS.CLS_POOR
        )
      })

      onFCP((metric: Metric) => {
        this.metrics.fcp = metric.value
        this.updateMetrics()
        this.checkThreshold(
          'FCP',
          metric.value,
          PERFORMANCE_THRESHOLDS.FCP_GOOD,
          PERFORMANCE_THRESHOLDS.FCP_POOR
        )
      })

      onLCP((metric: Metric) => {
        this.metrics.lcp = metric.value
        this.updateMetrics()
        this.checkThreshold(
          'LCP',
          metric.value,
          PERFORMANCE_THRESHOLDS.LCP_GOOD,
          PERFORMANCE_THRESHOLDS.LCP_POOR
        )
      })

      onTTFB((metric: Metric) => {
        this.metrics.ttfb = metric.value
        this.updateMetrics()
        this.checkThreshold(
          'TTFB',
          metric.value,
          PERFORMANCE_THRESHOLDS.TTFB_GOOD,
          PERFORMANCE_THRESHOLDS.TTFB_POOR
        )
      })

      // INP (Interaction to Next Paint) - FID의 후속 지표
      onINP((metric: Metric) => {
        this.metrics.inp = metric.value
        this.updateMetrics()
        this.checkThreshold(
          'INP',
          metric.value,
          PERFORMANCE_THRESHOLDS.INP_GOOD,
          PERFORMANCE_THRESHOLDS.INP_POOR
        )
      })
    } catch (error) {
      console.warn('Failed to load web-vitals for performance monitoring:', error)
    }
  }

  // 네트워크 정보 수집
  private collectNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.connectionType = connection.type
      this.metrics.effectiveType = connection.effectiveType
      this.metrics.downlink = connection.downlink
      this.metrics.rtt = connection.rtt
    }
  }

  // 디바이스 정보 수집
  private collectDeviceInfo() {
    this.metrics.deviceMemory = (navigator as any).deviceMemory
    this.metrics.hardwareConcurrency = navigator.hardwareConcurrency
  }

  // 네비게이션 타이밍 수집
  private collectNavigationTiming() {
    if (performance.getEntriesByType) {
      const [navigation] = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[]
      if (navigation) {
        this.metrics.navigationTiming = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ssl:
            navigation.secureConnectionStart > 0
              ? navigation.connectEnd - navigation.secureConnectionStart
              : 0,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.fetchStart,
          complete: navigation.loadEventEnd - navigation.fetchStart,
        }

        this.metrics.domInteractive =
          navigation.domInteractive - navigation.fetchStart
        this.updateMetrics()
      }
    }
  }

  // 리소스 성능 모니터링
  private monitorResources() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[]

      entries.forEach((entry) => {
        // 느린 리소스 감지
        if (entry.duration > PERFORMANCE_THRESHOLDS.SLOW_RESOURCE) {
          this.reportPerformanceIssue({
            type: 'slow_resource',
            metric: 'duration',
            value: entry.duration,
            threshold: PERFORMANCE_THRESHOLDS.SLOW_RESOURCE,
            resource: entry.name,
            severity: 'warning',
            suggestion: `리소스 ${entry.name}의 로딩 시간이 ${Math.round(entry.duration)}ms로 느립니다. 이미지 최적화나 CDN 사용을 고려하세요.`,
          })
        }

        // 큰 리소스 감지
        if (entry.transferSize > PERFORMANCE_THRESHOLDS.LARGE_RESOURCE) {
          this.reportPerformanceIssue({
            type: 'large_resource',
            metric: 'size',
            value: entry.transferSize,
            threshold: PERFORMANCE_THRESHOLDS.LARGE_RESOURCE,
            resource: entry.name,
            severity: 'info',
            suggestion: `리소스 ${entry.name}의 크기가 ${Math.round(entry.transferSize / 1024)}KB로 큽니다. 압축이나 분할 로딩을 고려하세요.`,
          })
        }

        // 리소스 타입별 성능 추적
        if (entry.name.includes('.woff') || entry.name.includes('.ttf')) {
          this.metrics.fontLoadTime = Math.max(
            this.metrics.fontLoadTime || 0,
            entry.duration
          )
        } else if (
          entry.name.includes('.jpg') ||
          entry.name.includes('.png') ||
          entry.name.includes('.webp')
        ) {
          this.metrics.imageLoadTime = Math.max(
            this.metrics.imageLoadTime || 0,
            entry.duration
          )
        } else if (entry.name.includes('.js')) {
          this.metrics.jsExecutionTime = Math.max(
            this.metrics.jsExecutionTime || 0,
            entry.duration
          )
        }
      })

      this.updateMetrics()
    })

    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  // 메모리 사용량 모니터링 - throttled to prevent excessive checks
  private lastMemoryCheck = 0
  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const now = performance.now()
        // Throttle memory checks to every 5 seconds minimum
        if (now - this.lastMemoryCheck < 5000) return
        this.lastMemoryCheck = now
        const memory = (performance as any).memory
        const usedMB = memory.usedJSHeapSize / (1024 * 1024)

        if (usedMB > PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL) {
          this.reportPerformanceIssue({
            type: 'high_memory',
            metric: 'memory_usage',
            value: usedMB,
            threshold: PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL,
            severity: 'error',
            suggestion: `메모리 사용량이 ${Math.round(usedMB)}MB로 매우 높습니다. 메모리 누수를 확인하세요.`,
          })
        } else if (usedMB > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
          this.reportPerformanceIssue({
            type: 'high_memory',
            metric: 'memory_usage',
            value: usedMB,
            threshold: PERFORMANCE_THRESHOLDS.MEMORY_WARNING,
            severity: 'warning',
            suggestion: `메모리 사용량이 ${Math.round(usedMB)}MB로 높습니다. 최적화를 고려하세요.`,
          })
        }
      }

      // 5초마다 메모리 체크
      setInterval(checkMemory, 5000)
    }
  }

  // 사용자 인터랙션 모니터링
  private monitorUserInteractions() {
    const interactionStart = performance.now()

    const trackFirstInteraction = () => {
      this.metrics.firstInteraction = performance.now() - interactionStart
      this.updateMetrics()

      // 이벤트 리스너 제거
      ;['click', 'keydown', 'touchstart'].forEach((eventType) => {
        document.removeEventListener(eventType, trackFirstInteraction, {
          capture: true,
        })
      })
    }

    // 첫 번째 사용자 인터랙션 추적
    ;['click', 'keydown', 'touchstart'].forEach((eventType) => {
      document.addEventListener(eventType, trackFirstInteraction, {
        capture: true,
      })
    })
  }

  // 성능 임계값 확인
  private checkThreshold(
    metric: string,
    value: number,
    goodThreshold: number,
    poorThreshold: number
  ) {
    let severity: 'good' | 'warning' | 'poor' = 'good'

    if (value > poorThreshold) {
      severity = 'poor'
    } else if (value > goodThreshold) {
      severity = 'warning'
    }

    if (severity !== 'good') {
      this.reportPerformanceIssue({
        type: 'web_vital',
        metric: metric.toLowerCase(),
        value,
        threshold: severity === 'poor' ? poorThreshold : goodThreshold,
        severity: severity === 'poor' ? 'error' : 'warning',
        suggestion: this.getWebVitalSuggestion(metric, severity),
      })
    }
  }

  // Web Vital 개선 제안
  private getWebVitalSuggestion(metric: string, severity: string): string {
    const suggestions = {
      LCP: {
        warning:
          'LCP를 개선하려면 이미지를 최적화하고 중요한 리소스를 우선 로딩하세요.',
        poor: 'LCP가 매우 느립니다. 서버 응답 시간을 개선하고 렌더링 차단 리소스를 제거하세요.',
      },
      FCP: {
        warning: 'FCP를 개선하려면 CSS와 JavaScript 최적화를 고려하세요.',
        poor: 'FCP가 매우 느립니다. 인라인 CSS 사용과 JavaScript 지연 로딩을 고려하세요.',
      },
      CLS: {
        warning: 'CLS를 개선하려면 이미지와 광고에 크기를 명시하세요.',
        poor: 'CLS가 매우 높습니다. 동적 콘텐츠 삽입을 피하고 웹폰트 로딩을 최적화하세요.',
      },
      FID: {
        warning: 'FID를 개선하려면 JavaScript 실행 시간을 줄이세요.',
        poor: 'FID가 매우 높습니다. 코드 분할과 지연 로딩을 고려하세요.',
      },
      TTFB: {
        warning: 'TTFB를 개선하려면 서버 캐싱을 최적화하세요.',
        poor: 'TTFB가 매우 높습니다. CDN 사용과 서버 성능 개선을 고려하세요.',
      },
    } as const

    return (
      suggestions[metric as keyof typeof suggestions]?.[
        severity as 'warning' | 'poor'
      ] || `${metric} 성능을 개선하세요.`
    )
  }

  // 메트릭 업데이트 - 마지막 메트릭과 비교하여 실제 변경시에만 업데이트
  private lastMetricsSnapshot: PerformanceMetrics = {}
  
  private updateMetrics() {
    // Shallow comparison to prevent unnecessary updates
    if (this.hasMetricsChanged()) {
      this.lastMetricsSnapshot = { ...this.metrics }
      this.onMetricsUpdate?.(this.metrics)
    }
  }

  private hasMetricsChanged(): boolean {
    const currentKeys = Object.keys(this.metrics)
    const lastKeys = Object.keys(this.lastMetricsSnapshot)
    
    if (currentKeys.length !== lastKeys.length) return true
    
    for (const key of currentKeys) {
      if (this.metrics[key as keyof PerformanceMetrics] !== 
          this.lastMetricsSnapshot[key as keyof PerformanceMetrics]) {
        return true
      }
    }
    
    return false
  }

  // 성능 이슈 보고
  private reportPerformanceIssue(issue: PerformanceIssue) {
    console.warn(`⚠️ Performance Issue (${issue.severity}):`, {
      type: issue.type,
      metric: issue.metric,
      value: Math.round(issue.value),
      threshold: issue.threshold,
      suggestion: issue.suggestion,
    })

    this.onPerformanceIssue?.(issue)

    // API로 성능 이슈 전송
    this.sendPerformanceData('performance-issue', {
      type: issue.type,
      metric: issue.metric,
      value: issue.value,
      threshold: issue.threshold,
      severity: issue.severity,
      suggestion: issue.suggestion,
      resource: issue.resource,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    })
  }

  // 성능 데이터를 API로 전송
  private sendPerformanceData(type: string, data: any) {
    if (typeof window === 'undefined') return

    try {
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: `custom-${type}`,
          data: {
            ...data,
            userAgent: navigator.userAgent,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            deviceInfo: {
              memory: (navigator as any).deviceMemory,
              cores: navigator.hardwareConcurrency,
            },
          },
        }),
      }).catch(() => {
        // 에러 발생 시 무시
      })
    } catch (error) {
      // 에러 발생 시 무시
    }
  }

  // 현재 메트릭 반환
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // 성능 스코어 계산 (0-100)
  getPerformanceScore(): number {
    const weights = {
      lcp: 0.25,
      fid: 0.25,
      cls: 0.25,
      fcp: 0.15,
      ttfb: 0.1,
    }

    let score = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = this.metrics[metric as keyof typeof weights]
      if (value !== undefined) {
        const metricScore = this.calculateMetricScore(metric, value)
        score += metricScore * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? Math.round(score / totalWeight) : 0
  }

  // 개별 메트릭 스코어 계산
  private calculateMetricScore(metric: string, value: number): number {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    } as const

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return 50

    if (value <= threshold.good) return 100
    if (value >= threshold.poor) return 0

    // 선형 보간으로 중간값 계산
    const ratio = (value - threshold.good) / (threshold.poor - threshold.good)
    return Math.max(0, Math.round(100 - ratio * 100))
  }
}

// 성능 이슈 타입
export interface PerformanceIssue {
  type: 'web_vital' | 'slow_resource' | 'large_resource' | 'high_memory'
  metric: string
  value: number
  threshold: number
  severity: 'info' | 'warning' | 'error'
  suggestion: string
  resource?: string
}

// 성능 리포트 생성
export function generatePerformanceReport(): {
  score: number
  metrics: PerformanceMetrics
  issues: PerformanceIssue[]
  recommendations: string[]
} {
  const monitor = PerformanceMonitor.getInstance()
  const metrics = monitor.getMetrics()
  const score = monitor.getPerformanceScore()

  const issues: PerformanceIssue[] = []
  const recommendations: string[] = []

  // 성능 기반 추천사항 생성
  if (score < 50) {
    recommendations.push(
      '웹사이트 성능이 심각하게 저하되어 있습니다. 즉시 최적화가 필요합니다.'
    )
  } else if (score < 75) {
    recommendations.push(
      '성능 개선의 여지가 있습니다. 주요 메트릭을 확인하여 최적화하세요.'
    )
  } else if (score < 90) {
    recommendations.push(
      '양호한 성능입니다. 세부적인 최적화로 더 향상시킬 수 있습니다.'
    )
  } else {
    recommendations.push('뛰어난 성능입니다! 현재 상태를 유지하세요.')
  }

  return {
    score,
    metrics,
    issues,
    recommendations,
  }
}

// Performance alert types
export interface PerformanceAlert {
  id: string
  type: 'budget_exceeded' | 'threshold_exceeded' | 'regression_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  value: number
  threshold: number
  timestamp: number
  message: string
  actionRequired: string[]
}

// Budget exceeded event
export interface BudgetExceededEvent {
  budget: string
  allocated: number
  actual: number
  percentage: number
  recommendations: string[]
}

// Error correlation data
export interface ErrorCorrelationData {
  timestamp: number
  errorType: string
  errorMessage: string
  performanceMetrics: Partial<PerformanceMetrics>
  correlation: number
}

// Bundle analytics
export interface BundleAnalytics {
  totalSize: number
  chunkSizes: Record<string, number>
  duplicateCode: number
  unusedCode: number
  compressionRatio: number
  loadingPatterns: LoadingPattern[]
}

// Loading pattern analysis
export interface LoadingPattern {
  route: string
  criticalResources: string[]
  loadTime: number
  cacheUtilization: number
  recommendations: string[]
}

// Performance regression detection
export interface PerformanceRegression {
  metric: string
  baseline: number
  current: number
  degradation: number
  timestamp: number
  affectedUsers: number
}

// Real User Monitoring (RUM) data
export interface RUMData {
  sessionId: string
  userId?: string
  userAgent: string
  viewport: { width: number; height: number }
  connectionType: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  pageMetrics: PerformanceMetrics
  userJourney: UserInteraction[]
  errors: ErrorEvent[]
  timestamp: number
}

// User interaction tracking
export interface UserInteraction {
  type: 'click' | 'scroll' | 'search' | 'filter' | 'navigation'
  element: string
  timestamp: number
  duration: number
  context: Record<string, any>
}

// Gallery-specific performance tracking
export class GalleryPerformanceTracker {
  private static instance: GalleryPerformanceTracker
  private interactions: UserInteraction[] = []
  private performanceEntries: PerformanceEntry[] = []

  static getInstance(): GalleryPerformanceTracker {
    if (!GalleryPerformanceTracker.instance) {
      GalleryPerformanceTracker.instance = new GalleryPerformanceTracker()
    }
    return GalleryPerformanceTracker.instance
  }

  // Track gallery loading performance
  trackGalleryLoad(startTime: number, endTime: number, artworkCount: number): void {
    const loadTime = endTime - startTime
    const performanceMonitor = advancedPerformanceMonitor
    
    performanceMonitor.updateGalleryMetric('artworkListLoadTime', loadTime)
    
    if (loadTime > PERFORMANCE_BUDGETS.GALLERY_LOAD_TIME) {
      performanceMonitor.triggerAlert({
        id: `gallery-load-${Date.now()}`,
        type: 'budget_exceeded',
        severity: 'medium',
        metric: 'gallery_load_time',
        value: loadTime,
        threshold: PERFORMANCE_BUDGETS.GALLERY_LOAD_TIME,
        timestamp: Date.now(),
        message: `Gallery loading exceeded budget: ${loadTime}ms > ${PERFORMANCE_BUDGETS.GALLERY_LOAD_TIME}ms`,
        actionRequired: [
          'Optimize image loading strategy',
          'Implement virtual scrolling',
          'Reduce initial artwork count',
          'Add progressive loading'
        ]
      })
    }
  }

  // Track artwork detail performance
  trackArtworkDetail(artworkId: string, loadTime: number): void {
    const performanceMonitor = advancedPerformanceMonitor
    performanceMonitor.updateGalleryMetric('artworkDetailLoadTime', loadTime)
    
    if (loadTime > PERFORMANCE_BUDGETS.ARTWORK_DETAIL_LOAD) {
      performanceMonitor.triggerBudgetExceeded({
        budget: 'artwork_detail_load',
        allocated: PERFORMANCE_BUDGETS.ARTWORK_DETAIL_LOAD,
        actual: loadTime,
        percentage: (loadTime / PERFORMANCE_BUDGETS.ARTWORK_DETAIL_LOAD) * 100,
        recommendations: [
          'Preload artwork details on hover',
          'Optimize image sizes',
          'Cache artwork metadata',
          'Implement skeleton loading'
        ]
      })
    }
  }

  // Track search performance
  trackSearchPerformance(query: string, responseTime: number, resultCount: number): void {
    const performanceMonitor = advancedPerformanceMonitor
    performanceMonitor.updateGalleryMetric('searchResponseTime', responseTime)
    
    this.interactions.push({
      type: 'search',
      element: 'search-input',
      timestamp: Date.now(),
      duration: responseTime,
      context: { query, resultCount }
    })
    
    if (responseTime > PERFORMANCE_BUDGETS.SEARCH_RESPONSE) {
      performanceMonitor.triggerAlert({
        id: `search-slow-${Date.now()}`,
        type: 'threshold_exceeded',
        severity: responseTime > PERFORMANCE_BUDGETS.SEARCH_RESPONSE * 2 ? 'high' : 'medium',
        metric: 'search_response_time',
        value: responseTime,
        threshold: PERFORMANCE_BUDGETS.SEARCH_RESPONSE,
        timestamp: Date.now(),
        message: `Search response time exceeded threshold: ${responseTime}ms`,
        actionRequired: [
          'Implement search debouncing',
          'Add search result caching',
          'Optimize search algorithm',
          'Consider server-side search'
        ]
      })
    }
  }

  // Track filter performance
  trackFilterPerformance(filters: Record<string, any>, responseTime: number): void {
    const performanceMonitor = advancedPerformanceMonitor
    performanceMonitor.updateGalleryMetric('filterResponseTime', responseTime)
    
    this.interactions.push({
      type: 'filter',
      element: 'filter-controls',
      timestamp: Date.now(),
      duration: responseTime,
      context: { filters }
    })
  }

  // Track image loading performance
  trackImageLoading(imageUrl: string, loadTime: number, size: number): void {
    const performanceMonitor = advancedPerformanceMonitor
    const isThumbnail = imageUrl.includes('thumb')
    
    if (isThumbnail) {
      performanceMonitor.updateGalleryMetric('thumbnailLoadTime', loadTime)
      if (loadTime > PERFORMANCE_BUDGETS.THUMBNAIL_LOAD_BUDGET) {
        performanceMonitor.triggerBudgetExceeded({
          budget: 'thumbnail_load_time',
          allocated: PERFORMANCE_BUDGETS.THUMBNAIL_LOAD_BUDGET,
          actual: loadTime,
          percentage: (loadTime / PERFORMANCE_BUDGETS.THUMBNAIL_LOAD_BUDGET) * 100,
          recommendations: [
            'Optimize thumbnail compression',
            'Use WebP format',
            'Implement lazy loading',
            'Add blur placeholder'
          ]
        })
      }
    } else {
      performanceMonitor.updateGalleryMetric('imageLoadingTime', loadTime)
      if (loadTime > PERFORMANCE_BUDGETS.IMAGE_LOAD_BUDGET) {
        performanceMonitor.triggerAlert({
          id: `image-load-slow-${Date.now()}`,
          type: 'budget_exceeded',
          severity: 'medium',
          metric: 'image_load_time',
          value: loadTime,
          threshold: PERFORMANCE_BUDGETS.IMAGE_LOAD_BUDGET,
          timestamp: Date.now(),
          message: `Image loading exceeded budget: ${loadTime}ms`,
          actionRequired: [
            'Implement progressive JPEG',
            'Add image optimization',
            'Use CDN for images',
            'Consider image format optimization'
          ]
        })
      }
    }
  }

  // Track scroll performance
  trackScrollPerformance(frameDuration: number): void {
    const performanceMonitor = advancedPerformanceMonitor
    performanceMonitor.updateGalleryMetric('scrollPerformance', frameDuration)
    
    if (frameDuration > PERFORMANCE_BUDGETS.SCROLL_BUDGET) {
      console.warn(`Scroll performance issue: ${frameDuration}ms frame duration`)
    }
  }

  // Get user journey analytics
  getUserJourney(): UserInteraction[] {
    return [...this.interactions]
  }

  // Clear tracking data
  clearTrackingData(): void {
    this.interactions = []
    this.performanceEntries = []
  }
}

// Bundle performance analyzer
export class BundlePerformanceAnalyzer {
  private static instance: BundlePerformanceAnalyzer

  static getInstance(): BundlePerformanceAnalyzer {
    if (!BundlePerformanceAnalyzer.instance) {
      BundlePerformanceAnalyzer.instance = new BundlePerformanceAnalyzer()
    }
    return BundlePerformanceAnalyzer.instance
  }

  // Analyze bundle performance
  async analyzeBundles(): Promise<BundleAnalytics> {
    const bundles = await this.getBundleInfo()
    const analytics: BundleAnalytics = {
      totalSize: bundles.reduce((sum, bundle) => sum + bundle.size, 0),
      chunkSizes: bundles.reduce((acc, bundle) => {
        acc[bundle.name] = bundle.size
        return acc
      }, {} as Record<string, number>),
      duplicateCode: await this.analyzeDuplicateCode(bundles),
      unusedCode: await this.analyzeUnusedCode(),
      compressionRatio: await this.analyzeCompressionRatio(bundles),
      loadingPatterns: await this.analyzeLoadingPatterns()
    }

    // Check budget violations
    if (analytics.totalSize > PERFORMANCE_BUDGETS.TOTAL_BUNDLE_BUDGET) {
      advancedPerformanceMonitor.triggerBudgetExceeded({
        budget: 'total_bundle_size',
        allocated: PERFORMANCE_BUDGETS.TOTAL_BUNDLE_BUDGET,
        actual: analytics.totalSize,
        percentage: (analytics.totalSize / PERFORMANCE_BUDGETS.TOTAL_BUNDLE_BUDGET) * 100,
        recommendations: [
          'Enable code splitting',
          'Remove unused dependencies',
          'Implement dynamic imports',
          'Optimize vendor chunks'
        ]
      })
    }

    return analytics
  }

  private async getBundleInfo(): Promise<Array<{name: string, size: number}>> {
    // This would integrate with webpack-bundle-analyzer or similar
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return entries
      .filter(entry => entry.name.includes('.js'))
      .map(entry => ({
        name: this.extractBundleName(entry.name),
        size: entry.transferSize || entry.encodedBodySize || 0
      }))
  }

  private extractBundleName(url: string): string {
    const match = url.match(/\/([^\/]+)\.js$/)
    return match ? match[1] : url
  }

  private async analyzeDuplicateCode(bundles: Array<{name: string, size: number}>): Promise<number> {
    // Placeholder for duplicate code analysis
    return 0
  }

  private async analyzeUnusedCode(): Promise<number> {
    // Placeholder for unused code analysis
    return 0
  }

  private async analyzeCompressionRatio(bundles: Array<{name: string, size: number}>): Promise<number> {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsEntries = entries.filter(entry => entry.name.includes('.js'))
    
    if (jsEntries.length === 0) return 1
    
    const totalTransferred = jsEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0)
    const totalUncompressed = jsEntries.reduce((sum, entry) => sum + (entry.decodedBodySize || entry.transferSize || 0), 0)
    
    return totalUncompressed > 0 ? totalTransferred / totalUncompressed : 1
  }

  private async analyzeLoadingPatterns(): Promise<LoadingPattern[]> {
    // Analyze how resources load across different routes
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '/'
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const criticalResources = entries
      .filter(entry => entry.startTime < 1000) // Loaded within first second
      .map(entry => entry.name)
    
    const avgLoadTime = entries.length > 0 ? 
      entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length : 0
    
    return [{
      route: currentRoute,
      criticalResources,
      loadTime: avgLoadTime,
      cacheUtilization: this.calculateCacheUtilization(entries),
      recommendations: this.generateLoadingRecommendations(entries)
    }]
  }

  private calculateCacheUtilization(entries: PerformanceResourceTiming[]): number {
    const cachedEntries = entries.filter(entry => entry.transferSize === 0)
    return entries.length > 0 ? cachedEntries.length / entries.length : 0
  }

  private generateLoadingRecommendations(entries: PerformanceResourceTiming[]): string[] {
    const recommendations: string[] = []
    
    const largeResources = entries.filter(entry => (entry.transferSize || 0) > 100 * 1024)
    if (largeResources.length > 0) {
      recommendations.push('Consider code splitting for large resources')
    }
    
    const slowResources = entries.filter(entry => entry.duration > 1000)
    if (slowResources.length > 0) {
      recommendations.push('Optimize slow-loading resources')
    }
    
    const uncachedResources = entries.filter(entry => entry.transferSize > 0)
    if (uncachedResources.length / entries.length > 0.8) {
      recommendations.push('Improve caching strategy')
    }
    
    return recommendations
  }
}

// Error correlation analyzer
export class ErrorCorrelationAnalyzer {
  private static instance: ErrorCorrelationAnalyzer
  private errorData: ErrorCorrelationData[] = []

  static getInstance(): ErrorCorrelationAnalyzer {
    if (!ErrorCorrelationAnalyzer.instance) {
      ErrorCorrelationAnalyzer.instance = new ErrorCorrelationAnalyzer()
    }
    return ErrorCorrelationAnalyzer.instance
  }

  // Analyze error-performance correlation
  analyzeErrorCorrelation(error: Error, metrics: PerformanceMetrics): void {
    const correlationData: ErrorCorrelationData = {
      timestamp: Date.now(),
      errorType: error.constructor.name,
      errorMessage: error.message,
      performanceMetrics: { ...metrics },
      correlation: this.calculateCorrelation(error, metrics)
    }

    this.errorData.push(correlationData)
    
    // Keep only last 100 error entries
    if (this.errorData.length > 100) {
      this.errorData = this.errorData.slice(-100)
    }

    // Send to performance monitoring
    advancedPerformanceMonitor.reportErrorCorrelation(correlationData)
  }

  private calculateCorrelation(error: Error, metrics: PerformanceMetrics): number {
    // Simple correlation calculation based on performance degradation
    let correlationScore = 0
    
    if (metrics.lcp && metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_POOR) {
      correlationScore += 0.3
    }
    
    if (metrics.fid && metrics.fid > PERFORMANCE_THRESHOLDS.FID_POOR) {
      correlationScore += 0.2
    }
    
    if (metrics.cls && metrics.cls > PERFORMANCE_THRESHOLDS.CLS_POOR) {
      correlationScore += 0.2
    }
    
    // Check if error is performance-related
    const performanceRelatedErrors = ['ChunkLoadError', 'NetworkError', 'TimeoutError']
    if (performanceRelatedErrors.some(type => error.message.includes(type))) {
      correlationScore += 0.3
    }
    
    return Math.min(correlationScore, 1)
  }

  // Get error correlation insights
  getCorrelationInsights(): {
    highCorrelationErrors: ErrorCorrelationData[]
    performanceImpactingErrors: string[]
    recommendations: string[]
  } {
    const highCorrelationErrors = this.errorData.filter(data => data.correlation > 0.7)
    
    const errorTypes = this.errorData.reduce((acc, data) => {
      acc[data.errorType] = (acc[data.errorType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const performanceImpactingErrors = Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type)
    
    const recommendations = this.generateCorrelationRecommendations(highCorrelationErrors)
    
    return {
      highCorrelationErrors,
      performanceImpactingErrors,
      recommendations
    }
  }

  private generateCorrelationRecommendations(errors: ErrorCorrelationData[]): string[] {
    const recommendations: string[] = []
    
    if (errors.some(e => e.errorType === 'ChunkLoadError')) {
      recommendations.push('Implement retry logic for chunk loading failures')
      recommendations.push('Add fallback loading strategies')
    }
    
    if (errors.some(e => e.performanceMetrics.lcp && e.performanceMetrics.lcp > 4000)) {
      recommendations.push('Optimize Largest Contentful Paint to reduce error correlation')
    }
    
    if (errors.some(e => e.performanceMetrics.cls && e.performanceMetrics.cls > 0.25)) {
      recommendations.push('Fix layout shift issues to prevent interaction errors')
    }
    
    return recommendations
  }
}

// Performance regression detector
export class PerformanceRegressionDetector {
  private static instance: PerformanceRegressionDetector
  private baselines: Map<string, number> = new Map()
  private history: Map<string, number[]> = new Map()

  static getInstance(): PerformanceRegressionDetector {
    if (!PerformanceRegressionDetector.instance) {
      PerformanceRegressionDetector.instance = new PerformanceRegressionDetector()
    }
    return PerformanceRegressionDetector.instance
  }

  // Set performance baseline
  setBaseline(metric: string, value: number): void {
    this.baselines.set(metric, value)
  }

  // Check for performance regression
  checkRegression(metric: string, currentValue: number): PerformanceRegression | null {
    const baseline = this.baselines.get(metric)
    if (!baseline) return null

    const degradation = ((currentValue - baseline) / baseline) * 100
    
    // Consider it a regression if performance degraded by more than 20%
    if (degradation > 20) {
      const regression: PerformanceRegression = {
        metric,
        baseline,
        current: currentValue,
        degradation,
        timestamp: Date.now(),
        affectedUsers: 1 // Would be calculated from real user data
      }

      advancedPerformanceMonitor.triggerAlert({
        id: `regression-${metric}-${Date.now()}`,
        type: 'regression_detected',
        severity: degradation > 50 ? 'critical' : 'high',
        metric,
        value: currentValue,
        threshold: baseline,
        timestamp: Date.now(),
        message: `Performance regression detected in ${metric}: ${degradation.toFixed(1)}% degradation`,
        actionRequired: [
          'Investigate recent code changes',
          'Check for infrastructure issues',
          'Review performance optimizations',
          'Consider rollback if critical'
        ]
      })

      return regression
    }

    return null
  }

  // Update metric history
  updateHistory(metric: string, value: number): void {
    if (!this.history.has(metric)) {
      this.history.set(metric, [])
    }
    
    const history = this.history.get(metric)!
    history.push(value)
    
    // Keep only last 50 values
    if (history.length > 50) {
      history.shift()
    }
    
    // Update baseline to rolling average
    const average = history.reduce((sum, val) => sum + val, 0) / history.length
    this.setBaseline(metric, average)
  }
}

// Enhanced performance monitor with new capabilities
export class AdvancedPerformanceMonitor extends PerformanceMonitor {
  private galleryTracker = GalleryPerformanceTracker.getInstance()
  private bundleAnalyzer = BundlePerformanceAnalyzer.getInstance()
  private errorCorrelator = ErrorCorrelationAnalyzer.getInstance()
  private regressionDetector = PerformanceRegressionDetector.getInstance()

  // Gallery-specific monitoring methods
  updateGalleryMetric(metric: keyof GalleryPerformanceMetrics, value: number): void {
    this.metrics[metric] = value
    this.updateMetrics()
    
    // Check for regressions
    this.regressionDetector.updateHistory(metric, value)
    this.regressionDetector.checkRegression(metric, value)
  }

  // Trigger performance alert
  triggerAlert(alert: PerformanceAlert): void {
    this.performanceAlerts.push(alert)
    console.warn('🚨 Performance Alert:', alert)
    this.onPerformanceAlert?.(alert)
    
    // Send to analytics
    this.sendPerformanceData('performance-alert', alert)
  }

  // Trigger budget exceeded event
  triggerBudgetExceeded(event: BudgetExceededEvent): void {
    console.warn('💰 Budget Exceeded:', event)
    this.onBudgetExceeded?.(event)
    
    // Send to analytics
    this.sendPerformanceData('budget-exceeded', event)
  }

  // Report error correlation
  reportErrorCorrelation(data: ErrorCorrelationData): void {
    this.errorCorrelationData.push(data)
    
    if (data.correlation > 0.7) {
      this.triggerAlert({
        id: `error-correlation-${Date.now()}`,
        type: 'threshold_exceeded',
        severity: 'high',
        metric: 'error_correlation',
        value: data.correlation,
        threshold: 0.7,
        timestamp: Date.now(),
        message: `High error-performance correlation detected: ${data.errorType}`,
        actionRequired: [
          'Investigate performance impact of errors',
          'Implement error prevention strategies',
          'Monitor user experience degradation'
        ]
      })
    }
  }

  // Get comprehensive performance report
  async getAdvancedReport(): Promise<{
    score: number
    metrics: PerformanceMetrics
    alerts: PerformanceAlert[]
    bundleAnalytics: BundleAnalytics
    correlationInsights: ReturnType<ErrorCorrelationAnalyzer['getCorrelationInsights']>
    userJourney: UserInteraction[]
    recommendations: string[]
  }> {
    const baseReport = generatePerformanceReport()
    const bundleAnalytics = await this.bundleAnalyzer.analyzeBundles()
    const correlationInsights = this.errorCorrelator.getCorrelationInsights()
    const userJourney = this.galleryTracker.getUserJourney()
    
    return {
      ...baseReport,
      alerts: this.performanceAlerts,
      bundleAnalytics,
      correlationInsights,
      userJourney,
      recommendations: [
        ...baseReport.recommendations,
        ...correlationInsights.recommendations
      ]
    }
  }

  // Real User Monitoring data collection
  collectRUMData(): RUMData {
    return {
      sessionId: this.generateSessionId(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connectionType: this.metrics.connectionType || 'unknown',
      deviceType: this.detectDeviceType(),
      pageMetrics: { ...this.metrics },
      userJourney: this.galleryTracker.getUserJourney(),
      errors: [], // Would be populated by error tracking
      timestamp: Date.now()
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }
}

// Export enhanced performance monitor instance
export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor()

// Export gallery tracker for component use
export const galleryPerformanceTracker = GalleryPerformanceTracker.getInstance()

// Export bundle analyzer
export const bundlePerformanceAnalyzer = BundlePerformanceAnalyzer.getInstance()

// Export error correlator
export const errorCorrelationAnalyzer = ErrorCorrelationAnalyzer.getInstance()

// 글로벌 성능 모니터 인스턴스 (backward compatibility)
export const performanceMonitor = PerformanceMonitor.getInstance()
