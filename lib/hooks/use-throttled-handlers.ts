'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  throttle,
  throttleAnimationFrame,
  createThrottledMouseHandler,
  createThrottledScrollHandler,
  createThrottledResizeHandler,
  createThrottledSearchHandler,
  THROTTLE_DELAYS,
  type ThrottledFunction
} from '@/lib/utils/throttle'

/**
 * Hook for throttled mouse move handlers
 * Optimized for smooth mouse tracking at 60fps
 */
export function useThrottledMouseMove<T extends HTMLElement = HTMLElement>(
  handler: (event: React.MouseEvent<T>) => void,
  deps: React.DependencyList = []
): (event: React.MouseEvent<T>) => void {
  const throttledHandler = useRef<ThrottledFunction<typeof handler>>()

  useEffect(() => {
    throttledHandler.current = createThrottledMouseHandler(handler)
    
    return () => {
      throttledHandler.current?.cancel()
    }
  }, [handler, ...deps])

  return useCallback((event: React.MouseEvent<T>) => {
    throttledHandler.current?.(event)
  }, [])
}

/**
 * Hook for throttled scroll handlers
 * Optimized for infinite loading and scroll-based animations
 */
export function useThrottledScroll(
  handler: (event: Event) => void,
  delay: number = THROTTLE_DELAYS.SCROLL,
  deps: React.DependencyList = []
): () => void {
  const throttledHandler = useRef<ThrottledFunction<typeof handler>>()

  useEffect(() => {
    throttledHandler.current = createThrottledScrollHandler(handler, delay)

    const handleScroll = (event: Event) => {
      throttledHandler.current?.(event)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      throttledHandler.current?.cancel()
    }
  }, [handler, delay, ...deps])

  return useCallback(() => {
    throttledHandler.current?.flush()
  }, [])
}

/**
 * Hook for throttled resize handlers
 * Optimized for responsive component updates
 */
export function useThrottledResize(
  handler: (event: Event) => void,
  delay: number = THROTTLE_DELAYS.RESIZE,
  deps: React.DependencyList = []
): () => void {
  const throttledHandler = useRef<ThrottledFunction<typeof handler>>()

  useEffect(() => {
    throttledHandler.current = createThrottledResizeHandler(handler, delay)

    const handleResize = (event: Event) => {
      throttledHandler.current?.(event)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      window.removeEventListener('resize', handleResize)
      throttledHandler.current?.cancel()
    }
  }, [handler, delay, ...deps])

  return useCallback(() => {
    throttledHandler.current?.flush()
  }, [])
}

/**
 * Hook for throttled search input handlers
 * Optimized for search-as-you-type functionality
 */
export function useThrottledSearch(
  handler: (query: string) => void,
  delay: number = THROTTLE_DELAYS.SEARCH,
  deps: React.DependencyList = []
): (query: string) => void {
  const throttledHandler = useRef<ThrottledFunction<typeof handler>>()

  useEffect(() => {
    throttledHandler.current = createThrottledSearchHandler(handler, delay)
    
    return () => {
      throttledHandler.current?.cancel()
    }
  }, [handler, delay, ...deps])

  return useCallback((query: string) => {
    throttledHandler.current?.(query)
  }, [])
}

/**
 * Hook for throttled intersection observer
 * Optimized for infinite scrolling and lazy loading
 */
export function useThrottledIntersection(
  handler: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
  delay: number = THROTTLE_DELAYS.SCROLL,
  deps: React.DependencyList = []
): {
  observe: (element: Element) => void
  unobserve: (element: Element) => void
  disconnect: () => void
} {
  const observerRef = useRef<IntersectionObserver>()
  const throttledHandler = useRef<ThrottledFunction<typeof handler>>()

  useEffect(() => {
    throttledHandler.current = throttle(handler, delay)

    observerRef.current = new IntersectionObserver((entries) => {
      throttledHandler.current?.(entries)
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })

    return () => {
      observerRef.current?.disconnect()
      throttledHandler.current?.cancel()
    }
  }, [handler, delay, ...deps])

  const observe = useCallback((element: Element) => {
    observerRef.current?.observe(element)
  }, [])

  const unobserve = useCallback((element: Element) => {
    observerRef.current?.unobserve(element)
  }, [])

  const disconnect = useCallback(() => {
    observerRef.current?.disconnect()
  }, [])

  return { observe, unobserve, disconnect }
}

