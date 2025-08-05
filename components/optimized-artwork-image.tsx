'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  type ImageSize,
  type ResponsiveImageData,
  getResponsiveImageData,
  getPictureSources,
  createImageObserver,
  generateBlurDataURL,
} from '@/lib/optimized-image-utils'

interface OptimizedArtworkImageProps {
  artworkId: string
  title: string
  size?: ImageSize
  aspectRatio?: string
  className?: string
  priority?: boolean
  onClick?: () => void
  onLoad?: () => void
  enableLazyLoading?: boolean
  showLoadingState?: boolean
}

export function OptimizedArtworkImage({
  artworkId,
  title,
  size = 'medium',
  aspectRatio = '4/5',
  className,
  priority = false,
  onClick,
  onLoad,
  enableLazyLoading = true,
  showLoadingState = true,
}: OptimizedArtworkImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!enableLazyLoading || priority)
  const [hasError, setHasError] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 반응형 이미지 데이터 생성
  const imageData: ResponsiveImageData = getResponsiveImageData(
    artworkId,
    title,
    aspectRatio
  )

  // Intersection Observer 설정 (지연 로딩)
  useEffect(() => {
    if (!enableLazyLoading || priority || isInView) return

    observerRef.current = createImageObserver((entry) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observerRef.current?.disconnect()
      }
    })

    if (imageRef.current && observerRef.current) {
      observerRef.current.observe(imageRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [enableLazyLoading, priority, isInView])

  // 이미지 로드 핸들러
  const handleImageLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    onLoad?.()
  }

  // 이미지 에러 핸들러
  const handleImageError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  // Picture 소스 생성
  const pictureSources = getPictureSources(artworkId, size)

  return (
    <div
      ref={imageRef}
      className={cn(
        'relative overflow-hidden bg-stone-100 dark:bg-stone-800',
        'transition-all duration-300 ease-in-out',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      style={{ aspectRatio }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {/* 로딩 상태 */}
      {showLoadingState && !isLoaded && isInView && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600'></div>
        </div>
      )}

      {/* 블러 플레이스홀더 */}
      {!isLoaded && (
        <div
          className='absolute inset-0 bg-gradient-to-b from-paper to-stone opacity-50'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:rgb(254,252,232);stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:rgb(120,113,108);stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='8' height='10' fill='url(%23grad)' /%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* 메인 이미지 */}
      {isInView && !hasError && (
        <picture className='absolute inset-0'>
          {pictureSources.map(({ srcSet, type }) => (
            <source key={type} srcSet={srcSet} type={type} />
          ))}
          <img
            src={imageData[size].jpg}
            alt={imageData.alt}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-500',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            decoding='async'
          />
        </picture>
      )}

      {/* 에러 상태 */}
      {hasError && (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'>
          <svg
            className='mb-2 h-8 w-8'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          <span className='text-sm'>이미지를 불러올 수 없습니다</span>
        </div>
      )}

      {/* 포커스 링 (접근성) */}
      {onClick && (
        <div className='absolute inset-0 ring-2 ring-transparent focus-within:ring-blue-500 focus-within:ring-offset-2' />
      )}
    </div>
  )
}

// 갤러리 그리드용 특화 컴포넌트
export function GalleryArtworkImage({
  artworkId,
  title,
  className,
  onClick,
}: {
  artworkId: string
  title: string
  className?: string
  onClick?: () => void
}) {
  return (
    <OptimizedArtworkImage
      artworkId={artworkId}
      title={title}
      size='thumb'
      aspectRatio='4/5'
      className={cn(
        'rounded-lg shadow-md transition-shadow hover:shadow-lg',
        className
      )}
      onClick={onClick}
      enableLazyLoading={true}
      showLoadingState={true}
    />
  )
}

// 상세 페이지용 특화 컴포넌트
export function DetailArtworkImage({
  artworkId,
  title,
  aspectRatio,
  className,
  onClick,
}: {
  artworkId: string
  title: string
  aspectRatio?: string
  className?: string
  onClick?: () => void
}) {
  return (
    <OptimizedArtworkImage
      artworkId={artworkId}
      title={title}
      size='large'
      aspectRatio={aspectRatio}
      className={cn('rounded-lg shadow-lg', className)}
      onClick={onClick}
      priority={true}
      enableLazyLoading={false}
      showLoadingState={true}
    />
  )
}

// 히어로 섹션용 특화 컴포넌트
export function HeroArtworkImage({
  artworkId,
  title,
  className,
}: {
  artworkId: string
  title: string
  className?: string
}) {
  return (
    <OptimizedArtworkImage
      artworkId={artworkId}
      title={title}
      size='large'
      aspectRatio='16/9'
      className={cn('rounded-xl shadow-2xl', className)}
      priority={true}
      enableLazyLoading={false}
      showLoadingState={false}
    />
  )
}
