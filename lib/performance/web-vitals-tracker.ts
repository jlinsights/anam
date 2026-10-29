/**
 * Core Web Vitals Tracker
 * 실시간 성능 모니터링 및 최적화 추천
 */

import { PERFORMANCE_TARGETS, MONITORING_CONFIG } from './performance-config'

type MetricType = 'LCP' | 'FID' | 'INP' | 'CLS' | 'FCP' | 'TTFB'

type MetricValue = {
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
  entries?: PerformanceEntry[]
}

type WebVitalsReport = {
  LCP?: MetricValue
  INP?: MetricValue
  CLS?: MetricValue
  FCP?: MetricValue
  TTFB?: MetricValue
  timestamp: number
  url: string
}

class WebVitalsTracker {
  private metrics: Map<MetricType, MetricValue> = new Map()
  private reports: WebVitalsReport[] = []
  private observers: PerformanceObserver[] = []

  /**
   * 성능 지표 평가
   */
  private evaluateMetric(
    type: MetricType,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const target = PERFORMANCE_TARGETS[type]

    if (!target) {
      return 'good' // 알 수 없는 지표는 good으로 처리
    }

    if (value <= target.good) {
      return 'good'
    } else if (value <= target.needsImprovement) {
      return 'needs-improvement'
    } else {
      return 'poor'
    }
  }

  /**
   * LCP (Largest Contentful Paint) 추적
   */
  trackLCP(): void {
    if (typeof window === 'undefined') return

    import('web-vitals')
      .then(({ onLCP }) => {
        onLCP((metric) => {
          const rating = this.evaluateMetric('LCP', metric.value)

          this.metrics.set('LCP', {
            value: metric.value,
            rating,
            delta: metric.delta,
            id: metric.id,
            entries: metric.entries,
          })

          this.logMetric('LCP', metric.value, rating)
          this.reportToAnalytics('LCP', metric)
        })
      })
      .catch(() => {
        // web-vitals 로드 실패 시 무시
      })
  }

  /**
   * INP (Interaction to Next Paint) 추적
   */
  trackINP(): void {
    if (typeof window === 'undefined') return

    import('web-vitals')
      .then(({ onINP }) => {
        onINP((metric) => {
          const rating = this.evaluateMetric('INP', metric.value)

          this.metrics.set('INP', {
            value: metric.value,
            rating,
            delta: metric.delta,
            id: metric.id,
            entries: metric.entries,
          })

          this.logMetric('INP', metric.value, rating)
          this.reportToAnalytics('INP', metric)
        })
      })
      .catch(() => {
        // web-vitals 로드 실패 시 무시
      })
  }

  /**
   * CLS (Cumulative Layout Shift) 추적
   */
  trackCLS(): void {
    if (typeof window === 'undefined') return

    import('web-vitals')
      .then(({ onCLS }) => {
        onCLS((metric) => {
          const rating = this.evaluateMetric('CLS', metric.value)

          this.metrics.set('CLS', {
            value: metric.value,
            rating,
            delta: metric.delta,
            id: metric.id,
            entries: metric.entries,
          })

          this.logMetric('CLS', metric.value, rating)
          this.reportToAnalytics('CLS', metric)
        })
      })
      .catch(() => {
        // web-vitals 로드 실패 시 무시
      })
  }

  /**
   * FCP (First Contentful Paint) 추적
   */
  trackFCP(): void {
    if (typeof window === 'undefined') return

    import('web-vitals')
      .then(({ onFCP }) => {
        onFCP((metric) => {
          const rating = this.evaluateMetric('FCP', metric.value)

          this.metrics.set('FCP', {
            value: metric.value,
            rating,
            delta: metric.delta,
            id: metric.id,
            entries: metric.entries,
          })

          this.logMetric('FCP', metric.value, rating)
          this.reportToAnalytics('FCP', metric)
        })
      })
      .catch(() => {
        // web-vitals 로드 실패 시 무시
      })
  }

  /**
   * TTFB (Time to First Byte) 추적
   */
  trackTTFB(): void {
    if (typeof window === 'undefined') return

    import('web-vitals')
      .then(({ onTTFB }) => {
        onTTFB((metric) => {
          const rating = this.evaluateMetric('TTFB', metric.value)

          this.metrics.set('TTFB', {
            value: metric.value,
            rating,
            delta: metric.delta,
            id: metric.id,
            entries: metric.entries,
          })

          this.logMetric('TTFB', metric.value, rating)
          this.reportToAnalytics('TTFB', metric)
        })
      })
      .catch(() => {
        // web-vitals 로드 실패 시 무시
      })
  }

