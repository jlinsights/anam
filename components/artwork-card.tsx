'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { GalleryArtworkImage } from '@/components/optimized-artwork-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, Eye, Heart, Share2 } from 'lucide-react'

interface ArtworkCardProps {
  artwork: Artwork
  variant?: 'default' | 'minimal' | 'featured' | 'compact'
  className?: string
  showMetadata?: boolean
  showActions?: boolean
  priority?: boolean
}

export const ArtworkCard = memo(function ArtworkCard({
  artwork,
  variant = 'default',
  className,
  showMetadata = true,
  showActions = false,
  priority = false,
}: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Memoized event handlers to prevent unnecessary re-renders
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const cardVariants = {
    default: 'card-art hover-lift',
    minimal: 'bg-transparent border-none shadow-none hover:shadow-soft',
    featured: 'card-art-elevated hover:shadow-strong hover:-translate-y-2',
    compact: 'card-art hover:shadow-medium',
  }

  const imageAspectRatio = {
    default: 'aspect-[3/4]',
    minimal: 'aspect-[3/4]',
    featured: 'aspect-[4/5]',
    compact: 'aspect-square',
  }

  return (
    <Card
      className={cn(cardVariants[variant], className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className='p-0'>
        <Link href={`/gallery/${artwork.slug}`} className='block'>
          {/* 최적화된 이미지 컴포넌트 */}
          {artwork.imageId ? (
            <GalleryArtworkImage
              artworkId={artwork.imageId}
              title={artwork.title}
              priority={priority}
              className={cn(
                imageAspectRatio[variant],
                'w-full rounded-t-lg transition-transform duration-300',
                isHovered && 'scale-105'
              )}
            />
          ) : (
            <div
              className={cn(
                imageAspectRatio[variant],
                'w-full rounded-t-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center'
              )}
            >
              <span className='text-stone-500 text-sm'>이미지 준비중</span>
            </div>
          )}

          {/* 컨텐츠 영역 */}
          {showMetadata && (
            <div className='p-4 space-y-3'>
              {/* 제목 */}
              <h3 className='font-display font-medium text-ink leading-tight line-clamp-2 dark:text-neutral-100'>
                {artwork.title}
              </h3>

              {/* 메타데이터 */}
              <div className='flex items-center justify-between text-responsive-sm text-ink-light dark:text-neutral-300'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4' />
                  <span>{artwork.year}</span>
                </div>

                {artwork.featured && (
                  <Badge
                    variant='secondary'
                    className='text-xs dark:text-neutral-200 dark:bg-neutral-700'
                  >
                    대표작
                  </Badge>
                )}
              </div>

              {/* 재질/크기 정보 */}
              {variant !== 'compact' && (
                <div className='text-responsive-xs text-ink-lighter dark:text-neutral-400 space-y-1'>
                  {artwork.medium && (
                    <p className='line-clamp-1'>{artwork.medium}</p>
                  )}
                  {artwork.dimensions && (
                    <p className='line-clamp-1'>{artwork.dimensions}</p>
                  )}
                </div>
              )}

              {/* 액션 버튼들 */}
              {showActions && (
                <div className='flex items-center justify-between pt-2 border-t border-stone-light dark:border-neutral-700'>
                  <div className='flex items-center gap-3'>
                    <button className='flex items-center gap-1 text-responsive-xs text-ink-light hover:text-ink transition-colors focus-art'>
                      <Heart className='w-4 h-4' />
                      <span>좋아요</span>
                    </button>
                    <button className='flex items-center gap-1 text-responsive-xs text-ink-light hover:text-ink transition-colors focus-art'>
                      <Share2 className='w-4 h-4' />
                      <span>공유</span>
                    </button>
                  </div>
                  <button className='flex items-center gap-1 text-responsive-xs text-ink-light hover:text-ink transition-colors focus-art'>
                    <Eye className='w-4 h-4' />
                    <span>상세보기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  )
})

// 카테고리 라벨 변환 함수
function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    treasure: '문방사우',
    calligraphy: '서예',
    painting: '회화',
    mixed: '혼합매체',
    installation: '설치',
    sculpture: '조각',
    digital: '디지털',
    photography: '사진',
  }

  return categoryLabels[category] || category
}

// 작품 그리드 컴포넌트
interface ArtworkGridProps {
  artworks: Artwork[]
  variant?: 'default' | 'minimal' | 'featured' | 'compact'
  columns?: 2 | 3 | 4 | 5
  className?: string
  showMetadata?: boolean
  showActions?: boolean
}

export const ArtworkGrid = memo(function ArtworkGrid({
  artworks,
  variant = 'default',
  columns = 4,
  className,
  showMetadata = true,
  showActions = false,
}: ArtworkGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  }

  const gaps = {
    default: 'gap-6 md:gap-8',
    minimal: 'gap-4 md:gap-6',
    featured: 'gap-8 md:gap-10',
    compact: 'gap-4',
  }

  return (
    <div className={cn('grid', gridCols[columns], gaps[variant], className)}>
      {artworks.map((artwork, index) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          variant={variant}
          showMetadata={showMetadata}
          showActions={showActions}
          priority={index < 4} // 첫 4개 이미지는 우선 로딩
        />
      ))}
    </div>
  )
})

// 로딩 스켈레톤 컴포넌트
export const ArtworkCardSkeleton = memo(function ArtworkCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'minimal' | 'featured' | 'compact'
}) {
  const imageAspectRatio = {
    default: 'aspect-[3/4]',
    minimal: 'aspect-[3/4]',
    featured: 'aspect-[4/5]',
    compact: 'aspect-square',
  }

  return (
    <Card className='card-art'>
      <CardContent className='p-0'>
        <div
          className={cn(
            'bg-stone-light animate-pulse rounded-t-xl',
            imageAspectRatio[variant]
          )}
        />

        {variant !== 'minimal' && (
          <div className='p-4 md:p-6 space-y-3'>
            <div className='h-6 bg-stone-light animate-pulse rounded' />
            <div className='h-4 bg-stone-light animate-pulse rounded w-3/4' />
            <div className='h-3 bg-stone-light animate-pulse rounded w-1/2' />
          </div>
        )}

        {variant === 'minimal' && (
          <div className='pt-3 space-y-2'>
            <div className='h-5 bg-stone-light animate-pulse rounded' />
            <div className='h-3 bg-stone-light animate-pulse rounded w-1/3' />
          </div>
        )}
      </CardContent>
    </Card>
  )
})

