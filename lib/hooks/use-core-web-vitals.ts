'use client'

import { useCallback, useEffect, useState } from 'react'

interface CoreWebVitalsMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  inp: number | null
  ttfb: number | null
}

interface WebVitalsThresholds {
  lcp: { good: number; poor: number }
  fid: { good: number; poor: number }
  cls: { good: number; poor: number }
  fcp: { good: number; poor: number }
  inp: { good: number; poor: number }
  ttfb: { good: number; poor: number }
}

const THRESHOLDS: WebVitalsThresholds = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  inp: { good: 200, poor: 500 },
  ttfb: { good: 800, poor: 1800 }
}

export function useCoreWebVitals() {
  const [metrics, setMetrics] = useState<CoreWebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    inp: null,
    ttfb: null
  })

  const [isLoading, setIsLoading] = useState(true)

  const updateMetric = useCallback((name: keyof CoreWebVitalsMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [name]: value }))
  }, [])

  const getMetricStatus = useCallback((
    metricName: keyof CoreWebVitalsMetrics,
    value: number | null
  ): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (value === null) return 'unknown'
    
    const threshold = THRESHOLDS[metricName]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }, [])

  const getOverallScore = useCallback((): {
    score: number
    grade: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    issues: string[]
  } => {
    const scores: number[] = []
    const issues: string[] = []

    Object.entries(metrics).forEach(([name, value]) => {
      if (value !== null) {
        const status = getMetricStatus(name as keyof CoreWebVitalsMetrics, value)
        let score = 0
        
        switch (status) {
          case 'good':
            score = 100
            break
          case 'needs-improvement':
            score = 75
            issues.push(`${name.toUpperCase()} needs improvement`)
            break
          case 'poor':
            score = 25
            issues.push(`${name.toUpperCase()} is poor`)
            break
        }
        
        scores.push(score)
      }
    })

    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0

    let grade: 'excellent' | 'good' | 'needs-improvement' | 'poor'
    if (averageScore >= 90) grade = 'excellent'
    else if (averageScore >= 75) grade = 'good'
    else if (averageScore >= 50) grade = 'needs-improvement'
    else grade = 'poor'

    return { score: Math.round(averageScore), grade, issues }
  }, [metrics, getMetricStatus])

  useEffect(() => {
    let mounted = true

    const loadWebVitals = async () => {
      try {
        const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals')
        
        if (!mounted) return

        // Set up metric collection
        onCLS((metric: any) => updateMetric('cls', metric.value))
        onFCP((metric: any) => updateMetric('fcp', metric.value))
        onINP((metric: any) => updateMetric('inp', metric.value))
        onLCP((metric: any) => updateMetric('lcp', metric.value))
        onTTFB((metric: any) => updateMetric('ttfb', metric.value))

        // INP measurement (newer metric)
        if ('PerformanceObserver' in window) {
          try {
            const po = new PerformanceObserver((list) => {
              const entries = list.getEntries()
              entries.forEach((entry: any) => {
                if (entry.processingStart && entry.processingEnd) {
                  const inp = entry.processingEnd - entry.processingStart
                  updateMetric('inp', inp)
                }
              })
            })
            
            po.observe({ type: 'event', buffered: true })
          } catch (e) {
            // INP not supported
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.warn('Failed to load web-vitals:', error)
        setIsLoading(false)
      }
    }

    loadWebVitals()

    return () => {
      mounted = false
    }
  }, [updateMetric])

  return {
    metrics,
    isLoading,
    getMetricStatus,
    getOverallScore,
    thresholds: THRESHOLDS
  }
}

// Hook for component-level performance tracking
export function useComponentPerformance(componentName: string) {
  const [renderCount, setRenderCount] = useState(0)
  const [renderTimes, setRenderTimes] = useState<number[]>([])

  useEffect(() => {
    const startTime = performance.now()
    setRenderCount(prev => prev + 1)

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      setRenderTimes(prev => {
        const newTimes = [...prev, renderTime].slice(-10) // Keep last 10 renders
        return newTimes
      })

      // Log slow renders (>16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  })

  const averageRenderTime = renderTimes.length > 0 
    ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
    : 0

  return {
    renderCount,
    averageRenderTime,
    lastRenderTime: renderTimes[renderTimes.length - 1] || 0,
    isSlowComponent: averageRenderTime > 16
  }
}