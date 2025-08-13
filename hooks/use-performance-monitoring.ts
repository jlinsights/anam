'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  PerformanceMetrics,
  PerformanceAlert,
  BudgetExceededEvent,
  advancedPerformanceMonitor,
  galleryPerformanceTracker,
  bundlePerformanceAnalyzer,
  errorCorrelationAnalyzer
} from '@/lib/performance-monitor'

interface UsePerformanceMonitoringOptions {
  autoStart?: boolean
  realTimeUpdates?: boolean
  updateInterval?: number
  enableGalleryTracking?: boolean
  enableBundleAnalysis?: boolean
  enableErrorCorrelation?: boolean
}

interface PerformanceState {
  metrics: PerformanceMetrics
  score: number
  alerts: PerformanceAlert[]
  isMonitoring: boolean
  lastUpdated: Date | null
  error: Error | null
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    autoStart = true,
    realTimeUpdates = true,
    updateInterval = 30000, // 30 seconds
    enableGalleryTracking = true,
    enableBundleAnalysis = true,
    enableErrorCorrelation = true
  } = options

  const [state, setState] = useState<PerformanceState>({
    metrics: {},
    score: 0,
    alerts: [],
    isMonitoring: false,
    lastUpdated: null,
    error: null
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const alertsRef = useRef<PerformanceAlert[]>([])

  // Handle performance metrics updates
  const handleMetricsUpdate = useCallback((metrics: PerformanceMetrics) => {
    setState(prev => ({
      ...prev,
      metrics,
      score: advancedPerformanceMonitor.getPerformanceScore(),
      lastUpdated: new Date(),
      error: null
    }))
  }, [])

  // Handle performance alerts
  const handlePerformanceAlert = useCallback((alert: PerformanceAlert) => {
    alertsRef.current = [alert, ...alertsRef.current.slice(0, 49)] // Keep last 50 alerts
    setState(prev => ({
      ...prev,
      alerts: [...alertsRef.current]
    }))
  }, [])

  // Handle budget exceeded events
  const handleBudgetExceeded = useCallback((event: BudgetExceededEvent) => {
    const alert: PerformanceAlert = {
      id: `budget-${Date.now()}`,
      type: 'budget_exceeded',
      severity: event.percentage > 150 ? 'critical' : event.percentage > 120 ? 'high' : 'medium',
      metric: event.budget,
      value: event.actual,
      threshold: event.allocated,
      timestamp: Date.now(),
      message: `Budget exceeded for ${event.budget}: ${event.percentage.toFixed(1)}%`,
      actionRequired: event.recommendations
    }
    
    handlePerformanceAlert(alert)
  }, [handlePerformanceAlert])

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      await advancedPerformanceMonitor.startMonitoring({
        onMetricsUpdate: handleMetricsUpdate,
        onPerformanceAlert: handlePerformanceAlert,
        onBudgetExceeded: handleBudgetExceeded
      })

      setState(prev => ({
        ...prev,
        isMonitoring: true,
        error: null
      }))

      // Start real-time updates
      if (realTimeUpdates) {
        intervalRef.current = setInterval(async () => {
          try {
            const report = await advancedPerformanceMonitor.getAdvancedReport()
            setState(prev => ({
              ...prev,
              metrics: report.metrics,
              score: report.score,
              alerts: report.alerts,
              lastUpdated: new Date()
            }))
          } catch (error) {
            console.warn('Failed to update performance metrics:', error)
          }
        }, updateInterval)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isMonitoring: false
      }))
    }
  }, [
    handleMetricsUpdate,
    handlePerformanceAlert,
    handleBudgetExceeded,
    realTimeUpdates,
    updateInterval
  ])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    advancedPerformanceMonitor.stopMonitoring()
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setState(prev => ({
      ...prev,
      isMonitoring: false
    }))
  }, [])

  // Get performance report
  const getReport = useCallback(async () => {
    try {
      const report = await advancedPerformanceMonitor.getAdvancedReport()
      return report
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error
      }))
      throw error
    }
  }, [])

  // Clear alerts
  const clearAlerts = useCallback(() => {
    alertsRef.current = []
    setState(prev => ({
      ...prev,
      alerts: []
    }))
  }, [])

  // Track gallery performance
  const trackGalleryLoad = useCallback((startTime: number, endTime: number, artworkCount: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackGalleryLoad(startTime, endTime, artworkCount)
    }
  }, [enableGalleryTracking])

  const trackArtworkDetail = useCallback((artworkId: string, loadTime: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackArtworkDetail(artworkId, loadTime)
    }
  }, [enableGalleryTracking])

  const trackSearchPerformance = useCallback((query: string, responseTime: number, resultCount: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackSearchPerformance(query, responseTime, resultCount)
    }
  }, [enableGalleryTracking])

  const trackFilterPerformance = useCallback((filters: Record<string, any>, responseTime: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackFilterPerformance(filters, responseTime)
    }
  }, [enableGalleryTracking])

  const trackImageLoading = useCallback((imageUrl: string, loadTime: number, size: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackImageLoading(imageUrl, loadTime, size)
    }
  }, [enableGalleryTracking])

  const trackScrollPerformance = useCallback((frameDuration: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackScrollPerformance(frameDuration)
    }
  }, [enableGalleryTracking])

  // Track errors with performance correlation
  const trackError = useCallback((error: Error) => {
    if (enableErrorCorrelation) {
      const metrics = advancedPerformanceMonitor.getMetrics()
      errorCorrelationAnalyzer.analyzeErrorCorrelation(error, metrics)
    }
  }, [enableErrorCorrelation])

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart && typeof window !== 'undefined') {
      startMonitoring()
    }

    return () => {
      stopMonitoring()
    }
  }, [autoStart, startMonitoring, stopMonitoring])

  return {
    // State
    metrics: state.metrics,
    score: state.score,
    alerts: state.alerts,
    isMonitoring: state.isMonitoring,
    lastUpdated: state.lastUpdated,
    error: state.error,

    // Controls
    startMonitoring,
    stopMonitoring,
    getReport,
    clearAlerts,

    // Gallery tracking
    trackGalleryLoad,
    trackArtworkDetail,
    trackSearchPerformance,
    trackFilterPerformance,
    trackImageLoading,
    trackScrollPerformance,

    // Error tracking
    trackError
  }
}

