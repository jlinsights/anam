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
 * 작품 이미지 일괄 프리로딩
 */
export async function preloadArtworkImages(
  artworkIds: string[],
  size: ImageSize = 'thumb'
): Promise<void> {
  const format = getBestImageFormat()
  const preloadPromises = artworkIds.map((id) =>
    preloadImage(getOptimizedImagePath(id, size, format))
  )

  try {
    await Promise.allSettled(preloadPromises)
  } catch (error) {
    console.warn('Some images failed to preload:', error)
  }
}

/**
 * 이미지 지연 로딩을 위한 Intersection Observer 생성
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback)
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1,
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
 * 레이지 로딩을 위한 블러 플레이스홀더 생성
 */
export function generateBlurDataURL(
  width: number = 8,
  height: number = 10
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 한국 전통 색상으로 그라데이션 생성
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgb(254, 252, 232)') // 한지색
  gradient.addColorStop(1, 'rgb(120, 113, 108)') // 돌색

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.1)
}
