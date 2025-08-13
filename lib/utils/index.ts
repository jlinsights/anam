// Re-export existing utils
export * from './api-utils'

// Export throttling utilities
export * from './throttle'

// Export existing cn utility
export { cn } from '../utils'

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]

// Performance utilities
export const performance60fps = {
  frameTime: 16.67, // 60fps = 16.67ms per frame
  isWithinBudget: (duration: number) => duration <= 16.67,
  formatTime: (ms: number) => `${ms.toFixed(2)}ms`,
  logPerformance: (name: string, duration: number) => {
    if (process.env.NODE_ENV === 'development') {
      const status = duration <= 16.67 ? '✅' : '⚠️'
      console.log(`${status} [Performance] ${name}: ${duration.toFixed(2)}ms`)
    }
  }
}

// Debounce utility for non-throttled scenarios
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Animation frame utilities
export const animationFrame = {
  request: (callback: FrameRequestCallback) => {
    if (typeof window !== 'undefined') {
      return requestAnimationFrame(callback)
    }
    return 0
  },
  cancel: (id: number) => {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(id)
    }
  }
}

// Intersection observer utilities
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  })
}