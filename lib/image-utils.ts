// 이미지 크기 타입 정의
export type ImageSize = 'thumb' | 'medium' | 'large' | 'original'

// 사용 용도별 이미지 크기 매핑
export const IMAGE_SIZE_MAP = {
  'gallery-grid': 'medium' as ImageSize,
  'gallery-detail': 'large' as ImageSize,
  featured: 'medium' as ImageSize,
  hero: 'large' as ImageSize,
  thumbnail: 'thumb' as ImageSize,
} as const

/**
 * 숫자 기반 최적화된 이미지 경로 생성 (Airtable Number 필드 매칭)
 */
export function getOptimizedImagePath(
  artworkNumber: string | number,
  size: ImageSize = 'medium'
): string {
  // 숫자를 2자리 문자열로 변환 (01, 02, 03...)
  const paddedNumber = String(artworkNumber).padStart(2, '0')
  
  // 최적화된 이미지 경로 시도
  if (size !== 'original') {
    return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
  }

  // 원본 이미지 경로
  return `/Images/Artworks/originals/${paddedNumber}.jpg`
}

/**
 * Artwork 이미지 URL 생성 (숫자 기반)
 */
export function getArtworkImageUrl(
  artworkNumber: string | number,
  size: ImageSize = 'medium'
): string {
  return getOptimizedImagePath(artworkNumber, size)
}

/**
 * 레거시 호환성을 위한 slug 기반 함수 (deprecated)
 */
export function getArtworkImageUrlLegacy(
  slug: string,
  year: string | number,
  size: ImageSize = 'medium'
): string {
  const basePath = `/Images/Artworks/${year}/${slug}`

  // 최적화된 이미지 경로 시도
  if (size !== 'original') {
    return `${basePath}-${size}.jpg`
  }

  // 원본 이미지 경로
  return `${basePath}.jpg`
}

/**
 * 사용 용도에 따른 이미지 메타데이터 생성 (숫자 기반)
 */
export function getArtworkImageMeta(
  artworkNumber: string | number,
  usage: keyof typeof IMAGE_SIZE_MAP
) {
  const size = IMAGE_SIZE_MAP[usage]
  const src = getArtworkImageUrl(artworkNumber, size)

  // 사용 용도별 sizes 속성
  const sizesMap = {
    'gallery-grid': '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    'gallery-detail': '(max-width: 768px) 100vw, 80vw',
    featured: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    hero: '100vw',
    thumbnail: '(max-width: 768px) 25vw, 200px',
  }

  // 사용 용도별 loading 우선순위
  const priorityMap = {
    'gallery-grid': false,
    'gallery-detail': true,
    featured: true,
    hero: true,
    thumbnail: false,
  }

  return {
    src,
    sizes: sizesMap[usage],
    loading: priorityMap[usage] ? 'eager' : 'lazy',
    priority: priorityMap[usage],
  }
}

/**
 * 아티스트 이미지 URL 생성
 */
export function getArtistImageUrl(filename: string): string {
  return `/images/artist/${filename}`
}

/**
 * Alt 텍스트 생성
 */
export function generateAltText(
  title: string,
  type: 'artwork' | 'artist'
): string {
  if (type === 'artwork') {
    return `아남 배옥영 작가의 서예 작품 "${title}"`
  }
  return `아남 배옥영 작가 ${title}`
}

/**
 * 반응형 이미지 sizes 속성 생성
 */
export function getImageSizes(
  type: 'artwork' | 'artist' | 'gallery' | 'featured'
): string {
  const sizesMap = {
    artwork: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    artist: '(max-width: 768px) 100vw, 50vw',
    gallery: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    featured: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  }

  return sizesMap[type]
}

/**
 * 이미지 URL 생성 함수 (개발환경 고려)
 */
export function generateImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 85
): string {
  if (src.startsWith('http')) {
    return src // 외부 URL은 그대로 반환
  }

  // 개발 환경에서는 placeholder 사용
  if (process.env.NODE_ENV === 'development' && src.includes('placeholder')) {
    return src
  }

  // Next.js 자체 최적화 사용
  return src
}

/**
 * 이미지 preload 링크 생성
 */
export function generatePreloadLink(src: string, sizes?: string) {
  return {
    rel: 'preload',
    as: 'image',
    href: src,
    ...(sizes && { imageSizes: sizes }),
  }
}

/**
 * 이미지가 존재하는지 확인하는 함수 (클라이언트 사이드에서만 사용)
 */
export function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      // 서버 사이드에서는 항상 true 반환
      resolve(true)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/**
 * 여러 이미지 크기 중 존재하는 첫 번째 이미지 URL을 반환합니다.
 */
export async function getAvailableImageUrl(
  artworkNumber: string | number
): Promise<string> {
  const sizes: ImageSize[] = ['large', 'medium', 'thumb', 'original']

  for (const size of sizes) {
    const url = getArtworkImageUrl(artworkNumber, size)
    const exists = await checkImageExists(url)
    if (exists) {
      return url
    }
  }

  // 모든 이미지가 없으면 기본 medium 크기 반환
  return getArtworkImageUrl(artworkNumber, 'medium')
}

/**
 * 레거시 호환성을 위한 slug 기반 함수 (deprecated)
 */
export async function getAvailableImageUrlLegacy(
  slug: string,
  year: string | number
): Promise<string> {
  const sizes: ImageSize[] = ['large', 'medium', 'thumb', 'original']

  for (const size of sizes) {
    const url = getArtworkImageUrlLegacy(slug, year, size)
    const exists = await checkImageExists(url)
    if (exists) {
      return url
    }
  }

  // 모든 이미지가 없으면 기본 medium 크기 반환
  return getArtworkImageUrlLegacy(slug, year, 'medium')
}