/**
 * Hook for throttled animation handlers
 * Uses requestAnimationFrame for optimal performance
 */
export function useThrottledAnimation<T extends (...args: any[]) => void>(
  handler: T,
  deps: React.DependencyList = []
): T {
  const throttledHandler = useRef<ThrottledFunction<T>>()

  useEffect(() => {
    throttledHandler.current = throttleAnimationFrame(handler)
    
    return () => {
      throttledHandler.current?.cancel()
    }
  }, [handler, ...deps])

  return useCallback((...args: Parameters<T>) => {
    throttledHandler.current?.(...args)
  }, []) as T
}

/**
 * Hook for throttled API calls
 * Prevents excessive server requests
 */
export function useThrottledApiCall<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = THROTTLE_DELAYS.API,
  deps: React.DependencyList = []
): T {
  const throttledCall = useRef<ThrottledFunction<T>>()

  useEffect(() => {
    throttledCall.current = throttle(apiCall, delay)
    
    return () => {
      throttledCall.current?.cancel()
    }
  }, [apiCall, delay, ...deps])

  return useCallback((...args: Parameters<T>) => {
    return throttledCall.current?.(...args)
  }, []) as T
}

/**
 * Hook for throttled gallery scroll detection
 * Specifically optimized for gallery infinite loading
 */
export function useThrottledGalleryScroll(
  onLoadMore: () => void,
  threshold: number = 200,
  deps: React.DependencyList = []
): void {
  useThrottledScroll(
    useCallback(() => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        onLoadMore()
      }
    }, [onLoadMore, threshold]),
    THROTTLE_DELAYS.SCROLL,
    deps
  )
}

/**
 * Hook for throttled filter updates
 * Optimized for search and filter components
 */
export function useThrottledFilter<T>(
  filterFunction: (data: T[], query: string, filters: Record<string, any>) => T[],
  data: T[],
  delay: number = THROTTLE_DELAYS.SEARCH
): {
  filter: (query: string, filters: Record<string, any>) => void
  filteredData: T[]
  isFiltering: boolean
} {
  const [filteredData, setFilteredData] = useState<T[]>(data)
  const [isFiltering, setIsFiltering] = useState(false)
  const filterRef = useRef<ThrottledFunction<typeof filterFunction>>()

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  useEffect(() => {
    filterRef.current = throttle((data: T[], query: string, filters: Record<string, any>) => {
      const result = filterFunction(data, query, filters)
      setFilteredData(result)
      setIsFiltering(false)
    }, delay)

    return () => {
      filterRef.current?.cancel()
    }
  }, [filterFunction, delay])

  const filter = useCallback((query: string, filters: Record<string, any>) => {
    setIsFiltering(true)
    filterRef.current?.(data, query, filters)
  }, [data])

  return {
    filter,
    filteredData,
    isFiltering
  }
}

/**
 * Hook for performance monitoring of throttled functions
 */
export function useThrottlePerformance(name: string) {
  const startTime = useRef<number>()
  const callCount = useRef<number>(0)

  const startMeasure = useCallback(() => {
    startTime.current = performance.now()
    callCount.current++
  }, [])

  const endMeasure = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Throttle Performance] ${name}: ${duration.toFixed(2)}ms (call #${callCount.current})`)
        
        if (duration > 16.67) {
          console.warn(`[Throttle Performance] ${name} exceeded 60fps budget (${duration.toFixed(2)}ms)`)
        }
      }
    }
  }, [name])

  return { startMeasure, endMeasure }
}