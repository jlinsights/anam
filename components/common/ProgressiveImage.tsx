'use client'

import { useState } from 'react'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  blurDataURL?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

// 작품 이미지를 브라우저 기본 방식으로 그린다(seonggok.com 과 같은 방식): 처음부터 src 를 주고
// loading="lazy"·decoding="async" 로 지연 로딩한다. 예전에는 src 없이 그려 두고 IntersectionObserver +
// new Image() 미리 받기가 성공해야 src 를 넣었는데, 미리 받기가 실패하면 스피너만 영원히 돌았다.
// 스피너·흐림·투명도 애니메이션 없이, 이미지가 오기 전에는 종이색 바탕(placeholderClassName)만 보인다.
// blurDataURL 은 예전 호출부와의 호환을 위해 받기만 하고 쓰지 않는다.
export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholderClassName = 'bg-paper-warm',
  priority = false,
  sizes,
  onLoad,
  onError,
  fallbackSrc,
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  // 같은 자리에 다른 작품이 오면(src 변경) 대체 이미지·오류 상태를 처음부터 다시 시작한다
  if (src !== prevSrc) {
    setPrevSrc(src)
    setCurrentSrc(src)
    setFailed(false)
  }

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      return
    }
    setFailed(true)
    onError?.()
  }

  return (
    <div
      className={`relative overflow-hidden ${placeholderClassName} ${className}`}
    >
      {failed ? (
        <div className='absolute inset-0 flex flex-col items-center justify-center p-4 text-center'>
          <p className='font-display text-ink-light text-sm'>
            이미지를 불러올 수 없습니다
          </p>
          <button
            type='button'
            onClick={() => {
              setFailed(false)
              setCurrentSrc(src)
            }}
            className='mt-2 text-xs text-ink-light underline hover:text-ink'
          >
            다시 시도
          </button>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 크기별 정적 파일을 그대로 쓴다(next.config images.unoptimized)
        <img
          src={currentSrc}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding='async'
          fetchPriority={priority ? 'high' : undefined}
          onLoad={onLoad}
          onError={handleError}
          className='w-full h-full object-cover'
        />
      )}
    </div>
  )
}

// Optimized artwork image component
interface ArtworkImageProps extends Omit<ProgressiveImageProps, 'src' | 'alt'> {
  artwork: {
    imageUrl?: string
    number?: number | string
    slug?: string
    title: string
    year: number
    id?: string
  }
  size?: 'thumb' | 'medium' | 'large'
  quality?: number
  alt?: string
}

export function ArtworkImage({
  artwork,
  size = 'medium',
  quality = 75,
  alt,
  ...props
}: ArtworkImageProps) {
  // Generate optimized image URLs with enhanced error handling
  const generateImageUrl = (
    artwork: ArtworkImageProps['artwork'],
    size: string
  ) => {
    try {
      // 우선순위 1: slug에서 숫자 추출 (new format: "01", "02", etc.)
      if (artwork.slug && typeof artwork.slug === 'string') {
        // Try direct number format first (01, 02, 03...)
        if (/^\d{1,2}$/.test(artwork.slug)) {
          const paddedNumber = artwork.slug.padStart(2, '0')
          return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
        }
        // Try anam-XX format
        const numberMatch = artwork.slug.match(/anam-(\d+)/)
        if (numberMatch) {
          const paddedNumber = numberMatch[1].padStart(2, '0')
          return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
        }
      }

      // 우선순위 2: number 필드 사용
      if (artwork.number) {
        const paddedNumber = String(artwork.number).padStart(2, '0')
        return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
      }

      // 우선순위 3: id 필드에서 숫자 추출
      if (artwork.id && typeof artwork.id === 'string') {
        const idNumber = parseInt(artwork.id)
        if (!isNaN(idNumber)) {
          const paddedNumber = idNumber.toString().padStart(2, '0')
          return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
        }
      }

      console.warn('Could not generate image URL for artwork:', {
        title: artwork.title,
        slug: artwork.slug,
        number: artwork.number,
        id: artwork.id,
      })
      // Fallback to legacy system or placeholder
      return artwork.imageUrl || '/images/placeholder-artwork.svg'
    } catch (error) {
      console.error(
        'Error generating image URL:',
        error,
        'for artwork:',
        artwork.title
      )
      return '/images/placeholder-artwork.svg'
    }
  }

  const src = generateImageUrl(artwork, size)
  const fallbackSrc = generateImageUrl(artwork, 'thumb')

  // Enhanced blur data URL with Korean traditional colors (SSR-safe)
  const generateBlurDataURL = () => {
    const svgString = `
      <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(254,252,232);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(120,113,108);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="serif" font-size="14" fill="#6b7280">
          ${artwork.title || 'Loading...'}
        </text>
      </svg>
    `.trim()

    // btoa는 Latin-1만 받아 한글 제목에서 예외를 던진다: base64 대신 UTF-8 퍼센트 인코딩을 쓴다
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
  }

  const blurDataURL = generateBlurDataURL()

  return (
    <ProgressiveImage
      src={src}
      alt={alt || `${artwork.title} (${artwork.year})`}
      blurDataURL={blurDataURL}
      fallbackSrc={fallbackSrc !== src ? fallbackSrc : undefined}
      {...props}
    />
  )
}