// Hook for Core Web Vitals only
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    lcp?: number
    inp?: number
    cls?: number
    fcp?: number
    ttfb?: number
  }>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMetricsUpdate = (metrics: PerformanceMetrics) => {
      setVitals({
        lcp: metrics.lcp,
        inp: metrics.inp,
        cls: metrics.cls,
        fcp: metrics.fcp,
        ttfb: metrics.ttfb
      })
    }

    advancedPerformanceMonitor.startMonitoring({
      onMetricsUpdate: handleMetricsUpdate
    })

    return () => {
      advancedPerformanceMonitor.stopMonitoring()
    }
  }, [])

  return vitals
}

// Hook for bundle analysis
export function useBundleAnalysis() {
  const [bundleData, setBundleData] = useState<{
    totalSize: number
    chunkSizes: Record<string, number>
    compressionRatio: number
    loading: boolean
    error: Error | null
  }>({
    totalSize: 0,
    chunkSizes: {},
    compressionRatio: 1,
    loading: false,
    error: null
  })

  const analyzeBundles = useCallback(async () => {
    setBundleData(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const analytics = await bundlePerformanceAnalyzer.analyzeBundles()
      setBundleData({
        totalSize: analytics.totalSize,
        chunkSizes: analytics.chunkSizes,
        compressionRatio: analytics.compressionRatio,
        loading: false,
        error: null
      })
    } catch (error) {
      setBundleData(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      analyzeBundles()
    }
  }, [analyzeBundles])

  return {
    ...bundleData,
    analyzeBundles
  }
}

// Hook for performance measurement
export function usePerformanceMeasurement() {
  const measureRef = useRef<Map<string, number>>(new Map())

  const startMeasure = useCallback((name: string) => {
    measureRef.current.set(name, performance.now())
  }, [])

  const endMeasure = useCallback((name: string) => {
    const startTime = measureRef.current.get(name)
    if (startTime === undefined) {
      console.warn(`No start time found for measurement: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    measureRef.current.delete(name)
    return duration
  }, [])

  const measure = useCallback(<T>(name: string, fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const startTime = performance.now()
        const result = await fn()
        const duration = performance.now() - startTime
        resolve({ result, duration })
      } catch (error) {
        reject(error)
      }
    })
  }, [])

  return {
    startMeasure,
    endMeasure,
    measure
  }
}

// Hook for scroll performance monitoring
export function useScrollPerformance() {
  const frameRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)
  const [averageFrameTime, setAverageFrameTime] = useState<number>(16.67) // 60fps baseline

  const measureScrollFrame = useCallback(() => {
    const now = performance.now()
    if (lastFrameTime.current > 0) {
      const frameDuration = now - lastFrameTime.current
      setAverageFrameTime(prev => (prev * 0.9) + (frameDuration * 0.1)) // Exponential moving average
      
      // Track performance if gallery tracker is available
      if (frameDuration > 20) { // Frame took longer than ~50fps
        galleryPerformanceTracker.trackScrollPerformance(frameDuration)
      }
    }
    lastFrameTime.current = now
    frameRef.current = requestAnimationFrame(measureScrollFrame)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(measureScrollFrame)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [measureScrollFrame])

  return {
    averageFrameTime,
    fps: 1000 / averageFrameTime,
    isSmooth: averageFrameTime < 20 // Better than 50fps
  }
}

export default usePerformanceMonitoring