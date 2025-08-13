/**
 * Throttling utilities for performance-sensitive handlers
 * Ensures smooth 60fps performance across the ANAM Gallery application
 */

export type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per specified delay period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ThrottledFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let lastArgs: Parameters<T> | null = null

  const throttledFunction = (...args: Parameters<T>) => {
    const now = Date.now()
    lastArgs = args

    // If enough time has passed since last call, execute immediately
    if (now - lastCallTime >= delay) {
      lastCallTime = now
      func(...args)
      return
    }

    // Otherwise, schedule execution for later if not already scheduled
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now()
        timeoutId = null
        if (lastArgs) {
          func(...lastArgs)
        }
      }, delay - (now - lastCallTime))
    }
  }

  throttledFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    lastArgs = null
  }

  throttledFunction.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId)
      timeoutId = null
      lastCallTime = Date.now()
      func(...lastArgs)
      lastArgs = null
    }
  }

  return throttledFunction
}

/**
 * Creates a throttled function optimized for animation frames (60fps)
 * Uses requestAnimationFrame for better performance with visual updates
 */
export function throttleAnimationFrame<T extends (...args: any[]) => any>(
  func: T
): ThrottledFunction<T> {
  let rafId: number | null = null
  let lastArgs: Parameters<T> | null = null

  const throttledFunction = (...args: Parameters<T>) => {
    lastArgs = args

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (lastArgs) {
          func(...lastArgs)
          lastArgs = null
        }
      })
    }
  }

  throttledFunction.cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    lastArgs = null
  }

  throttledFunction.flush = () => {
    if (rafId && lastArgs) {
      cancelAnimationFrame(rafId)
      rafId = null
      func(...lastArgs)
      lastArgs = null
    }
  }

  return throttledFunction
}

/**
 * Pre-configured throttle delays for common use cases
 * Optimized for 60fps performance (16.67ms frame time)
 */
export const THROTTLE_DELAYS = {
  /** For mouse move, scroll handlers - allows smooth tracking */
  MOUSE_MOVE: 16, // ~60fps
  
  /** For scroll handlers - balance between responsiveness and performance */
  SCROLL: 16, // ~60fps
  
  /** For resize handlers - less frequent updates needed */
  RESIZE: 100, // 10fps - sufficient for layout updates
  
  /** For search input - balance between responsiveness and API calls */
  SEARCH: 300, // 3.33fps - good for user typing
  
  /** For API calls - prevent excessive requests */
  API: 500, // 2fps - reduce server load
  
  /** For heavy computations - allow time for other operations */
  COMPUTATION: 200, // 5fps - balance performance and responsiveness
} as const

/**
 * Creates a throttled mouse move handler optimized for tracking
 */
export function createThrottledMouseHandler<T extends (event: MouseEvent | React.MouseEvent) => void>(
  handler: T,
  delay: number = THROTTLE_DELAYS.MOUSE_MOVE
): ThrottledFunction<T> {
  return throttleAnimationFrame(handler) as ThrottledFunction<T>
}

/**
 * Creates a throttled scroll handler optimized for infinite loading
 */
export function createThrottledScrollHandler<T extends (event: Event) => void>(
  handler: T,
  delay: number = THROTTLE_DELAYS.SCROLL
): ThrottledFunction<T> {
  return throttle(handler, delay)
}

/**
 * Creates a throttled resize handler optimized for responsive components
 */
export function createThrottledResizeHandler<T extends (event: Event) => void>(
  handler: T,
  delay: number = THROTTLE_DELAYS.RESIZE
): ThrottledFunction<T> {
  return throttle(handler, delay)
}

/**
 * Creates a throttled search handler optimized for input filtering
 */
export function createThrottledSearchHandler<T extends (query: string) => void>(
  handler: T,
  delay: number = THROTTLE_DELAYS.SEARCH
): ThrottledFunction<T> {
  return throttle(handler, delay)
}

/**
 * Higher-order component for throttling event handlers
 */
export function withThrottle<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  handlerMap: Record<keyof P, number>
) {
  return function ThrottledComponent(props: P) {
    const throttledProps = { ...props }
    
    for (const [propName, delay] of Object.entries(handlerMap)) {
      const handler = props[propName as keyof P]
      if (typeof handler === 'function') {
        throttledProps[propName as keyof P] = throttle(handler, delay) as any
      }
    }
    
    return React.createElement(Component, throttledProps)
  }
}

/**
 * Hook for creating and managing throttled functions
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  deps: React.DependencyList = []
): ThrottledFunction<T> {
  return React.useMemo(() => throttle(func, delay), [func, delay, ...deps])
}

/**
 * Hook for creating animation frame throttled functions
 */
export function useThrottleAnimationFrame<T extends (...args: any[]) => any>(
  func: T,
  deps: React.DependencyList = []
): ThrottledFunction<T> {
  return React.useMemo(() => throttleAnimationFrame(func), [func, ...deps])
}

/**
 * Performance monitoring for throttled functions
 */
export class ThrottleMonitor {
  private static instance: ThrottleMonitor
  private metrics: Map<string, { calls: number; throttled: number; lastCall: number }> = new Map()

  static getInstance(): ThrottleMonitor {
    if (!ThrottleMonitor.instance) {
      ThrottleMonitor.instance = new ThrottleMonitor()
    }
    return ThrottleMonitor.instance
  }

  track(name: string, wasThrottled: boolean) {
    const metric = this.metrics.get(name) || { calls: 0, throttled: 0, lastCall: 0 }
    metric.calls++
    if (wasThrottled) metric.throttled++
    metric.lastCall = Date.now()
    this.metrics.set(name, metric)
  }

  getMetrics(name?: string) {
    if (name) return this.metrics.get(name)
    return Object.fromEntries(this.metrics.entries())
  }

  reset(name?: string) {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

/**
 * Creates a monitored throttled function for performance tracking
 */
export function throttleWithMonitoring<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  name: string
): ThrottledFunction<T> {
  const monitor = ThrottleMonitor.getInstance()
  const throttledFunc = throttle((...args: Parameters<T>) => {
    monitor.track(name, false)
    return func(...args)
  }, delay)

  const originalFunc = throttledFunc
  const monitoredFunc = (...args: Parameters<T>) => {
    monitor.track(name, true)
    return originalFunc(...args)
  }

  monitoredFunc.cancel = throttledFunc.cancel
  monitoredFunc.flush = throttledFunc.flush

  return monitoredFunc as ThrottledFunction<T>
}