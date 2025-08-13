'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from '@/hooks/use-toast'
import {
  PerformanceMetrics,
  PerformanceAlert,
  BudgetExceededEvent,
  advancedPerformanceMonitor,
  galleryPerformanceTracker,
  bundlePerformanceAnalyzer,
  errorCorrelationAnalyzer
} from '@/lib/performance-monitor'

interface PerformanceContextType {
  metrics: PerformanceMetrics
  score: number
  alerts: PerformanceAlert[]
  isMonitoring: boolean
  lastUpdated: Date | null
  
  // Controls
  startMonitoring: () => Promise<void>
  stopMonitoring: () => void
  clearAlerts: () => void
  
  // Gallery tracking
  trackGalleryLoad: (startTime: number, endTime: number, artworkCount: number) => void
  trackArtworkDetail: (artworkId: string, loadTime: number) => void
  trackSearchPerformance: (query: string, responseTime: number, resultCount: number) => void
  trackFilterPerformance: (filters: Record<string, any>, responseTime: number) => void
  trackImageLoading: (imageUrl: string, loadTime: number, size: number) => void
  trackScrollPerformance: (frameDuration: number) => void
  
  // Error tracking
  trackError: (error: Error) => void
  
  // Reports
  getAdvancedReport: () => Promise<any>
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

interface PerformanceProviderProps {
  children: ReactNode
  autoStart?: boolean
  showAlerts?: boolean
  alertThreshold?: 'low' | 'medium' | 'high' | 'critical'
  enableGalleryTracking?: boolean
  enableErrorCorrelation?: boolean
  enableBundleAnalysis?: boolean
  realTimeUpdates?: boolean
  updateInterval?: number
}

export function PerformanceProvider({
  children,
  autoStart = true,
  showAlerts = true,
  alertThreshold = 'medium',
  enableGalleryTracking = true,
  enableErrorCorrelation = true,
  enableBundleAnalysis = true,
  realTimeUpdates = true,
  updateInterval = 30000
}: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [score, setScore] = useState<number>(0)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Alert severity levels for filtering
  const severityLevels = ['low', 'medium', 'high', 'critical']
  const shouldShowAlert = (severity: string) => {
    const alertIndex = severityLevels.indexOf(alertThreshold)
    const severityIndex = severityLevels.indexOf(severity)
    return severityIndex >= alertIndex
  }

  // Handle performance metrics updates
  const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics)
    setScore(advancedPerformanceMonitor.getPerformanceScore())
    setLastUpdated(new Date())
  }

  // Handle performance alerts
  const handlePerformanceAlert = (alert: PerformanceAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 49)]) // Keep last 50 alerts
    
    // Show toast notification if enabled and meets threshold
    if (showAlerts && shouldShowAlert(alert.severity)) {
      const severityEmoji = {
        low: '💡',
        medium: '⚠️',
        high: '🚨',
        critical: '🔥'
      }[alert.severity] || '⚠️'
      
      toast({
        title: `${severityEmoji} Performance Alert`,
        description: alert.message,
        variant: alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default',
        duration: alert.severity === 'critical' ? 10000 : 5000
      })
    }
  }

  // Handle budget exceeded events
  const handleBudgetExceeded = (event: BudgetExceededEvent) => {
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
  }

  // Start monitoring
  const startMonitoring = async () => {
    try {
      await advancedPerformanceMonitor.startMonitoring({
        onMetricsUpdate: handleMetricsUpdate,
        onPerformanceAlert: handlePerformanceAlert,
        onBudgetExceeded: handleBudgetExceeded
      })
      
      setIsMonitoring(true)
      
      // Initial data load
      const report = await advancedPerformanceMonitor.getAdvancedReport()
      setMetrics(report.metrics)
      setScore(report.score)
      setAlerts(report.alerts)
      setLastUpdated(new Date())
      
      console.log('🚀 Performance monitoring started')
    } catch (error) {
      console.error('Failed to start performance monitoring:', error)
    }
  }

  // Stop monitoring
  const stopMonitoring = () => {
    advancedPerformanceMonitor.stopMonitoring()
    setIsMonitoring(false)
    console.log('⏹️ Performance monitoring stopped')
  }

  // Clear alerts
  const clearAlerts = () => {
    setAlerts([])
  }

  // Gallery tracking methods
  const trackGalleryLoad = (startTime: number, endTime: number, artworkCount: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackGalleryLoad(startTime, endTime, artworkCount)
    }
  }

  const trackArtworkDetail = (artworkId: string, loadTime: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackArtworkDetail(artworkId, loadTime)
    }
  }

  const trackSearchPerformance = (query: string, responseTime: number, resultCount: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackSearchPerformance(query, responseTime, resultCount)
    }
  }

  const trackFilterPerformance = (filters: Record<string, any>, responseTime: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackFilterPerformance(filters, responseTime)
    }
  }

  const trackImageLoading = (imageUrl: string, loadTime: number, size: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackImageLoading(imageUrl, loadTime, size)
    }
  }

  const trackScrollPerformance = (frameDuration: number) => {
    if (enableGalleryTracking) {
      galleryPerformanceTracker.trackScrollPerformance(frameDuration)
    }
  }

  // Error tracking
  const trackError = (error: Error) => {
    if (enableErrorCorrelation) {
      errorCorrelationAnalyzer.analyzeErrorCorrelation(error, metrics)
    }
  }

  // Get advanced report
  const getAdvancedReport = async () => {
    return await advancedPerformanceMonitor.getAdvancedReport()
  }

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart && typeof window !== 'undefined') {
      startMonitoring()
    }

    return () => {
      if (isMonitoring) {
        stopMonitoring()
      }
    }
  }, [autoStart])

  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdates || !isMonitoring) return

    const interval = setInterval(async () => {
      try {
        const report = await advancedPerformanceMonitor.getAdvancedReport()
        setMetrics(report.metrics)
        setScore(report.score)
        setLastUpdated(new Date())
      } catch (error) {
        console.warn('Failed to update performance metrics:', error)
      }
    }, updateInterval)

    return () => clearInterval(interval)
  }, [realTimeUpdates, isMonitoring, updateInterval])

  // Handle unhandled errors
  useEffect(() => {
    if (!enableErrorCorrelation) return

    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(String(event.reason)))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [enableErrorCorrelation, trackError])

  // Handle visibility change to pause/resume monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isMonitoring && autoStart) {
        startMonitoring()
      } else if (document.visibilityState === 'hidden' && isMonitoring) {
        // Optionally pause monitoring when page is hidden
        // stopMonitoring()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isMonitoring, autoStart])

  const value: PerformanceContextType = {
    metrics,
    score,
    alerts,
    isMonitoring,
    lastUpdated,
    
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    
    trackGalleryLoad,
    trackArtworkDetail,
    trackSearchPerformance,
    trackFilterPerformance,
    trackImageLoading,
    trackScrollPerformance,
    
    trackError,
    
    getAdvancedReport
  }

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

// Hook to use performance context
export function usePerformanceContext() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider')
  }
  return context
}

