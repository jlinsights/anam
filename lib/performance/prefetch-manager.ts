/**
 * Prefetch Manager
 * 리소스 프리페치 및 프리로드 관리
 */

import { CODE_SPLITTING } from './performance-config'

type PrefetchOptions = {
  priority?: 'high' | 'low'
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch'
  crossorigin?: 'anonymous' | 'use-credentials'
}

class PrefetchManager {
  private prefetched = new Set<string>()
  private preloaded = new Set<string>()

  /**
   * 리소스 프리페치 (낮은 우선순위)
   */
  prefetch(url: string, options: PrefetchOptions = {}): void {
    if (this.prefetched.has(url)) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url

    if (options.as) {
      link.as = options.as
    }

    if (options.crossorigin) {
      link.crossOrigin = options.crossorigin
    }

    document.head.appendChild(link)
    this.prefetched.add(url)
  }

  /**
   * 리소스 프리로드 (높은 우선순위)
   */
  preload(url: string, options: PrefetchOptions = {}): void {
    if (this.preloaded.has(url)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url

    if (options.as) {
      link.as = options.as
    }

    if (options.crossorigin) {
      link.crossOrigin = options.crossorigin
    }

    document.head.appendChild(link)
    this.preloaded.add(url)
  }

  /**
   * 컴포넌트 프리로드 (동적 임포트)
   */
  preloadComponent(importFn: () => Promise<any>): void {
    // 동적 임포트를 미리 실행하여 번들 로드
    importFn().catch(() => {
      // 에러 무시 (프리로드는 선택사항)
    })
  }

  /**
   * 라우트 프리페치 (Next.js Link hover 시)
   */
  prefetchRoute(href: string): void {
    if (typeof window === 'undefined') return

    // Next.js의 자동 프리페치를 활용하거나 수동으로 프리페치
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }

  /**
   * 이미지 프리로드
   */
  preloadImage(src: string, sizes?: string): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src

    if (sizes) {
      link.setAttribute('imagesizes', sizes)
    }

    document.head.appendChild(link)
  }

  /**
   * 폰트 프리로드
   */
  preloadFont(
    href: string,
    type: string,
    crossorigin: 'anonymous' | 'use-credentials' = 'anonymous'
  ): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.href = href
    link.type = type
    link.crossOrigin = crossorigin
    document.head.appendChild(link)
  }

  /**
   * DNS 프리페치
   */
  prefetchDNS(hostname: string): void {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = `//${hostname}`
    document.head.appendChild(link)
  }

  /**
   * 연결 프리커넥트
   */
  preconnect(
    url: string,
    crossorigin: 'anonymous' | 'use-credentials' = 'anonymous'
  ): void {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = url
    link.crossOrigin = crossorigin
    document.head.appendChild(link)
  }

  /**
   * 프리페치된 리소스 확인
   */
  isPrefetched(url: string): boolean {
    return this.prefetched.has(url)
  }

  /**
   * 프리로드된 리소스 확인
   */
  isPreloaded(url: string): boolean {
    return this.preloaded.has(url)
  }
}

// 전역 프리페치 매니저 인스턴스
export const prefetchManager =
  typeof window !== 'undefined' ? new PrefetchManager() : null

/**
 * 마우스 호버 시 라우트 프리페치
 */
export function useRoutePrefetch() {
  if (typeof window === 'undefined') return

  const handleMouseEnter = (href: string) => {
    if (prefetchManager && !prefetchManager.isPrefetched(href)) {
      prefetchManager.prefetchRoute(href)
    }
  }

  return { handleMouseEnter }
}

/**
 * 중요 리소스 자동 프리로드
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined' || !prefetchManager) return

  // 중요 이미지 프리로드
  const criticalImages = [
    '/Images/hero-image.jpg',
    '/Images/Artworks/featured/featured-01.webp',
  ]

  criticalImages.forEach((src) => {
    prefetchManager.preloadImage(src)
  })

  // 중요 폰트 프리로드 (이미 layout.tsx에서 처리됨)
  // prefetchManager.preloadFont('/fonts/...', 'font/woff2')
}

// 페이지 로드 시 중요 리소스 프리로드
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources)
  } else {
    preloadCriticalResources()
  }
}
