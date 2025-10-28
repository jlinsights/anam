// 🎯 BMAD Method Performance Optimization
// SuperClaude Pattern: Evidence-based performance monitoring and optimization

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number | null  // Largest Contentful Paint
  FID: number | null  // First Input Delay
  CLS: number | null  // Cumulative Layout Shift
  FCP: number | null  // First Contentful Paint
  TTFB: number | null // Time to First Byte
  
  // Custom BMAD Metrics
  galleryLoadTime: number
  interactionLatency: number
  culturalEngagement: number
  zenBrutalistScore: number
  benchmarkCompliance: number
  
  // Performance Budget Adherence
  budgetCompliance: {
    totalBundleSize: boolean
    imageOptimization: boolean
    runtimePerformance: boolean
    accessibility: boolean
  }
}

export interface BMADPerformanceConfig {
  enableRealTimeMonitoring: boolean
  enableBenchmarkMode: boolean
  culturalContext: string
  performanceTarget: 'mobile' | 'desktop' | 'adaptive'
  optimizationLevel: 'conservative' | 'aggressive' | 'experimental'
}

class BMADPerformanceMonitor {
  private metrics: PerformanceMetrics
  private config: BMADPerformanceConfig
  private observers: Map<string, PerformanceObserver>
  private startTime: number

  constructor(config: BMADPerformanceConfig) {
    this.config = config
    this.startTime = performance.now()
    this.observers = new Map()
    
    this.metrics = {
      LCP: null,
      FID: null,
      CLS: null,
      FCP: null,
      TTFB: null,
      galleryLoadTime: 0,
      interactionLatency: 0,
      culturalEngagement: 0,
      zenBrutalistScore: 0,
      benchmarkCompliance: 0,
      budgetCompliance: {
        totalBundleSize: false,
        imageOptimization: false,
        runtimePerformance: false,
        accessibility: false
      }
    }

    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    // 🎯 Core Web Vitals Monitoring
    this.monitorCoreWebVitals()
    
    // 🎨 BMAD-specific Performance Monitoring
    this.monitorGalleryPerformance()
    this.monitorCulturalEngagement()
    this.monitorZenBrutalistExperience()
    
    // 🎯 Benchmark Compliance Monitoring
    if (this.config.enableBenchmarkMode) {
      this.monitorBenchmarkCompliance()
    }
  }