// Performance observer component for critical performance monitoring
export function PerformanceObserver({ 
  children, 
  onCriticalAlert 
}: { 
  children: ReactNode
  onCriticalAlert?: (alert: PerformanceAlert) => void 
}) {
  const { alerts, score } = usePerformanceContext()

  // Handle critical performance issues
  useEffect(() => {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
    
    if (criticalAlerts.length > 0) {
      const latestAlert = criticalAlerts[0]
      onCriticalAlert?.(latestAlert)
      
      // Log critical performance issue
      console.error('🔥 Critical Performance Issue:', {
        metric: latestAlert.metric,
        value: latestAlert.value,
        threshold: latestAlert.threshold,
        message: latestAlert.message
      })
    }
  }, [alerts, onCriticalAlert])

  // Handle severely degraded performance
  useEffect(() => {
    if (score < 30) {
      console.warn('🚨 Severely degraded performance detected:', { score })
    }
  }, [score])

  return <>{children}</>
}

// Performance boundary component for error handling
export function PerformanceBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { trackError } = usePerformanceContext()

  useEffect(() => {
    const handleError = (error: Error, errorInfo: any) => {
      trackError(error)
    }

    // Note: This is a simplified error boundary implementation
    // In a real app, you might want to use a proper React Error Boundary
    
    return () => {
      // Cleanup if needed
    }
  }, [trackError])

  return <>{children}</>
}

export default PerformanceProvider