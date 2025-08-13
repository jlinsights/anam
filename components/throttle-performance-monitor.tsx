'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ThrottleMonitor } from '@/lib/utils/throttle'

interface PerformanceMetrics {
  name: string
  calls: number
  throttled: number
  throttleRate: number
  lastCall: number
  averageDelay: number
}

interface ThrottlePerformanceMonitorProps {
  isVisible?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

/**
 * Development tool for monitoring throttled function performance
 * Only renders in development mode
 */
export function ThrottlePerformanceMonitor({
  isVisible = process.env.NODE_ENV === 'development',
  position = 'top-right',
  className = ''
}: ThrottlePerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetrics>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [frameRate, setFrameRate] = useState(0)
  const frameCountRef = React.useRef(0)
  const lastTimeRef = React.useRef(performance.now())

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      const monitor = ThrottleMonitor.getInstance()
      const rawMetrics = monitor.getMetrics()
      
      const processedMetrics: Record<string, PerformanceMetrics> = {}
      
      Object.entries(rawMetrics).forEach(([name, data]) => {
        const throttleRate = data.calls > 0 ? (data.throttled / data.calls) * 100 : 0
        const averageDelay = data.calls > 0 ? (Date.now() - data.lastCall) / data.calls : 0
        
        processedMetrics[name] = {
          name,
          calls: data.calls,
          throttled: data.throttled,
          throttleRate,
          lastCall: data.lastCall,
          averageDelay
        }
      })
      
      setMetrics(processedMetrics)
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  // Monitor frame rate
  useEffect(() => {
    if (!isVisible) return

    let animationId: number

    const measureFrameRate = () => {
      frameCountRef.current++
      const now = performance.now()
      
      if (now - lastTimeRef.current >= 1000) {
        setFrameRate(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
      
      animationId = requestAnimationFrame(measureFrameRate)
    }

    animationId = requestAnimationFrame(measureFrameRate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isVisible])

  const clearMetrics = useCallback(() => {
    const monitor = ThrottleMonitor.getInstance()
    monitor.reset()
    setMetrics({})
  }, [])

  if (!isVisible) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const metricEntries = Object.values(metrics)
  const totalCalls = metricEntries.reduce((sum, m) => sum + m.calls, 0)
  const totalThrottled = metricEntries.reduce((sum, m) => sum + m.throttled, 0)
  const overallThrottleRate = totalCalls > 0 ? (totalThrottled / totalCalls) * 100 : 0

  return (
    <div
      className={`fixed z-50 bg-black/90 text-white text-xs font-mono border border-gray-600 rounded-lg shadow-lg transition-all duration-200 ${
        positionClasses[position]
      } ${isExpanded ? 'w-80' : 'w-auto'} ${className}`}
    >
      {/* Header */}
      <div 
        className="p-2 border-b border-gray-600 cursor-pointer flex items-center justify-between bg-gray-800 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              frameRate >= 50 ? 'bg-green-500' : frameRate >= 30 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <span>Throttle Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{frameRate}fps</span>
          <span className={isExpanded ? 'rotate-90' : ''}>▶</span>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Overall stats */}
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-300 mb-1">Overall Performance</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Total Calls:</span>
                <span className="ml-1 text-white">{totalCalls}</span>
              </div>
              <div>
                <span className="text-gray-400">Throttled:</span>
                <span className="ml-1 text-white">{totalThrottled}</span>
              </div>
              <div>
                <span className="text-gray-400">Rate:</span>
                <span 
                  className={`ml-1 ${
                    overallThrottleRate > 80 ? 'text-green-400' : 
                    overallThrottleRate > 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}
                >
                  {overallThrottleRate.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">FPS:</span>
                <span 
                  className={`ml-1 ${
                    frameRate >= 50 ? 'text-green-400' : 
                    frameRate >= 30 ? 'text-yellow-400' : 'text-red-400'
                  }`}
                >
                  {frameRate}
                </span>
              </div>
            </div>
          </div>

          {/* Individual function metrics */}
          {metricEntries.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {metricEntries.map((metric) => (
                <div key={metric.name} className="bg-gray-800 p-2 rounded text-xs">
                  <div className="text-gray-300 font-medium mb-1 truncate" title={metric.name}>
                    {metric.name}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <span className="text-gray-400">Calls:</span>
                      <span className="ml-1 text-white">{metric.calls}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Throttled:</span>
                      <span className="ml-1 text-white">{metric.throttled}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Rate:</span>
                      <span 
                        className={`ml-1 ${
                          metric.throttleRate > 80 ? 'text-green-400' : 
                          metric.throttleRate > 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}
                      >
                        {metric.throttleRate.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last:</span>
                      <span className="ml-1 text-white">
                        {metric.lastCall ? `${((Date.now() - metric.lastCall) / 1000).toFixed(1)}s` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              No throttled functions detected
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 pt-2 border-t border-gray-600">
            <button
              onClick={clearMetrics}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Minimize
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Hook for tracking throttle performance in components
 */
export function useThrottlePerformanceTracking(componentName: string) {
  const [metrics, setMetrics] = useState<{
    renderTime: number
    throttleEfficiency: number
    frameDrops: number
  }>({
    renderTime: 0,
    throttleEfficiency: 0,
    frameDrops: 0
  })

  const trackRender = useCallback(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        frameDrops: prev.frameDrops + (renderTime > 16.67 ? 1 : 0)
      }))

      if (process.env.NODE_ENV === 'development' && renderTime > 16.67) {
        console.warn(`[${componentName}] Render exceeded 60fps budget: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  const trackThrottle = useCallback((functionName: string, wasThrottled: boolean) => {
    const monitor = ThrottleMonitor.getInstance()
    monitor.track(`${componentName}.${functionName}`, wasThrottled)
  }, [componentName])

  return {
    metrics,
    trackRender,
    trackThrottle
  }
}

/**
 * HOC for automatic throttle performance tracking
 */
export function withThrottlePerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Component'
  
  return function TrackedComponent(props: P) {
    const { trackRender } = useThrottlePerformanceTracking(displayName)
    
    useEffect(() => {
      const endTracking = trackRender()
      return endTracking
    })
    
    return <Component {...props} />
  }
}