  /**
   * 모든 Core Web Vitals 추적 시작
   */
  startTracking(): void {
    if (typeof window === 'undefined') return

    // 샘플링 비율 확인
    if (Math.random() > MONITORING_CONFIG.samplingRate) {
      return // 샘플링에 포함되지 않음
    }

    this.trackLCP()
    this.trackINP()
    this.trackCLS()
    this.trackFCP()
    this.trackTTFB()
  }

  /**
   * 성능 지표 로깅
   */
  private logMetric(type: MetricType, value: number, rating: string): void {
    if (!MONITORING_CONFIG.realtime) return

    const emoji =
      rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
    const target = PERFORMANCE_TARGETS[type]

    console.log(
      `${emoji} [Web Vitals] ${type}: ${value.toFixed(0)}ms (${rating})`,
      target ? `(목표: ${target.good}ms)` : ''
    )
  }

  /**
   * 분석 서비스로 리포트 전송
   */
  private reportToAnalytics(type: MetricType, metric: any): void {
    // 실제 분석 서비스 (Google Analytics, Vercel Analytics 등)로 전송
    // 여기서는 예시로만 구현

    if (typeof window === 'undefined') return

    // Vercel Analytics가 있는 경우
    if ((window as any).va) {
      ;(window as any).va('track', {
        name: `web-vital-${type.toLowerCase()}`,
        value: metric.value,
        rating: this.metrics.get(type)?.rating || 'unknown',
      })
    }

    // Google Analytics 4가 있는 경우
    if ((window as any).gtag) {
      ;(window as any).gtag('event', type, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        metric_rating: this.metrics.get(type)?.rating || 'unknown',
        non_interaction: true,
      })
    }
  }

  /**
   * 현재 성능 리포트 생성
   */
  getReport(): WebVitalsReport {
    const report: WebVitalsReport = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    this.metrics.forEach((value, type) => {
      report[type] = value
    })

    return report
  }

  /**
   * 성능 최적화 추천
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []

    const lcp = this.metrics.get('LCP')
    if (lcp && lcp.rating !== 'good') {
      recommendations.push(
        `LCP가 ${lcp.value.toFixed(0)}ms로 목표(${PERFORMANCE_TARGETS.LCP.good}ms)를 초과했습니다. ` +
          '이미지 최적화, 서버 응답 시간 개선, 렌더링 차단 리소스 제거를 고려하세요.'
      )
    }

    const inp = this.metrics.get('INP')
    if (inp && inp.rating !== 'good') {
      recommendations.push(
        `INP가 ${inp.value.toFixed(0)}ms로 목표(${PERFORMANCE_TARGETS.INP.good}ms)를 초과했습니다. ` +
          'JavaScript 실행 시간 단축, 이벤트 핸들러 최적화, 메인 스레드 블로킹 제거를 고려하세요.'
      )
    }

    const cls = this.metrics.get('CLS')
    if (cls && cls.rating !== 'good') {
      recommendations.push(
        `CLS가 ${cls.value.toFixed(3)}로 목표(${PERFORMANCE_TARGETS.CLS.good})를 초과했습니다. ` +
          '이미지/비디오에 명시적 크기 지정, 동적 콘텐츠에 예약 공간 할당을 고려하세요.'
      )
    }

    const ttfb = this.metrics.get('TTFB')
    if (ttfb && ttfb.rating !== 'good') {
      recommendations.push(
        `TTFB가 ${ttfb.value.toFixed(0)}ms로 목표(${PERFORMANCE_TARGETS.TTFB.good}ms)를 초과했습니다. ` +
          '서버 응답 시간 개선, CDN 사용, 캐싱 전략 개선을 고려하세요.'
      )
    }

    return recommendations
  }

  /**
   * 추적 중지
   */
  stopTracking(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

// 전역 Web Vitals 트래커 인스턴스
export const webVitalsTracker =
  typeof window !== 'undefined' ? new WebVitalsTracker() : null

// 페이지 로드 시 자동 추적 시작
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      webVitalsTracker?.startTracking()
    })
  } else {
    webVitalsTracker?.startTracking()
  }
}
