'use client'

import { GalleryGridImage } from '@/components/optimized-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, Eye, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ZenBrutalistArtworkCardProps {
  artwork: Artwork
  variant?: 'zen' | 'brutal' | 'glass-ink' | 'fusion'
  immersionLevel?: 'minimal' | 'moderate' | 'maximum'
  traditionalDepth?: boolean
  className?: string
  showMetadata?: boolean
  showActions?: boolean
  priority?: boolean
}

export function ZenBrutalistArtworkCard({
  artwork,
  variant = 'zen',
  immersionLevel = 'moderate',
  traditionalDepth = true,
  className,
  showMetadata = true,
  showActions = false,
  priority = false,
}: ZenBrutalistArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Zen Brutalism Design System
  const cardVariants = {
    zen: {
      minimal: 'bg-transparent border-0 shadow-none p-zen-xl',
      moderate: 'ink-glass-primary rounded-none p-zen-lg hover:shadow-zen-float transition-all duration-700',
      maximum: 'ink-glass-elevated rounded-lg p-zen-md transform-gpu hover:scale-[1.02] transition-all duration-500'
    },
    brutal: {
      minimal: 'bg-paper brutal-border brutal-shadow p-zen-md',
      moderate: 'bg-paper-warm brutal-border brutal-shadow hover:brutal-shadow-strong transform hover:rotate-1 transition-all duration-300',
      maximum: 'bg-gradient-zen brutal-border brutal-shadow-strong transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500'
    },
    'glass-ink': {
      minimal: 'ink-glass-primary rounded-lg p-zen-sm',
      moderate: 'ink-glass-elevated rounded-xl p-zen-md hover:ink-glass-immersive transition-all duration-500',
      maximum: 'ink-glass-immersive rounded-2xl p-zen-lg backdrop-blur-3xl hover:scale-105 transition-all duration-700'
    },
    fusion: {
      minimal: 'ink-glass-primary brutal-border rounded-none p-zen-lg',
      moderate: 'ink-glass-elevated brutal-border rounded-lg p-zen-xl hover:brutal-shadow transform hover:rotate-1',
      maximum: 'ink-glass-immersive brutal-border brutal-shadow-strong rounded-xl p-zen-2xl transform hover:scale-105 hover:rotate-0'
    }
  }

  const imageAspectRatio = {
    zen: 'aspect-[4/5]',
    brutal: 'aspect-[3/4]',
    'glass-ink': 'aspect-[1/1]',
    fusion: 'aspect-[5/7]'
  }

  const typographyStyles = {
    zen: {
      title: 'zen-typography-section text-ink',
      meta: 'zen-typography-body text-ink-light',
      details: 'zen-typography-body text-ink-lighter'
    },
    brutal: {
      title: 'brutal-typography-accent text-ink font-black',
      meta: 'brutal-typography-accent text-ink-dark text-sm',
      details: 'font-bold text-ink-lighter text-xs uppercase tracking-wider'
    },
    'glass-ink': {
      title: 'zen-typography-hero text-ink font-light',
      meta: 'zen-typography-body text-ink-light',
      details: 'zen-typography-body text-ink-lighter'
    },
    fusion: {
      title: 'zen-typography-section text-ink font-medium',
      meta: 'brutal-typography-accent text-ink-light text-sm',
      details: 'zen-typography-body text-ink-lighter'
    }
  }

  const layoutSpacing = {
    minimal: 'space-y-zen-sm',
    moderate: 'space-y-zen-md', 
    maximum: 'space-y-zen-lg'
  }

  // Traditional Depth Calculation
  const depthLayer = traditionalDepth ? 'relative z-10' : ''
  const breathingSpace = traditionalDepth ? 'm-zen-lg' : 'm-zen-sm'

  return (
    <div className={cn(breathingSpace, depthLayer, className)}>
      <Card
        className={cn(
          cardVariants[variant][immersionLevel],
          'overflow-hidden group cursor-pointer',
          'hover:transform-gpu will-change-transform'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          <Link href={`/gallery/${artwork.slug}`} className="block">
            {/* Zen Brutalist Image Container */}
            <div className={cn(
              'relative overflow-hidden',
              imageAspectRatio[variant],
              variant === 'brutal' ? 'brutal-border border-b-0' : 'rounded-t-lg',
              traditionalDepth && 'after:absolute after:inset-0 after:bg-gradient-to-t after:from-ink/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500'
            )}>
              <GalleryGridImage
                artwork={artwork}
                className={cn(
                  'w-full h-full object-cover transition-all duration-700',
                  isHovered && variant === 'zen' && 'scale-105',
                  isHovered && variant === 'brutal' && 'scale-110 rotate-1',
                  isHovered && variant === 'glass-ink' && 'scale-105 filter brightness-110',
                  isHovered && variant === 'fusion' && 'scale-105 rotate-1'
                )}
                priority={priority}
              />
              
              {/* Traditional Depth Overlay */}
              {traditionalDepth && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-ink/20 to-transparent" />
                </div>
              )}
            </div>

            {/* Zen Brutalist Content Area */}
            {showMetadata && (
              <div className={cn(
                'p-zen-md',
                layoutSpacing[immersionLevel],
                variant === 'brutal' && 'brutal-border border-t-0'
              )}>
                {/* Title with Typography System */}
                <h3 className={cn(
                  typographyStyles[variant].title,
                  'line-clamp-2 group-hover:text-gold transition-colors duration-300'
                )}>
                  {artwork.title}
                </h3>

                {/* Metadata with Zen Spacing */}
                <div className={cn(
                  'flex items-center justify-between',
                  typographyStyles[variant].meta,
                  'mt-zen-sm'
                )}>
                  <div className="flex items-center gap-zen-xs">
                    <Calendar className="w-4 h-4" />
                    <span>{artwork.year}</span>
                  </div>

                  {artwork.featured && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'text-xs',
                        variant === 'brutal' && 'brutal-border bg-gold text-ink font-black uppercase'
                      )}
                    >
                      대표작
                    </Badge>
                  )}
                </div>

                {/* Medium/Dimensions with Traditional Depth */}
                {immersionLevel !== 'minimal' && (
                  <div className={cn(
                    typographyStyles[variant].details,
                    'mt-zen-sm space-y-zen-xs'
                  )}>
                    {artwork.medium && (
                      <p className="line-clamp-1">{artwork.medium}</p>
                    )}
                    {artwork.dimensions && (
                      <p className="line-clamp-1">{artwork.dimensions}</p>
                    )}
                  </div>
                )}

                {/* Glass Ink Action Buttons */}
                {showActions && (
                  <div className={cn(
                    'flex items-center justify-between mt-zen-md pt-zen-sm',
                    variant === 'brutal' ? 'brutal-border border-l-0 border-r-0 border-b-0' : 'border-t border-stone-light'
                  )}>
                    <div className="flex items-center gap-zen-sm">
                      <button className={cn(
                        'flex items-center gap-zen-xs text-ink-light hover:text-ink transition-colors focus-art',
                        typographyStyles[variant].details
                      )}>
                        <Heart className="w-4 h-4" />
                        <span>좋아요</span>
                      </button>
                      <button className={cn(
                        'flex items-center gap-zen-xs text-ink-light hover:text-ink transition-colors focus-art',
                        typographyStyles[variant].details
                      )}>
                        <Share2 className="w-4 h-4" />
                        <span>공유</span>
                      </button>
                    </div>
                    <button className={cn(
                      'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-colors focus-art',
                      typographyStyles[variant].details
                    )}>
                      <Eye className="w-4 h-4" />
                      <span>상세보기</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

// Zen Brutalist Gallery Grid System
interface ZenBrutalistGalleryProps {
  artworks: Artwork[]
  variant?: 'zen' | 'brutal' | 'glass-ink' | 'fusion'
  immersionLevel?: 'minimal' | 'moderate' | 'maximum'
  traditionalDepth?: boolean
  className?: string
  showMetadata?: boolean
  showActions?: boolean
}

export function ZenBrutalistGallery({
  artworks,
  variant = 'zen',
  immersionLevel = 'moderate',
  traditionalDepth = true,
  className,
  showMetadata = true,
  showActions = false,
}: ZenBrutalistGalleryProps) {
  // White Space Centered Grid System
  const gridVariants = {
    zen: 'zen-brutalist-grid gap-zen-2xl',
    brutal: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-zen-xl p-zen-lg',
    'glass-ink': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-zen-lg p-zen-md',
    fusion: 'zen-brutalist-grid gap-zen-xl'
  }

  const containerClasses = {
    zen: 'zen-brutalist-layout py-zen-4xl',
    brutal: 'container-art py-zen-2xl',
    'glass-ink': 'max-w-7xl mx-auto py-zen-xl',
    fusion: 'zen-brutalist-layout py-zen-3xl'
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      <div className={gridVariants[variant]}>
        {artworks.map((artwork, index) => (
          <ZenBrutalistArtworkCard
            key={artwork.id}
            artwork={artwork}
            variant={variant}
            immersionLevel={immersionLevel}
            traditionalDepth={traditionalDepth}
            showMetadata={showMetadata}
            showActions={showActions}
            priority={index < 4} // 첫 4개 이미지는 우선 로딩
          />
        ))}
      </div>
    </div>
  )
}

// Loading Skeleton for Zen Brutalist Cards
export function ZenBrutalistArtworkCardSkeleton({
  variant = 'zen',
}: {
  variant?: 'zen' | 'brutal' | 'glass-ink' | 'fusion'
}) {
  const skeletonVariants = {
    zen: 'ink-glass-primary rounded-lg p-zen-lg',
    brutal: 'bg-paper brutal-border brutal-shadow p-zen-md',
    'glass-ink': 'ink-glass-elevated rounded-xl p-zen-md',
    fusion: 'ink-glass-primary brutal-border rounded-lg p-zen-lg'
  }

  const imageAspectRatio = {
    zen: 'aspect-[4/5]',
    brutal: 'aspect-[3/4]',
    'glass-ink': 'aspect-[1/1]',
    fusion: 'aspect-[5/7]'
  }

  return (
    <Card className={skeletonVariants[variant]}>
      <CardContent className="p-0">
        <div
          className={cn(
            'bg-stone-light animate-pulse',
            imageAspectRatio[variant],
            variant === 'brutal' ? 'brutal-border border-b-0' : 'rounded-t-lg'
          )}
        />

        <div className="p-zen-md space-y-zen-sm">
          <div className="h-8 bg-stone-light animate-pulse rounded" />
          <div className="h-5 bg-stone-light animate-pulse rounded w-3/4" />
          <div className="h-4 bg-stone-light animate-pulse rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}