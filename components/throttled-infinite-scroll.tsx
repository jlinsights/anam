'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useThrottledIntersection, useThrottledScroll } from '@/lib/hooks/use-throttled-handlers'
import { Loader2 } from 'lucide-react'

interface ThrottledInfiniteScrollProps {
  children: React.ReactNode
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
  className?: string
  loadingComponent?: React.ReactNode
  endMessage?: React.ReactNode
}

/**
 * Throttled infinite scroll component optimized for gallery performance
 * Uses intersection observer and throttled scroll handlers for smooth 60fps experience
 */
export function ThrottledInfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  className = '',
  loadingComponent,
  endMessage
}: ThrottledInfiniteScrollProps) {
  const [hasTriggered, setHasTriggered] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const lastLoadTime = useRef<number>(0)
  const loadingRef = useRef<boolean>(false)

  // Throttled load more function to prevent excessive calls
  const throttledLoadMore = useCallback(() => {
    const now = Date.now()
    
    // Prevent rapid successive calls (minimum 500ms between loads)
    if (now - lastLoadTime.current < 500) {
      return
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      return
    }

    if (hasMore && !isLoading) {
      loadingRef.current = true
      lastLoadTime.current = now
      setHasTriggered(true)
      onLoadMore()
    }
  }, [hasMore, isLoading, onLoadMore])

  // Reset loading state when loading prop changes
  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false
      setHasTriggered(false)
    }
  }, [isLoading])

  // Intersection observer for trigger element
  const { observe, unobserve } = useThrottledIntersection(
    useCallback((entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      if (entry?.isIntersecting && !hasTriggered) {
        throttledLoadMore()
      }
    }, [throttledLoadMore, hasTriggered]),
    {
      rootMargin: `${threshold}px`,
      threshold: 0.1
    },
    100, // 100ms throttle for intersection
    [threshold]
  )

  // Observe trigger element
  useEffect(() => {
    const trigger = triggerRef.current
    if (trigger) {
      observe(trigger)
      return () => unobserve(trigger)
    }
  }, [observe, unobserve])

  // Fallback scroll handler for edge cases
  useThrottledScroll(
    useCallback(() => {
      if (hasTriggered || !hasMore || isLoading) return

      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        throttledLoadMore()
      }
    }, [hasTriggered, hasMore, isLoading, threshold, throttledLoadMore]),
    100, // 100ms throttle for scroll
    [hasTriggered, hasMore, isLoading, threshold]
  )

  const defaultLoadingComponent = (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">작품을 불러오는 중...</span>
      </div>
    </div>
  )

  const defaultEndMessage = (
    <div className="text-center py-8">
      <div className="text-gray-600 dark:text-gray-400">
        <div className="w-12 h-12 mx-auto mb-3 opacity-50">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm">모든 작품을 확인했습니다</p>
      </div>
    </div>
  )

  return (
    <div className={className}>
      {children}
      
      {/* Trigger element for intersection observer */}
      {hasMore && (
        <div
          ref={triggerRef}
          className="w-full h-4"
          aria-hidden="true"
        />
      )}
      
      {/* Loading state */}
      {isLoading && (loadingComponent || defaultLoadingComponent)}
      
      {/* End message */}
      {!hasMore && !isLoading && (endMessage || defaultEndMessage)}
    </div>
  )
}

/**
 * Hook for managing infinite scroll state with throttling
 */
export function useThrottledInfiniteScrollState<T>(
  initialData: T[] = [],
  fetchMore: (offset: number, limit: number) => Promise<T[]>,
  pageSize: number = 20
) {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const offsetRef = useRef(0)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    try {
      setIsLoading(true)
      setError(null)
      
      const newData = await fetchMore(offsetRef.current, pageSize)
      
      if (newData.length < pageSize) {
        setHasMore(false)
      }
      
      if (newData.length > 0) {
        setData(prev => [...prev, ...newData])
        offsetRef.current += newData.length
      } else {
        setHasMore(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more data'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchMore, pageSize, isLoading, hasMore])

  const reset = useCallback(() => {
    setData(initialData)
    setIsLoading(false)
    setHasMore(true)
    setError(null)
    offsetRef.current = 0
  }, [initialData])

  const retry = useCallback(() => {
    if (error) {
      setError(null)
      loadMore()
    }
  }, [error, loadMore])

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    retry
  }
}

/**
 * Virtualized infinite scroll for large datasets
 * Uses virtual scrolling for optimal performance with thousands of items
 */
export function VirtualizedInfiniteScroll<T>({
  items,
  itemHeight,
  renderItem,
  hasMore,
  isLoading,
  onLoadMore,
  containerHeight = 600,
  overscan = 5,
  className = ''
}: {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  containerHeight?: number
  overscan?: number
  className?: string
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  )

  const throttledScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setScrollTop(target.scrollTop)

    // Check if we need to load more
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight
    const currentScrollTop = target.scrollTop

    if (scrollHeight - currentScrollTop - clientHeight < 200 && hasMore && !isLoading) {
      onLoadMore()
    }
  }, [hasMore, isLoading, onLoadMore])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={throttledScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {items.slice(visibleStart, visibleEnd).map((item, index) => {
          const actualIndex = visibleStart + index
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          )
        })}
        
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: items.length * itemHeight,
              width: '100%',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}