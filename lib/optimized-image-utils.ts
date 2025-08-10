/**
 * 최적화된 이미지 유틸리티
 * WebP, AVIF 포맷과 다중 크기 지원
 */

export type ImageSize = 'thumb' | 'medium' | 'large'
export type ImageFormat = 'jpg' | 'webp' | 'avif'

export interface OptimizedImageSources {
  jpg: string
  webp: string
  avif: string
}

export interface ResponsiveImageData {
  thumb: OptimizedImageSources
  medium: OptimizedImageSources
  large: OptimizedImageSources
  alt: string
  aspectRatio: string
}

// 이미지 크기별 설정
export const IMAGE_SIZES = {
  thumb: { width: 400, height: 500 },
  medium: { width: 800, height: 1000 },
  large: { width: 1200, height: 1500 },
} as const

/**
 * 원본 이미지 파일명에서 작품 ID 추출
 * 01.jpg -> "01", 05-대 copy.jpg -> "05-대 copy"
 */
export function extractArtworkId(filename: string): string {
  return filename.replace(/\.(jpg|jpeg|png)$/i, '')
}

/**
 * 작품 ID로부터 최적화된 이미지 경로 생성
 */
export function getOptimizedImagePath(
  artworkId: string,
  size: ImageSize,
  format: ImageFormat
): string {
  const extension = format === 'jpg' ? 'jpg' : format
  return `/Images/Artworks/optimized/${artworkId}/${artworkId}-${size}.${extension}`
}

/**
 * 작품 ID로부터 모든 포맷의 이미지 소스 생성
 */
export function getOptimizedImageSources(
  artworkId: string,
  size: ImageSize
): OptimizedImageSources {
  return {
    jpg: getOptimizedImagePath(artworkId, size, 'jpg'),
    webp: getOptimizedImagePath(artworkId, size, 'webp'),
    avif: getOptimizedImagePath(artworkId, size, 'avif'),
  }
}

/**
 * 작품 ID로부터 완전한 반응형 이미지 데이터 생성
 */
export function getResponsiveImageData(
  artworkId: string,
  title: string,
  aspectRatio: string = '4/5'
): ResponsiveImageData {
  return {
    thumb: getOptimizedImageSources(artworkId, 'thumb'),
    medium: getOptimizedImageSources(artworkId, 'medium'),
    large: getOptimizedImageSources(artworkId, 'large'),
    alt: `${title} - 아남 배옥영 서예 작품`,
    aspectRatio,
  }
}

/**
 * 브라우저 지원 여부에 따른 최적 포맷 선택
 */
export function getBestImageFormat(): ImageFormat {
  if (typeof window === 'undefined') return 'jpg' // SSR

  // AVIF 지원 검사
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const avifSupported = canvas.toDataURL('image/avif').indexOf('avif') !== -1

  if (avifSupported) return 'avif'

  // WebP 지원 검사
  const webpSupported = canvas.toDataURL('image/webp').indexOf('webp') !== -1
  if (webpSupported) return 'webp'

  return 'jpg'
}

/**
 * Picture 엘리먼트용 소스 배열 생성
 */
export function getPictureSources(
  artworkId: string,
  size: ImageSize
): Array<{ srcSet: string; type: string }> {
  const sources = getOptimizedImageSources(artworkId, size)

  return [
    { srcSet: sources.avif, type: 'image/avif' },
    { srcSet: sources.webp, type: 'image/webp' },
    { srcSet: sources.jpg, type: 'image/jpeg' },
  ]
}

/**
 * 이미지 프리로딩 함수
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Smart artwork image preloading with network awareness
 */
export async function preloadArtworkImages(
  artworkIds: string[],
  size: ImageSize = 'thumb',
  priority: boolean = false
): Promise<void> {
  // Network-aware optimization
  const connection = (navigator as any).connection
  const isSlowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')
  
  if (isSlowConnection && !priority) {
    // Skip preloading on slow connections unless priority
    return
  }

  const format = getBestImageFormat()
  const limit = priority ? artworkIds.length : Math.min(6, artworkIds.length) // Limit non-priority preloading
  
  const preloadPromises = artworkIds.slice(0, limit).map((id) =>
    preloadImage(getOptimizedImagePath(id, size, format))
  )

  try {
    if (priority) {
      await Promise.all(preloadPromises) // Wait for priority images
    } else {
      Promise.allSettled(preloadPromises) // Don't block for non-priority
    }
  } catch (error) {
    console.warn('Some images failed to preload:', error)
  }
}

/**
 * Enhanced intersection observer for Core Web Vitals optimization
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: {
    rootMargin?: string
    threshold?: number
    priority?: boolean
  }
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  const { rootMargin = '100px 0px', threshold = 0.1, priority = false } = options || {}

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback)
    },
    {
      rootMargin: priority ? '200px 0px' : rootMargin, // Larger margin for priority images
      threshold,
    }
  )
}

/**
 * 이미지 파일 크기 추정 (성능 모니터링용)
 */
export function estimateImageSize(
  size: ImageSize,
  format: ImageFormat
): number {
  const baseSizes = {
    thumb: { jpg: 30, webp: 20, avif: 25 }, // KB
    medium: { jpg: 120, webp: 80, avif: 100 },
    large: { jpg: 300, webp: 200, avif: 250 },
  }

  return baseSizes[size][format] * 1024 // bytes
}

/**
 * Enhanced blur placeholder with Korean traditional aesthetics
 */
export function generateBlurDataURL(
  width: number = 8,
  height: number = 10,
  title?: string
): string {
  if (typeof window === 'undefined') {
    // Server-side fallback SVG
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(254,252,232);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(120,113,108);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        ${title ? `<text x="50%" y="50%" text-anchor="middle" font-size="1" fill="#9ca3af">${title}</text>` : ''}
      </svg>
    `)}`
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Enhanced Korean traditional gradient
  const gradient = ctx.createRadialGradient(width/2, height/3, 0, width/2, height, Math.max(width, height))
  gradient.addColorStop(0, 'rgb(254, 252, 232)') // 한지색
  gradient.addColorStop(0.6, 'rgb(168, 85, 27)') // 황금색
  gradient.addColorStop(1, 'rgb(120, 113, 108)') // 돌색

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Add subtle noise for better blur effect
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10
    data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
  }
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL('image/jpeg', 0.15)
}

/**
 * Generate optimized blur placeholder for specific artwork
 */
export function generateArtworkBlurPlaceholder(
  artworkId: string,
  title: string
): string {
  // Use artwork-specific dimensions (4:5 aspect ratio)
  return generateBlurDataURL(8, 10, title)
}

/**
 * Critical image preloading for LCP optimization
 */
export function preloadCriticalImages(imageSources: string[]): void {
  if (typeof window === 'undefined') return

  imageSources.forEach((src, index) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    if (index === 0) link.fetchPriority = 'high' // First image highest priority
    document.head.appendChild(link)
  })
}

/**
 * Layout shift prevention with aspect ratio containers
 */
export function getAspectRatioStyle(width: number, height: number): React.CSSProperties {
  return {
    aspectRatio: `${width} / ${height}`,
    containIntrinsicSize: `${width}px ${height}px`
  }
}
