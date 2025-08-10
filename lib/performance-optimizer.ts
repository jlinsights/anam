/**
 * Core Web Vitals 최적화를 위한 성능 유틸리티
 */

// 네트워크 상태 감지
export function getNetworkInfo() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      isSlowConnection: false
    }
  }

  const connection = (navigator as any).connection
  const isSlowConnection = 
    connection.effectiveType === '2g' || 
    connection.effectiveType === 'slow-2g' ||
    connection.downlink < 1

  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    isSlowConnection
  }
}

// 디바이스 성능 감지
export function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return {
      hardwareConcurrency: 4,
      deviceMemory: 8,
      isLowEndDevice: false
    }
  }

  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const deviceMemory = (navigator as any).deviceMemory || 8
  const isLowEndDevice = hardwareConcurrency < 4 || deviceMemory < 4

  return {
    hardwareConcurrency,
    deviceMemory,
    isLowEndDevice
  }
}

// LCP 최적화를 위한 중요한 리소스 식별
export function identifyLCPCandidate(elements: Element[]): Element | null {
  // Above-the-fold에서 가장 큰 요소 찾기
  let largestElement: Element | null = null
  let largestSize = 0

  elements.forEach(element => {
    const rect = element.getBoundingClientRect()
    const isVisible = rect.top < window.innerHeight && rect.left < window.innerWidth
    
    if (isVisible) {
      const size = rect.width * rect.height
      if (size > largestSize) {
        largestSize = size
        largestElement = element
      }
    }
  })

  return largestElement
}

// 이미지 우선순위 계산
export function calculateImagePriority(
  element: Element,
  index: number,
  totalImages: number
): {
  priority: boolean
  fetchPriority: 'high' | 'low' | 'auto'
  loading: 'eager' | 'lazy'
} {
  const rect = element.getBoundingClientRect()
  const isAboveFold = rect.top < window.innerHeight
  const isFirstImages = index < 6 // First 6 images get priority
  
  // High priority: above fold OR first 3 images
  const priority = isAboveFold || index < 3
  
  return {
    priority,
    fetchPriority: priority ? 'high' : (index < 6 ? 'auto' : 'low'),
    loading: priority ? 'eager' : 'lazy'
  }
}

// CLS 방지를 위한 레이아웃 안정성 검사
export function checkLayoutStability(element: Element): {
  hasExplicitDimensions: boolean
  hasAspectRatio: boolean
  hasReservedSpace: boolean
  recommendations: string[]
} {
  const computedStyle = window.getComputedStyle(element)
  const recommendations: string[] = []

  const hasExplicitDimensions = 
    computedStyle.width !== 'auto' && 
    computedStyle.height !== 'auto'

  const hasAspectRatio = 
    computedStyle.aspectRatio !== 'auto'

  const hasReservedSpace = 
    hasExplicitDimensions || 
    hasAspectRatio ||
    computedStyle.containIntrinsicSize !== 'none'

  if (!hasReservedSpace) {
    recommendations.push('Add explicit dimensions or aspect-ratio')
  }

  if (computedStyle.contain === 'none') {
    recommendations.push('Add CSS containment for better performance')
  }

  return {
    hasExplicitDimensions,
    hasAspectRatio,
    hasReservedSpace,
    recommendations
  }
}

// 적응형 로딩 전략
export class AdaptiveLoadingStrategy {
  private networkInfo = getNetworkInfo()
  private deviceInfo = getDeviceInfo()
  
  shouldPreloadImages(): boolean {
    return !this.networkInfo.isSlowConnection && !this.deviceInfo.isLowEndDevice
  }

  getOptimalImageFormat(): 'avif' | 'webp' | 'jpg' {
    if (this.deviceInfo.isLowEndDevice) return 'jpg'
    
    // Check browser support
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    
    if (canvas.toDataURL('image/avif').includes('avif')) return 'avif'
    if (canvas.toDataURL('image/webp').includes('webp')) return 'webp'
    
    return 'jpg'
  }

  getOptimalImageSize(): 'thumb' | 'medium' | 'large' {
    const { isSlowConnection } = this.networkInfo
    const { isLowEndDevice } = this.deviceInfo
    const screenWidth = window.innerWidth

    if (isSlowConnection || isLowEndDevice) return 'thumb'
    if (screenWidth < 768) return 'medium'
    if (screenWidth < 1200) return 'medium'
    
    return 'large'
  }

  shouldUseProgressiveLoading(): boolean {
    return this.networkInfo.isSlowConnection || this.deviceInfo.isLowEndDevice
  }

  getIntersectionObserverMargin(): string {
    if (this.networkInfo.isSlowConnection) return '50px 0px'
    if (this.deviceInfo.isLowEndDevice) return '100px 0px'
    
    return '200px 0px' // Aggressive preloading for good connections
  }
}

// Performance budgets and monitoring
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals thresholds
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  
  // Custom thresholds
  TTI: { good: 3800, poor: 7300 },
  FCP: { good: 1800, poor: 3000 },
  
  // Resource budgets
  BUNDLE_SIZE: { good: 200 * 1024, poor: 400 * 1024 }, // bytes
  IMAGE_SIZE: { good: 500 * 1024, poor: 1024 * 1024 },
  FONT_SIZE: { good: 100 * 1024, poor: 200 * 1024 }
} as const

// Real-time performance monitoring
export class PerformanceWatcher {
  private metrics: Map<string, number> = new Map()
  
  recordMetric(name: string, value: number) {
    this.metrics.set(name, value)
    
    // Check against budgets
    const budget = (PERFORMANCE_BUDGETS as any)[name.toUpperCase()]
    if (budget && value > budget.poor) {
      console.warn(`Performance budget exceeded for ${name}: ${value} > ${budget.poor}`)
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  reset() {
    this.metrics.clear()
  }
}

// Image loading optimization utility
export async function optimizeImageLoading(
  images: HTMLImageElement[],
  strategy: AdaptiveLoadingStrategy
) {
  const priorityImages = images.slice(0, 6) // First 6 are priority
  const deferredImages = images.slice(6)

  // Load priority images immediately
  const priorityPromises = priorityImages.map(img => {
    if (img.dataset.src) {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    }
    return new Promise(resolve => {
      img.onload = img.onerror = resolve
    })
  })

  await Promise.allSettled(priorityPromises)

  // Defer non-priority images based on network/device
  if (strategy.shouldPreloadImages()) {
    // Fast connection: load remaining images with slight delay
    setTimeout(() => {
      deferredImages.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.removeAttribute('data-src')
        }
      })
    }, 100)
  }
  // Slow connection: let intersection observer handle it
}