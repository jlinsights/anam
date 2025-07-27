'use client'

import { GalleryGridImage } from '@/components/optimized-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, Eye, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'

interface ImmersiveArtworkCardProps {
  artwork: Artwork
  variant?: 'zen-immersive' | 'brutal-glass' | 'ink-flow' | 'depth-fusion'
  intensity?: 'subtle' | 'moderate' | 'intense' | 'maximum'
  culturalDepth?: boolean
  className?: string
  showMetadata?: boolean
  showActions?: boolean
  priority?: boolean
}

export function ImmersiveArtworkCard({
  artwork,
  variant = 'zen-immersive',
  intensity = 'moderate',
  culturalDepth = true,
  className,
  showMetadata = true,
  showActions = false,
  priority = false,
}: ImmersiveArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Advanced mouse tracking for immersive effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setMousePosition({ x, y })
  }, [])

  // Enhanced Card Variants with Phase 2 Effects
  const cardVariants = {
    'zen-immersive': {
      subtle: 'glass-depth-container ink-glass-primary rounded-xl p-zen-md zen-breathe-deep',
      moderate: 'glass-depth-container ink-glass-elevated rounded-xl p-zen-lg immersive-hover fluid-ink-transition',
      intense: 'glass-depth-container ink-glass-immersive rounded-2xl p-zen-xl immersive-hover fluid-ink-transition ink-flow-ambient',
      maximum: 'glass-depth-container ink-glass-immersive rounded-2xl p-zen-2xl immersive-hover fluid-ink-transition ink-flow-ambient depth-layer-shift'
    },
    'brutal-glass': {
      subtle: 'bg-paper brutal-border glass-layer-1 p-zen-md ink-ripple-effect',
      moderate: 'glass-layer-2 brutal-border brutal-shadow p-zen-lg immersive-hover ink-ripple-effect transform hover:rotate-1',
      intense: 'glass-layer-3 brutal-border brutal-shadow-strong p-zen-xl immersive-hover ink-ripple-effect transform hover:rotate-2 hover:scale-105',
      maximum: 'glass-depth-container glass-layer-3 brutal-border brutal-shadow-strong p-zen-2xl immersive-hover fluid-ink-transition transform hover:rotate-2 hover:scale-110 depth-layer-shift'
    },
    'ink-flow': {
      subtle: 'ink-glass-primary rounded-lg p-zen-md ink-flow-ambient',
      moderate: 'ink-glass-elevated rounded-xl p-zen-lg fluid-ink-transition ink-brush-flow',
      intense: 'ink-glass-immersive rounded-xl p-zen-xl fluid-ink-transition ink-flow-ambient immersive-hover',
      maximum: 'glass-depth-container ink-glass-immersive rounded-2xl p-zen-2xl fluid-ink-transition ink-flow-ambient immersive-hover zen-breathe-deep'
    },
    'depth-fusion': {
      subtle: 'glass-layer-1 rounded-lg p-zen-md zen-breathe-deep',
      moderate: 'glass-depth-container glass-layer-2 rounded-xl p-zen-lg immersive-hover',
      intense: 'glass-depth-container glass-layer-3 rounded-xl p-zen-xl immersive-hover fluid-ink-transition',
      maximum: 'glass-depth-container glass-layer-3 rounded-2xl p-zen-2xl immersive-hover fluid-ink-transition ink-flow-ambient depth-layer-shift'
    }
  }

  const imageVariants = {
    'zen-immersive': 'aspect-[4/5] rounded-lg overflow-hidden',
    'brutal-glass': 'aspect-[3/4] rounded-none overflow-hidden brutal-border border-b-0',
    'ink-flow': 'aspect-[1/1] rounded-lg overflow-hidden',
    'depth-fusion': 'aspect-[5/7] rounded-xl overflow-hidden'
  }

  const typographyVariants = {
    'zen-immersive': {
      title: 'zen-typography-section text-ink font-light',
      meta: 'zen-typography-body text-ink-light',
      details: 'zen-typography-body text-ink-lighter'
    },
    'brutal-glass': {
      title: 'brutal-typography-accent text-ink font-black',
      meta: 'brutal-typography-accent text-ink-dark text-sm',
      details: 'font-bold text-ink-lighter text-xs uppercase tracking-wider'
    },
    'ink-flow': {
      title: 'zen-typography-hero text-ink font-medium',
      meta: 'zen-typography-body text-ink-light',
      details: 'zen-typography-body text-ink-lighter'
    },
    'depth-fusion': {
      title: 'zen-typography-section text-ink font-medium',
      meta: 'brutal-typography-accent text-ink-light text-sm',
      details: 'zen-typography-body text-ink-lighter'
    }
  }

  // Cultural depth implementation
  const culturalLayer = culturalDepth ? (
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1500 pointer-events-none"
      style={{
        background: `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          hsla(var(--ink) / 0.1) 0%,
          hsla(var(--ink-light) / 0.05) 40%,
          transparent 70%
        )`
      }}
    />
  ) : null

  return (
    <div 
      ref={cardRef}
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <Card
        className={cn(
          cardVariants[variant][intensity],
          'relative overflow-hidden cursor-pointer will-change-transform',
          'before:absolute before:inset-0 before:z-0 before:pointer-events-none'
        )}
      >
        {culturalLayer}
        
        <CardContent className="relative z-10 p-0">
          <Link href={`/gallery/${artwork.slug}`} className="block">
            {/* Enhanced Image Container with Advanced Effects */}
            <div className={cn(
              'relative',
              imageVariants[variant],
              'group-hover:transform-gpu will-change-transform'
            )}>
              <GalleryGridImage
                artwork={artwork}
                className={cn(
                  'w-full h-full object-cover transition-all duration-700',
                  isHovered && variant === 'zen-immersive' && 'scale-105 filter brightness-110',
                  isHovered && variant === 'brutal-glass' && 'scale-110 rotate-1 filter contrast-110',
                  isHovered && variant === 'ink-flow' && 'scale-105 filter saturate-150',
                  isHovered && variant === 'depth-fusion' && 'scale-105 filter brightness-105 saturate-120'
                )}
                priority={priority}
              />
              
              {/* Multi-Layer Depth Overlay */}
              {intensity === 'maximum' && (
                <>
                  <div className="absolute inset-0 glass-layer-1 opacity-0 group-hover:opacity-60 transition-opacity duration-1000" />
                  <div className="absolute inset-2 glass-layer-2 opacity-0 group-hover:opacity-80 transition-opacity duration-1200" />
                  <div className="absolute inset-4 glass-layer-3 opacity-0 group-hover:opacity-100 transition-opacity duration-1500" />
                </>
              )}

              {/* Advanced Ink Flow Overlay */}
              {variant === 'ink-flow' && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-2000"
                  style={{
                    background: `conic-gradient(
                      from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
                      hsla(var(--ink) / 0.2) 0deg,
                      hsla(var(--ink-light) / 0.1) 120deg,
                      transparent 240deg,
                      hsla(var(--ink) / 0.15) 360deg
                    )`
                  }}
                />
              )}
            </div>

            {/* Enhanced Content Area */}
            {showMetadata && (
              <div className={cn(
                'relative z-20 p-zen-md space-y-zen-sm',
                variant === 'brutal-glass' && 'brutal-border border-t-0'
              )}>
                {/* Dynamic Title with Enhanced Typography */}
                <h3 className={cn(
                  typographyVariants[variant].title,
                  'line-clamp-2 group-hover:text-gold transition-all duration-500',
                  isHovered && 'transform translate-y-[-2px]'
                )}>
                  {artwork.title}
                </h3>

                {/* Advanced Metadata Display */}
                <div className={cn(
                  'flex items-center justify-between',
                  typographyVariants[variant].meta,
                  'group-hover:transform group-hover:translate-x-1 transition-transform duration-500'
                )}>
                  <div className="flex items-center gap-zen-xs">
                    <Calendar className="w-4 h-4 group-hover:text-gold transition-colors duration-300" />
                    <span>{artwork.year}</span>
                  </div>

                  {artwork.featured && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'text-xs transition-all duration-300',
                        variant === 'brutal-glass' && 'brutal-border bg-gold text-ink font-black uppercase',
                        'group-hover:scale-110 group-hover:shadow-lg'
                      )}
                    >
                      대표작
                    </Badge>
                  )}
                </div>

                {/* Medium/Dimensions with Cultural Context */}
                {intensity !== 'subtle' && (
                  <div className={cn(
                    typographyVariants[variant].details,
                    'space-y-zen-xs group-hover:opacity-100 transition-opacity duration-700',
                    !isHovered && 'opacity-70'
                  )}>
                    {artwork.medium && (
                      <p className="line-clamp-1 group-hover:transform group-hover:translate-x-1 transition-transform duration-500">
                        {artwork.medium}
                      </p>
                    )}
                    {artwork.dimensions && (
                      <p className="line-clamp-1 group-hover:transform group-hover:translate-x-2 transition-transform duration-700">
                        {artwork.dimensions}
                      </p>
                    )}
                  </div>
                )}

                {/* Immersive Action Buttons */}
                {showActions && (
                  <div className={cn(
                    'flex items-center justify-between mt-zen-md pt-zen-sm border-t border-stone-light',
                    'group-hover:border-gold/30 transition-colors duration-500'
                  )}>
                    <div className="flex items-center gap-zen-sm">
                      <button className={cn(
                        'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-all duration-300 focus-art',
                        'hover:scale-110 hover:translate-y-[-1px]',
                        typographyVariants[variant].details
                      )}>
                        <Heart className="w-4 h-4" />
                        <span>좋아요</span>
                      </button>
                      <button className={cn(
                        'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-all duration-300 focus-art',
                        'hover:scale-110 hover:translate-y-[-1px]',
                        typographyVariants[variant].details
                      )}>
                        <Share2 className="w-4 h-4" />
                        <span>공유</span>
                      </button>
                    </div>
                    <button className={cn(
                      'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-all duration-300 focus-art',
                      'hover:scale-110 hover:translate-y-[-1px]',
                      typographyVariants[variant].details
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

// Immersive Gallery Grid with Advanced Layout
interface ImmersiveGalleryProps {
  artworks: Artwork[]
  variant?: 'zen-immersive' | 'brutal-glass' | 'ink-flow' | 'depth-fusion'
  intensity?: 'subtle' | 'moderate' | 'intense' | 'maximum'
  culturalDepth?: boolean
  layout?: 'flowing' | 'structured' | 'organic' | 'asymmetric'
  className?: string
  showMetadata?: boolean
  showActions?: boolean
}

export function ImmersiveGallery({
  artworks,
  variant = 'zen-immersive',
  intensity = 'moderate',
  culturalDepth = true,
  layout = 'flowing',
  className,
  showMetadata = true,
  showActions = false,
}: ImmersiveGalleryProps) {
  const layoutVariants = {
    flowing: 'zen-brutalist-grid gap-zen-xl',
    structured: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-zen-lg',
    organic: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-zen-lg',
    asymmetric: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-zen-md'
  }

  const containerVariants = {
    'zen-immersive': 'zen-brutalist-layout py-zen-4xl bg-gradient-zen',
    'brutal-glass': 'container-art py-zen-3xl bg-paper',
    'ink-flow': 'max-w-7xl mx-auto py-zen-3xl bg-gradient-paper',
    'depth-fusion': 'zen-brutalist-layout py-zen-4xl bg-gradient-ink'
  }

  return (
    <div className={cn(containerVariants[variant], className)}>
      <div className={cn(layoutVariants[layout], 'relative')}>
        {/* Background ambient effects */}
        {intensity === 'maximum' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="ink-flow-ambient opacity-20" />
            <div className="zen-breathe-deep opacity-10" />
          </div>
        )}
        
        {artworks.map((artwork, index) => (
          <ImmersiveArtworkCard
            key={artwork.id}
            artwork={artwork}
            variant={variant}
            intensity={intensity}
            culturalDepth={culturalDepth}
            showMetadata={showMetadata}
            showActions={showActions}
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  )
}

// Enhanced Loading Skeleton
export function ImmersiveArtworkCardSkeleton({
  variant = 'zen-immersive',
  intensity = 'moderate'
}: {
  variant?: 'zen-immersive' | 'brutal-glass' | 'ink-flow' | 'depth-fusion'
  intensity?: 'subtle' | 'moderate' | 'intense' | 'maximum'
}) {
  const skeletonVariants = {
    'zen-immersive': 'ink-glass-primary rounded-xl p-zen-lg zen-breathe-deep',
    'brutal-glass': 'bg-paper brutal-border brutal-shadow p-zen-md',
    'ink-flow': 'ink-glass-elevated rounded-xl p-zen-md ink-flow-ambient',
    'depth-fusion': 'glass-layer-2 rounded-lg p-zen-lg'
  }

  const imageAspectRatio = {
    'zen-immersive': 'aspect-[4/5]',
    'brutal-glass': 'aspect-[3/4]',
    'ink-flow': 'aspect-[1/1]',
    'depth-fusion': 'aspect-[5/7]'
  }

  return (
    <Card className={cn(skeletonVariants[variant], 'overflow-hidden')}>
      <CardContent className="p-0">
        <div
          className={cn(
            'bg-stone-light animate-pulse',
            imageAspectRatio[variant],
            variant === 'brutal-glass' ? 'brutal-border border-b-0' : 'rounded-t-lg'
          )}
        />
        
        <div className="p-zen-md space-y-zen-sm">
          <div className="h-8 bg-stone-light animate-pulse rounded" />
          <div className="h-5 bg-stone-light animate-pulse rounded w-3/4" />
          {intensity !== 'subtle' && (
            <div className="h-4 bg-stone-light animate-pulse rounded w-1/2" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}