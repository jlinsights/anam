'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useThrottledResize } from '@/lib/hooks/use-throttled-handlers'

interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

interface ViewportSize {
  width: number
  height: number
  breakpoint: keyof ResponsiveBreakpoints
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
}

/**
 * Hook for throttled responsive behavior
 * Provides viewport size and breakpoint information with optimized resize handling
 */
export function useThrottledResponsive(
  breakpoints: ResponsiveBreakpoints = DEFAULT_BREAKPOINTS
): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768, breakpoint: 'desktop' }
    }
    
    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getBreakpoint(width, breakpoints)
    
    return { width, height, breakpoint }
  })

  const updateViewport = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getBreakpoint(width, breakpoints)
    
    setViewport(prev => {
      // Only update if values actually changed to prevent unnecessary re-renders
      if (prev.width !== width || prev.height !== height || prev.breakpoint !== breakpoint) {
        return { width, height, breakpoint }
      }
      return prev
    })
  }, [breakpoints])

  // Use throttled resize handler (100ms default for layout updates)
  useThrottledResize(updateViewport, 100, [breakpoints])

  return viewport
}

function getBreakpoint(width: number, breakpoints: ResponsiveBreakpoints): keyof ResponsiveBreakpoints {
  if (width >= breakpoints.wide) return 'wide'
  if (width >= breakpoints.desktop) return 'desktop'
  if (width >= breakpoints.tablet) return 'tablet'
  return 'mobile'
}

/**
 * Throttled responsive grid component
 * Automatically adjusts grid columns based on viewport size
 */
export function ThrottledResponsiveGrid({
  children,
  className = '',
  columnConfig = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4
  },
  gap = 4
}: {
  children: React.ReactNode
  className?: string
  columnConfig?: Partial<Record<keyof ResponsiveBreakpoints, number>>
  gap?: number
}) {
  const { breakpoint } = useThrottledResponsive()
  const columns = columnConfig[breakpoint] || 1

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Throttled responsive image component
 * Optimizes image sizes based on viewport and container
 */
export function ThrottledResponsiveImage({
  src,
  alt,
  className = '',
  aspectRatio = '1/1',
  sizes,
  priority = false,
  onLoad,
  onError
}: {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
  sizes?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}) {
  const { width, breakpoint } = useThrottledResponsive()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 768px) 50vw,
    (max-width: 1024px) 33vw,
    25vw
  `.trim()

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Preload critical images based on viewport
  useEffect(() => {
    if (priority && typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
      
      return () => {
        document.head.removeChild(link)
      }
    }
  }, [src, priority])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {!hasError ? (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            sizes={responsiveSizes}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm">이미지를 불러올 수 없습니다</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Throttled responsive container component
 * Provides responsive padding and margins based on viewport
 */
export function ThrottledResponsiveContainer({
  children,
  className = '',
  paddingConfig = {
    mobile: 4,
    tablet: 6,
    desktop: 8,
    wide: 12
  },
  maxWidth = '1280px'
}: {
  children: React.ReactNode
  className?: string
  paddingConfig?: Partial<Record<keyof ResponsiveBreakpoints, number>>
  maxWidth?: string
}) {
  const { breakpoint } = useThrottledResponsive()
  const padding = paddingConfig[breakpoint] || 4

  return (
    <div
      className={`mx-auto ${className}`}
      style={{
        maxWidth,
        padding: `${padding * 0.25}rem`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Hook for throttled element size tracking
 * Uses ResizeObserver with throttling for optimal performance
 */
export function useThrottledElementSize<T extends HTMLElement>(): [
  React.RefObject<T>,
  { width: number; height: number }
] {
  const elementRef = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const resizeObserverRef = useRef<ResizeObserver>()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Throttled resize handler
    let timeoutId: NodeJS.Timeout
    const throttledResize = (entries: ResizeObserverEntry[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const entry = entries[0]
        if (entry) {
          const { width, height } = entry.contentRect
          setSize(prev => {
            if (prev.width !== width || prev.height !== height) {
              return { width, height }
            }
            return prev
          })
        }
      }, 100) // 100ms throttle for element resize
    }

    resizeObserverRef.current = new ResizeObserver(throttledResize)
    resizeObserverRef.current.observe(element)

    return () => {
      clearTimeout(timeoutId)
      resizeObserverRef.current?.disconnect()
    }
  }, [])

  return [elementRef, size]
}

/**
 * Throttled responsive text component
 * Adjusts font size based on viewport and content
 */
export function ThrottledResponsiveText({
  children,
  className = '',
  sizeConfig = {
    mobile: 'text-sm',
    tablet: 'text-base',
    desktop: 'text-lg',
    wide: 'text-xl'
  }
}: {
  children: React.ReactNode
  className?: string
  sizeConfig?: Partial<Record<keyof ResponsiveBreakpoints, string>>
}) {
  const { breakpoint } = useThrottledResponsive()
  const fontSize = sizeConfig[breakpoint] || 'text-base'

  return (
    <div className={`${fontSize} ${className}`}>
      {children}
    </div>
  )
}