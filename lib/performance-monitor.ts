/**
 * 고도화된 성능 모니터링 시스템
 * - Real-time 성능 메트릭 수집
 * - 리소스 로딩 최적화 제안
 * - 사용자 경험 품질 지표 추적
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'

// 성능 메트릭 타입 정의
export interface PerformanceMetrics {
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

  // 디바이스 정보
  deviceMemory?: number
  hardwareConcurrency?: number

  // 페이지 로딩 타임라인
  navigationTiming?: NavigationTiming
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

// 성능 경고 임계값
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
} as const

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []
  private isMonitoring = false

  // 성능 데이터 수집 콜백
  private onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  private onPerformanceIssue?: (issue: PerformanceIssue) => void

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 모니터링 시작
  startMonitoring(options?: {
    onMetricsUpdate?: (metrics: PerformanceMetrics) => void
    onPerformanceIssue?: (issue: PerformanceIssue) => void
  }) {
    if (this.isMonitoring || typeof window === 'undefined') return

    this.onMetricsUpdate = options?.onMetricsUpdate
    this.onPerformanceIssue = options?.onPerformanceIssue
    this.isMonitoring = true

    // Core Web Vitals 수집
    this.collectWebVitals()

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

  // Core Web Vitals 수집
  private collectWebVitals() {
    // 현재 Web Vitals 값 가져오기
    onCLS((metric) => {
      this.metrics.cls = metric.value
      this.updateMetrics()
      this.checkThreshold(
        'CLS',
        metric.value,
        PERFORMANCE_THRESHOLDS.CLS_GOOD,
        PERFORMANCE_THRESHOLDS.CLS_POOR
      )
    })

    onFCP((metric) => {
      this.metrics.fcp = metric.value
      this.updateMetrics()
      this.checkThreshold(
        'FCP',
        metric.value,
        PERFORMANCE_THRESHOLDS.FCP_GOOD,
        PERFORMANCE_THRESHOLDS.FCP_POOR
      )
    })

    onLCP((metric) => {
      this.metrics.lcp = metric.value
      this.updateMetrics()
      this.checkThreshold(
        'LCP',
        metric.value,
        PERFORMANCE_THRESHOLDS.LCP_GOOD,
        PERFORMANCE_THRESHOLDS.LCP_POOR
      )
    })

    onTTFB((metric) => {
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
    onINP((metric) => {
      this.metrics.inp = metric.value
      this.updateMetrics()
      this.checkThreshold(
        'INP',
        metric.value,
        PERFORMANCE_THRESHOLDS.INP_GOOD,
        PERFORMANCE_THRESHOLDS.INP_POOR
      )
    })
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

  // 메모리 사용량 모니터링
  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const checkMemory = () => {
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

  // 메트릭 업데이트
  private updateMetrics() {
    this.onMetricsUpdate?.(this.metrics)
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

// 글로벌 성능 모니터 인스턴스
export const performanceMonitor = PerformanceMonitor.getInstance()
