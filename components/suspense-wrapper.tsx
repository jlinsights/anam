import { Suspense, ReactNode } from 'react'

interface SuspenseWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

// 기본 로딩 스피너
export function LoadingSpinner({
  size = 'medium',
}: {
  size?: 'small' | 'medium' | 'large'
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  return (
    <div className='flex items-center justify-center p-4'>
      <div
        className={`${sizeClasses[size]} border-2 border-ink/30 border-t-ink animate-spin rounded-full`}
      />
    </div>
  )
}

// 갤러리용 로딩 폴백
export function GalleryLoadingFallback() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className='space-y-4'>
          <div className='aspect-[4/5] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />
          <div className='space-y-2'>
            <div className='h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            <div className='h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          </div>
        </div>
      ))}
    </div>
  )
}

// 작품 상세용 로딩 폴백
export function ArtworkLoadingFallback() {
  return (
    <div className='space-y-8'>
      <div className='aspect-[4/5] max-w-2xl mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />
      <div className='max-w-2xl mx-auto space-y-4'>
        <div className='h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
        <div className='space-y-2'>
          <div className='h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          <div className='h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
        </div>
      </div>
    </div>
  )
}

// 메인 Suspense 래퍼
export function SuspenseWrapper({
  children,
  fallback,
  name,
}: SuspenseWrapperProps) {
  const defaultFallback = <LoadingSpinner />

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}

// 특화된 Suspense 래퍼들
export function GallerySuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseWrapper fallback={<GalleryLoadingFallback />} name='gallery'>
      {children}
    </SuspenseWrapper>
  )
}

export function ArtworkSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseWrapper fallback={<ArtworkLoadingFallback />} name='artwork'>
      {children}
    </SuspenseWrapper>
  )
}

// 이미지 로딩용 Suspense
export function ImageSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseWrapper fallback={<LoadingSpinner size='small' />} name='image'>
      {children}
    </SuspenseWrapper>
  )
}
