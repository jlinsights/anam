'use client'

import { generateAltText, getArtworkImageMeta } from '@/lib/image-utils'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import type { ErrorInfo } from 'react'
import { ImageErrorBoundary, ImageErrorFallback } from '@/components/error-boundary/ImageErrorBoundary'
import { captureError } from '@/lib/error-logger'

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

// Image component wrapped in error boundary
export function OptimizedArtworkImageWithErrorBoundary({
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
  return (
    <ImageErrorBoundary
      imageContext={usage === 'gallery-grid' ? 'gallery' : 
                   usage === 'gallery-detail' ? 'artwork' :
                   usage === 'thumbnail' ? 'thumbnail' : 'artwork'}
      artworkTitle={artwork.title}
      className={className}
      onError={(error: Error, errorInfo: ErrorInfo) => {
        console.error('Artwork image error:', {
          error,
          errorInfo,
          artwork: artwork.title,
          usage,
          imageUrl: artwork.imageUrl
        })
        
        // Send to error tracking
        captureError(error, {
          component: 'OptimizedArtworkImage',
          artworkTitle: artwork.title,
          usage,
          imageUrl: artwork.imageUrl,
          errorBoundary: 'image'
        })
      }}
      fallback={
        <ImageErrorFallback
          error={new Error('Image loading failed')}
          resetError={() => window.location.reload()}
          imageContext={usage}
          compact={usage === 'thumbnail'}
          className={cn(
            aspectRatio || 'aspect-[3/4]',
            className
          )}
        />
      }
    >
      <OptimizedArtworkImageInner
        artwork={artwork}
        usage={usage}
        className={className}
        aspectRatio={aspectRatio}
        showLoadingState={showLoadingState}
        priority={priority}
        onLoad={onLoad}
        onError={onError}
        onClick={onClick}
      />
    </ImageErrorBoundary>
  )
}

// Inner image component without error boundary
function OptimizedArtworkImageInner({
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
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // artwork가 undefined이거나 필수 필드가 없으면 에러 상태로 처리
  if (!artwork || !artwork.slug || !artwork.year) {
    console.error(
      'OptimizedArtworkImage: artwork, slug, or year is missing',
      artwork
    )
    
    // Throw error to be caught by error boundary
    throw new Error(`Invalid artwork data: ${JSON.stringify({
      hasArtwork: !!artwork,
      hasSlug: !!(artwork?.slug),
      hasYear: !!(artwork?.year)
    })}`)
  }

  // artwork.number 또는 artwork.slug와 artwork.year를 사용해서 최적화된 이미지 메타데이터 생성
  const imageMeta = (() => {
    try {
      // Number 필드가 있으면 숫자 기반 이미진 사용
      if ((artwork as any).number) {
        return getArtworkImageMeta((artwork as any).number, usage)
      }
      // 레거시 호환성을 위해 slug + year 사용
      return {
        src: artwork.imageUrl, // 이미 imageUrl에 올바른 경로가 설정되어 있음
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        loading: 'lazy' as const,
        priority: false
      }
    } catch (error) {
      console.error('Error generating image metadata:', error)
      // Fallback to basic image data
      return {
        src: artwork.imageUrl,
        sizes: '100vw',
        loading: 'lazy' as const,
        priority: false
      }
    }
  })()
  
  const altText = generateAltText(artwork.title, 'artwork')

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', {
      src: hasError ? artwork.imageUrl : imageMeta.src,
      title: artwork.title,
      usage,
      retryCount
    })
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    console.error('🖼️ Image load error:', {
      optimizedSrc: imageMeta.src,
      fallbackSrc: artwork.imageUrl,
      title: artwork.title,
      slug: artwork.slug,
      year: artwork.year,
      number: (artwork as any).number,
      retryCount,
      usage
    })
    
    // Try fallback or retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying image load (${retryCount + 1}/${maxRetries})...`)
      setRetryCount(prev => prev + 1)
      // Trigger reload by changing the src slightly
      setTimeout(() => {
        setIsLoading(true)
        setHasError(false)
      }, 1000 * (retryCount + 1)) // Exponential backoff
    } else {
      setHasError(true)
      setIsLoading(false)
      onError?.()
      
      // If all retries failed, throw error for error boundary
      throw new Error(`Image failed to load after ${maxRetries} retries: ${artwork.title}`)
    }
  }

  // 에러 발생 시 기존 imageUrl로 fallback
  const finalSrc = hasError ? artwork.imageUrl : imageMeta.src
  const imageKey = `${finalSrc}-${retryCount}` // Force re-render on retry

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-paper-warm',
        aspectRatio || 'aspect-[3/4]',
        className,
        onClick && 'cursor-zoom-in'
      )}
      onClick={onClick}
    >
      {/* 로딩 스켈레톤 */}
      {isLoading && showLoadingState && (
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-paper via-paper-warm to-paper' />
      )}

      {/* 에러 상태 표시 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-warm border border-ink/20">
          <div className="text-center space-y-zen-xs">
            <span className="text-2xl">📷</span>
            <p className="font-display text-ink-light text-xs">
              이미지 로드 실패
            </p>
            {retryCount < maxRetries && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setRetryCount(prev => prev + 1)
                  setIsLoading(true)
                  setHasError(false)
                }}
                className="
                  px-zen-xs py-1 text-xs
                  bg-ink text-paper font-display
                  hover:bg-gold hover:text-ink
                  transition-all duration-300
                  border border-ink
                  focus:outline-none focus:ring-1 focus:ring-gold
                "
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      )}

      {/* 최적화된 이미지 */}
      {!hasError && (
        <Image
          key={imageKey}
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
      )}
    </div>
  )
}

// Wrapper components for easier usage
export function GalleryGridImageWithErrorBoundary({
  artwork,
  className,
  priority,
}: {
  artwork: Artwork
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedArtworkImageWithErrorBoundary
      artwork={artwork}
      usage='gallery-grid'
      className={className}
      priority={priority}
    />
  )
}

export function GalleryDetailImageWithErrorBoundary({
  artwork,
  className,
  onClick,
}: {
  artwork: Artwork
  className?: string
  onClick?: () => void
}) {
  return (
    <OptimizedArtworkImageWithErrorBoundary
      artwork={artwork}
      usage='gallery-detail'
      className={className}
      priority={true}
      onClick={onClick}
    />
  )
}

export function FeaturedImageWithErrorBoundary({
  artwork,
  className,
  priority,
}: {
  artwork: Artwork
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedArtworkImageWithErrorBoundary
      artwork={artwork}
      usage='featured'
      className={className}
      priority={priority}
    />
  )
}

export function ThumbnailImageWithErrorBoundary({
  artwork,
  className,
}: {
  artwork: Artwork
  className?: string
}) {
  return (
    <OptimizedArtworkImageWithErrorBoundary
      artwork={artwork}
      usage='thumbnail'
      className={className}
      priority={false}
    />
  )
}