  private monitorCoreWebVitals() {
    // Largest Contentful Paint
    getLCP((metric) => {
      this.metrics.LCP = metric.value
      this.evaluatePerformance('LCP', metric.value)
    })

    // First Input Delay
    getFID((metric) => {
      this.metrics.FID = metric.value
      this.evaluatePerformance('FID', metric.value)
    })

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.metrics.CLS = metric.value
      this.evaluatePerformance('CLS', metric.value)
    })

    // First Contentful Paint
    getFCP((metric) => {
      this.metrics.FCP = metric.value
      this.evaluatePerformance('FCP', metric.value)
    })

    // Time to First Byte
    getTTFB((metric) => {
      this.metrics.TTFB = metric.value
      this.evaluatePerformance('TTFB', metric.value)
    })
  }

  private monitorGalleryPerformance() {
    // Gallery-specific performance monitoring
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (entry.name.includes('gallery') || entry.name.includes('artwork')) {
          const loadTime = entry.duration || (entry.responseEnd - entry.requestStart)
          this.metrics.galleryLoadTime = Math.max(this.metrics.galleryLoadTime, loadTime)
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
    this.observers.set('gallery', observer)
  }

  private monitorCulturalEngagement() {
    // Track cultural context interactions
    let engagementScore = 0
    let interactionCount = 0

    const trackInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      const isCultural = target.closest('[data-cultural]') || 
                        target.closest('.cultural-composition') ||
                        target.closest('.zen-brutalist-artwork-card')

      if (isCultural) {
        engagementScore += this.calculateEngagementValue(event.type, target)
        interactionCount++
        
        this.metrics.culturalEngagement = engagementScore / Math.max(interactionCount, 1)
      }

      // Track interaction latency
      const interactionStart = performance.now()
      requestAnimationFrame(() => {
        const latency = performance.now() - interactionStart
        this.metrics.interactionLatency = (this.metrics.interactionLatency + latency) / 2
      })
    }

    // Monitor various interaction types
    ['click', 'mouseover', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true })
    })
  }

  private calculateEngagementValue(eventType: string, target: HTMLElement): number {
    const baseValues = {
      click: 10,
      mouseover: 2,
      scroll: 1,
      touchstart: 8
    }

    let multiplier = 1

    // Cultural context multipliers
    if (target.classList.contains('zen-brutalist-artwork-card')) multiplier *= 1.5
    if (target.closest('.cultural-composition')) multiplier *= 1.3
    if (target.closest('[data-cultural-season]')) multiplier *= 1.2

    return (baseValues[eventType as keyof typeof baseValues] || 1) * multiplier
  }

  private monitorZenBrutalistExperience() {
    // Monitor Zen Brutalism design system performance
    let zenScore = 0
    let measurements = 0

    // Track animation performance
    const animationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('zen') || entry.name.includes('brutal')) {
          const performanceRatio = 60 / Math.max(entry.duration, 1) // Target 60fps
          zenScore += Math.min(performanceRatio, 1)
          measurements++
        }
      })

      this.metrics.zenBrutalistScore = measurements > 0 ? zenScore / measurements : 0
    })

    animationObserver.observe({ entryTypes: ['measure'] })
    this.observers.set('zen', animationObserver)

    // Monitor glass morphism and ink effects performance
    const checkRenderingPerformance = () => {
      const glassElements = document.querySelectorAll('.glass-layer-1, .glass-layer-2, .glass-layer-3')
      const inkElements = document.querySelectorAll('.ink-flow-ambient, .fluid-ink-transition')
      
      if (glassElements.length > 0 || inkElements.length > 0) {
        performance.mark('zen-rendering-start')
        
        requestAnimationFrame(() => {
          performance.mark('zen-rendering-end')
          performance.measure('zen-rendering', 'zen-rendering-start', 'zen-rendering-end')
        })
      }
    }

    // Check rendering performance periodically
    setInterval(checkRenderingPerformance, 5000)
  }

  private monitorBenchmarkCompliance() {
    // 🎯 Benchmark against 권소영 website standards
    const benchmarkChecks = {
      // Load time compliance (권소영 기준: 3초 이내)
      loadTime: () => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart
        return loadTime < 3000
      },

      // Image optimization (WebP/AVIF support)
      imageOptimization: () => {
        const images = document.querySelectorAll('img')
        let optimizedCount = 0
        
        images.forEach(img => {
          if (img.src.includes('.webp') || img.src.includes('.avif') || img.loading === 'lazy') {
            optimizedCount++
          }
        })
        
        return images.length > 0 ? (optimizedCount / images.length) > 0.8 : true
      },

      // International accessibility (bilingual support)
      accessibility: () => {
        const bilingualElements = document.querySelectorAll('[data-lang], [lang]')
        const altTexts = document.querySelectorAll('img[alt]')
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        
        return bilingualElements.length > 0 && 
               altTexts.length === document.querySelectorAll('img').length &&
               headings.length > 0
      },

      // Mobile responsiveness
      responsiveness: () => {
        const viewport = document.querySelector('meta[name="viewport"]')
        const responsiveImages = document.querySelectorAll('img[sizes]')
        
        return viewport !== null && responsiveImages.length > 0
      }
    }

    // Run benchmark checks
    const compliance = Object.entries(benchmarkChecks).reduce((acc, [key, check]) => {
      acc[key as keyof typeof benchmarkChecks] = check()
      return acc
    }, {} as Record<string, boolean>)

    const complianceScore = Object.values(compliance).filter(Boolean).length / Object.keys(compliance).length
    this.metrics.benchmarkCompliance = complianceScore
  }

  private evaluatePerformance(metric: string, value: number) {
    // 🎯 BMAD Decision: Auto-optimization based on thresholds
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return

    const status = value <= threshold.good ? 'good' : value <= threshold.poor ? 'needs-improvement' : 'poor'
    
    // Auto-optimization triggers
    if (status === 'poor' && this.config.optimizationLevel === 'aggressive') {
      this.triggerOptimization(metric, value)
    }

    // Real-time reporting
    if (this.config.enableRealTimeMonitoring && process.env.NODE_ENV === 'development') {
      console.group(`🎯 BMAD Performance: ${metric}`)
      console.log(`Value: ${value}`)
      console.log(`Status: ${status}`)
      console.log(`Threshold: Good < ${threshold.good}, Poor > ${threshold.poor}`)
      console.groupEnd()
    }
  }

  private triggerOptimization(metric: string, value: number) {
    // 🎯 BMAD Decide: Automated optimization strategies
    const optimizations = {
      LCP: () => {
        // Preload critical resources
        const criticalImages = document.querySelectorAll('img[data-critical]')
        criticalImages.forEach(img => {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = (img as HTMLImageElement).src
          document.head.appendChild(link)
        })
      },

      FID: () => {
        // Reduce main thread blocking
        const scripts = document.querySelectorAll('script:not([async]):not([defer])')
        scripts.forEach(script => {
          if (script.src && !script.src.includes('critical')) {
            script.setAttribute('defer', 'true')
          }
        })
      },

      CLS: () => {
        // Add skeleton loaders for dynamic content
        const dynamicContainers = document.querySelectorAll('[data-dynamic]')
        dynamicContainers.forEach(container => {
          if (!container.querySelector('.skeleton')) {
            container.classList.add('skeleton')
          }
        })
      }
    }

    const optimization = optimizations[metric as keyof typeof optimizations]
    if (optimization) {
      optimization()
      console.log(`🚀 BMAD Auto-optimization applied for ${metric}`)
    }
  }

  // 🎯 Public API
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getBenchmarkScore(): number {
    const weights = {
      LCP: 0.25,
      FID: 0.25,
      CLS: 0.25,
      culturalEngagement: 0.15,
      benchmarkCompliance: 0.1
    }

    let score = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([key, weight]) => {
      const value = this.metrics[key as keyof PerformanceMetrics] as number
      if (value !== null && value !== undefined) {
        score += this.normalizeMetric(key, value) * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? (score / totalWeight) * 100 : 0
  }

  private normalizeMetric(metric: string, value: number): number {
    // Normalize metrics to 0-1 scale for scoring
    const normalizers = {
      LCP: (v: number) => Math.max(0, Math.min(1, (4000 - v) / 4000)),
      FID: (v: number) => Math.max(0, Math.min(1, (300 - v) / 300)),
      CLS: (v: number) => Math.max(0, Math.min(1, (0.25 - v) / 0.25)),
      culturalEngagement: (v: number) => Math.min(1, v / 10),
      benchmarkCompliance: (v: number) => v
    }

    const normalizer = normalizers[metric as keyof typeof normalizers]
    return normalizer ? normalizer(value) : 0
  }

  public startBenchmark(): void {
    this.startTime = performance.now()
    performance.mark('bmad-benchmark-start')
  }

  public endBenchmark(): BMADPerformanceReport {
    performance.mark('bmad-benchmark-end')
    performance.measure('bmad-total-time', 'bmad-benchmark-start', 'bmad-benchmark-end')
    
    const totalTime = performance.now() - this.startTime
    const score = this.getBenchmarkScore()
    
    return {
      totalTime,
      score,
      metrics: this.getMetrics(),
      recommendations: this.generateRecommendations(),
      complianceLevel: this.getComplianceLevel(score)
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.getMetrics()

    if (metrics.LCP && metrics.LCP > 2500) {
      recommendations.push('이미지 최적화 및 중요 리소스 프리로드 개선')
    }

    if (metrics.FID && metrics.FID > 100) {
      recommendations.push('JavaScript 실행 최적화 및 메인 스레드 블로킹 감소')
    }

    if (metrics.CLS && metrics.CLS > 0.1) {
      recommendations.push('레이아웃 시프트 방지를 위한 스켈레톤 로더 추가')
    }

    if (metrics.culturalEngagement < 5) {
      recommendations.push('문화적 상호작용 요소 강화 및 Zen Brutalism 효과 개선')
    }

    if (metrics.benchmarkCompliance < 0.8) {
      recommendations.push('권소영 벤치마크 기준에 맞는 이중언어 지원 및 접근성 개선')
    }

    return recommendations
  }

  private getComplianceLevel(score: number): string {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    return 'Needs Improvement'
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

export interface BMADPerformanceReport {
  totalTime: number
  score: number
  metrics: PerformanceMetrics
  recommendations: string[]
  complianceLevel: string
}

// 🎯 Factory function for easy integration
export function createBMADMonitor(config: Partial<BMADPerformanceConfig> = {}): BMADPerformanceMonitor {
  const defaultConfig: BMADPerformanceConfig = {
    enableRealTimeMonitoring: process.env.NODE_ENV === 'development',
    enableBenchmarkMode: true,
    culturalContext: 'eternal',
    performanceTarget: 'adaptive',
    optimizationLevel: 'aggressive'
  }

  return new BMADPerformanceMonitor({ ...defaultConfig, ...config })
}

export { BMADPerformanceMonitor }