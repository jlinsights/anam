'use client'

import { useEffect, useCallback, useMemo, useRef } from 'react'
import { performanceMonitor, type PerformanceMetrics, type PerformanceIssue } from '@/lib/performance-monitor'

interface GalleryPerformanceOptions {
  enableTracking?: boolean
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  onPerformanceIssue?: (issue: PerformanceIssue) => void
  trackArtworkViews?: boolean
  optimizationThreshold?: number
}

interface GalleryPerformanceReturn {
  metrics: PerformanceMetrics | null
  score: number
  isOptimal: boolean
  trackArtworkView: (artworkId: string) => void
  trackSectionChange: (section: string) => void
  recommendations: string[]
}

export function useGalleryPerformance({
  enableTracking = true,
  onMetricsUpdate,
  onPerformanceIssue,
  trackArtworkViews = true,
  optimizationThreshold = 75
}: GalleryPerformanceOptions = {}): GalleryPerformanceReturn {
  const metricsRef = useRef<PerformanceMetrics | null>(null)
  const scoreRef = useRef<number>(0)
  const viewedArtworksRef = useRef<Set<string>>(new Set())
  const sectionTimesRef = useRef<Map<string, number>>(new Map())

  // Memoized callbacks to prevent useEffect re-runs
  const stableOnMetricsUpdate = useCallback((metrics: PerformanceMetrics) => {
    metricsRef.current = metrics
    onMetricsUpdate?.(metrics)
  }, [onMetricsUpdate])

  const stableOnPerformanceIssue = useCallback((issue: PerformanceIssue) => {
    onPerformanceIssue?.(issue)
  }, [onPerformanceIssue])

  // Initialize performance monitoring
  useEffect(() => {
    if (!enableTracking || typeof window === 'undefined') return

    let mounted = true

    const startMonitoring = async () => {
      try {
        await performanceMonitor.startMonitoring({
          onMetricsUpdate: stableOnMetricsUpdate,
          onPerformanceIssue: stableOnPerformanceIssue,
        })
      } catch (error) {
        console.warn('Failed to start performance monitoring:', error)
      }
    }

    startMonitoring()

    return () => {
      mounted = false
      performanceMonitor.stopMonitoring()
    }
  }, [enableTracking, stableOnMetricsUpdate, stableOnPerformanceIssue])

  // Track artwork views
  const trackArtworkView = useCallback((artworkId: string) => {
    if (!trackArtworkViews || !artworkId) return

    viewedArtworksRef.current.add(artworkId)
    
    // Simple tracking without performance monitor methods
    console.debug('Artwork viewed:', artworkId)
  }, [trackArtworkViews])

  // Track section changes
  const trackSectionChange = useCallback((section: string) => {
    if (!section) return

    const now = performance.now()
    sectionTimesRef.current.set(section, now)
    
    // Simple tracking without performance monitor methods
    console.debug('Section changed:', section)
  }, [])

  // Calculate current performance score
  const currentScore = useMemo(() => {
    if (!metricsRef.current) return 0
    
    try {
      scoreRef.current = performanceMonitor.getPerformanceScore()
      return scoreRef.current
    } catch (error) {
      console.warn('Failed to calculate performance score:', error)
      return 0
    }
  }, [metricsRef.current])

  // Check if performance is optimal
  const isOptimal = useMemo(() => {
    return currentScore >= optimizationThreshold
  }, [currentScore, optimizationThreshold])

  // Generate performance recommendations
  const recommendations = useMemo(() => {
    const recs: string[] = []
    const metrics = metricsRef.current

    if (!metrics) return recs

    // LCP recommendations
    if (metrics.lcp && metrics.lcp > 2500) {
      recs.push('이미지 최적화와 우선 로딩으로 LCP를 개선하세요')
    }

    // FCP recommendations  
    if (metrics.fcp && metrics.fcp > 1800) {
      recs.push('CSS와 JavaScript 최적화로 FCP를 개선하세요')
    }

    // CLS recommendations
    if (metrics.cls && metrics.cls > 0.1) {
      recs.push('레이아웃 시프트를 줄이기 위해 이미지 크기를 명시하세요')
    }

    // Memory recommendations
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / (1024 * 1024)
      
      if (usedMB > 50) {
        recs.push('메모리 사용량이 높습니다. 컴포넌트 메모이제이션을 확인하세요')
      }
    }

    // General recommendations based on score
    if (currentScore < 50) {
      recs.push('성능이 크게 저하되었습니다. 즉시 최적화가 필요합니다')
    } else if (currentScore < 75) {
      recs.push('성능 개선의 여지가 있습니다. 주요 메트릭을 확인하세요')
    } else if (currentScore < 90) {
      recs.push('좋은 성능입니다. 세부적인 최적화로 더 향상시킬 수 있습니다')
    } else {
      recs.push('뛰어난 성능입니다! 현재 상태를 유지하세요')
    }

    return recs
  }, [metricsRef.current, currentScore])

  return {
    metrics: metricsRef.current,
    score: currentScore,
    isOptimal,
    trackArtworkView,
    trackSectionChange,
    recommendations,
  }
}

// Hook for artwork card performance optimization
export function useArtworkCardOptimization() {
  const viewportRef = useRef<IntersectionObserver | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Initialize intersection observer for lazy loading optimization
  useEffect(() => {
    if (typeof window === 'undefined' || !cardRef.current) return

    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    }

    viewportRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Card is in viewport, can trigger any additional optimizations
          const card = entry.target as HTMLElement
          card.setAttribute('data-in-viewport', 'true')
        }
      })
    }, observerOptions)

    if (cardRef.current) {
      viewportRef.current.observe(cardRef.current)
    }

    return () => {
      viewportRef.current?.disconnect()
    }
  }, [])

  return {
    cardRef,
  }
}

// Hook for optimized image loading in galleries
export function useOptimizedImageLoading(itemsCount: number = 0) {
  const priorityCount = useMemo(() => {
    // Calculate how many images should be priority loaded based on viewport
    if (typeof window === 'undefined') return 4

    const viewportHeight = window.innerHeight
    const estimatedItemsPerRow = Math.floor(window.innerWidth / 300) // Assume ~300px per item
    const estimatedRowsInViewport = Math.ceil(viewportHeight / 400) // Assume ~400px per row
    
    return Math.min(estimatedItemsPerRow * estimatedRowsInViewport, itemsCount, 8)
  }, [itemsCount])

  const shouldPrioritizeImage = useCallback((index: number) => {
    return index < priorityCount
  }, [priorityCount])

  return {
    priorityCount,
    shouldPrioritizeImage,
  }
}