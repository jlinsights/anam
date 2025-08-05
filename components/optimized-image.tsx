'use client'

import { generateAltText, getArtworkImageMeta } from '@/lib/image-utils'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedArtworkImageProps {
  artwork: Artwork
  usage: 'gallery-grid' | 'gallery-detail' | 'featured' | 'hero' | 'thumbnail'
  className?: string
  aspectRatio?: string
  showLoadingState?: boolean
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
  onClick?: () => void
}

export function OptimizedArtworkImage({
  artwork,
  usage,
  className,
  aspectRatio,
  showLoadingState = true,
  priority,
  onLoad,
  onError,
  onClick,
}: OptimizedArtworkImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // artwork가 undefined이거나 필수 필드가 없으면 에러 상태로 처리
  if (!artwork || !artwork.slug || !artwork.year) {
    console.error(
      'OptimizedArtworkImage: artwork, slug, or year is missing',
      artwork
    )
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center',
          aspectRatio || 'aspect-[3/4]',
          className
        )}
      >
        <div className='text-gray-500 dark:text-gray-400 text-sm'>
          이미지를 불러올 수 없습니다
        </div>
      </div>
    )
  }

  // artwork.number 또는 artwork.slug와 artwork.year를 사용해서 최적화된 이미지 메타데이터 생성
  const imageMeta = (() => {
    // Number 필드가 있으면 숫자 기반 이미지 사용
    if ((artwork as any).number) {
      return getArtworkImageMeta((artwork as any).number, usage)
    }
    // 레거시 호환성을 위해 slug + year 사용
    const { getArtworkImageMeta: getLegacyImageMeta } = require('@/lib/image-utils')
    // 레거시 함수가 필요한 경우 별도 처리
    return {
      src: artwork.imageUrl, // 이미 imageUrl에 올바른 경로가 설정되어 있음
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      loading: 'lazy' as const,
      priority: false
    }
  })()
  const altText = generateAltText(artwork.title, 'artwork')

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', {
      src: hasError ? artwork.imageUrl : imageMeta.src,
      title: artwork.title,
      usage
    })
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    console.error('🖼️ Image load error:', {
      optimizedSrc: imageMeta.src,
      fallbackSrc: artwork.imageUrl,
      title: artwork.title,
      slug: artwork.slug,
      year: artwork.year,
      number: (artwork as any).number
    })
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // 에러 발생 시 기존 imageUrl로 fallback
  const finalSrc = hasError ? artwork.imageUrl : imageMeta.src

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        aspectRatio || 'aspect-[3/4]',
        className,
        onClick && 'cursor-zoom-in'
      )}
      onClick={onClick}
    >
      {/* 로딩 스켈레톤 */}
      {isLoading && showLoadingState && (
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700' />
      )}

      {/* 최적화된 이미지 */}
      <Image
        src={finalSrc}
        sizes={imageMeta.sizes}
        alt={altText}
        fill
        className={cn(
          'object-cover transition-all duration-700 ease-out',
          isLoading && showLoadingState && 'scale-110 blur-sm opacity-0',
          !isLoading && 'scale-100 blur-0 opacity-100'
        )}
        loading={priority ? 'eager' : (imageMeta.loading as 'eager' | 'lazy')}
        priority={priority ?? imageMeta.priority}
        onLoad={handleLoad}
        onError={handleError}
        quality={85}
      />
    </div>
  )
}

// 기존 ArtworkCard에서 사용할 수 있는 간편한 래퍼 컴포넌트들
export function GalleryGridImage({
  artwork,
  className,
  priority,
}: {
  artwork: Artwork
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedArtworkImage
      artwork={artwork}
      usage='gallery-grid'
      className={className}
      priority={priority}
    />
  )
}

export function GalleryDetailImage({
  artwork,
  className,
  onClick,
}: {
  artwork: Artwork
  className?: string
  onClick?: () => void
}) {
  return (
    <OptimizedArtworkImage
      artwork={artwork}
      usage='gallery-detail'
      className={className}
      priority={true}
      onClick={onClick}
    />
  )
}

export function FeaturedImage({
  artwork,
  className,
  priority,
}: {
  artwork: Artwork
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedArtworkImage
      artwork={artwork}
      usage='featured'
      className={className}
      priority={priority}
    />
  )
}

export function ThumbnailImage({
  artwork,
  className,
}: {
  artwork: Artwork
  className?: string
}) {
  return (
    <OptimizedArtworkImage
      artwork={artwork}
      usage='thumbnail'
      className={className}
      priority={false}
    />
  )
}
