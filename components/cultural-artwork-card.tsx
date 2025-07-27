'use client'

import { GalleryGridImage } from '@/components/optimized-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, Eye, Heart, Share2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'

interface CulturalArtworkCardProps {
  artwork: Artwork
  variant?: 'traditional' | 'seasonal' | 'balanced' | 'immersive'
  composition?: 'thirds' | 'golden' | 'flowing' | 'centered'
  culturalSeason?: 'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'
  depthLayer?: 'foreground' | 'middle' | 'background' | 'cultural' | 'temporal'
  enableStroke?: boolean
  enableVoidBreathing?: boolean
  className?: string
  showMetadata?: boolean
  showActions?: boolean
  priority?: boolean
}

export function CulturalArtworkCard({
  artwork,
  variant = 'traditional',
  composition = 'thirds',
  culturalSeason = 'eternal',
  depthLayer = 'middle',
  enableStroke = true,
  enableVoidBreathing = false,
  className,
  showMetadata = true,
  showActions = false,
  priority = false,
}: CulturalArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeStroke, setActiveStroke] = useState<'press' | 'horizontal' | 'vertical' | 'curve' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Advanced cultural mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setMousePosition({ x, y })

    // Trigger stroke animations based on mouse position
    if (enableStroke) {
      if (x < 0.3 && y < 0.3) {
        setActiveStroke('press')
      } else if (x > 0.7 && y < 0.5) {
        setActiveStroke('horizontal')
      } else if (x < 0.5 && y > 0.7) {
        setActiveStroke('vertical')
      } else if (x > 0.5 && y > 0.5) {
        setActiveStroke('curve')
      } else {
        setActiveStroke(null)
      }
    }
  }, [enableStroke])

  // Traditional Korean composition variants
  const compositionVariants = {
    thirds: 'composition-thirds',
    golden: 'composition-golden',
    flowing: 'grid grid-cols-1 gap-void-breathing',
    centered: 'flex flex-col items-center justify-center'
  }

  // Enhanced Card Variants with Cultural Integration
  const cardVariants = {
    traditional: {
      base: 'cultural-context temporal-depth ink-glass-primary rounded-xl void-breathing traditional-composition',
      hover: 'immersive-hover cultural-depth-shift'
    },
    seasonal: {
      base: `cultural-immersion rounded-2xl void-contemplative seasonal-shift ${culturalSeason !== 'eternal' ? `season-${culturalSeason}` : ''}`,
      hover: 'yin-yang-balance cultural-layer-flow'
    },
    balanced: {
      base: 'yin-element glass-depth-container glass-layer-2 rounded-xl void-infinite',
      hover: 'yang-element immersive-hover depth-layer-shift'
    },
    immersive: {
      base: 'cultural-immersion glass-depth-container glass-layer-3 rounded-2xl void-cosmic',
      hover: 'cultural-layer-flow seasonal-shift immersive-hover'
    }
  }

  const depthLayerClasses = {
    foreground: 'depth-foreground',
    middle: 'depth-middle', 
    background: 'depth-background',
    cultural: 'depth-cultural',
    temporal: 'depth-temporal'
  }

  const imageVariants = {
    traditional: 'aspect-[4/5] rounded-lg overflow-hidden',
    seasonal: 'aspect-[3/4] rounded-xl overflow-hidden',
    balanced: 'aspect-[1/1] rounded-lg overflow-hidden',
    immersive: 'aspect-[5/7] rounded-2xl overflow-hidden'
  }

  const typographyVariants = {
    traditional: {
      title: 'zen-typography-section text-ink font-light',
      meta: 'zen-typography-body text-ink-light',
      details: 'zen-typography-body text-ink-lighter'
    },
    seasonal: {
      title: 'zen-typography-hero text-ink font-medium stroke-horizontal',
      meta: 'brutal-typography-accent text-ink-dark text-sm',
      details: 'zen-typography-body text-ink-lighter stroke-vertical'
    },
    balanced: {
      title: 'zen-typography-section text-ink font-normal stroke-curve',
      meta: 'zen-typography-body text-ink-light',
      details: 'zen-typography-body text-ink-lighter'
    },
    immersive: {
      title: 'zen-typography-hero text-ink font-medium stroke-press',
      meta: 'brutal-typography-accent text-ink-light text-sm',
      details: 'zen-typography-body text-ink-lighter'
    }
  }

  // Traditional cultural depth implementation with yin-yang principles
  const culturalDepthLayer = (
    <div 
      className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-3000 pointer-events-none',
        depthLayerClasses[depthLayer]
      )}
      style={{
        background: `
          radial-gradient(
            circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            hsla(var(--ink) / 0.12) 0%,
            hsla(var(--gold) / 0.06) 30%,
            hsla(var(--brush) / 0.04) 60%,
            transparent 80%
          ),
          conic-gradient(
            from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
            hsla(var(--season-spring) / 0.05) 0deg,
            hsla(var(--season-summer) / 0.08) 90deg,
            hsla(var(--season-autumn) / 0.1) 180deg,
            hsla(var(--season-winter) / 0.06) 270deg,
            hsla(var(--season-spring) / 0.05) 360deg
          )`
      }}
    />
  )

  // Stroke animation overlay
  const strokeAnimationLayer = enableStroke && activeStroke && (
    <div 
      className={cn(
        'absolute inset-0 pointer-events-none transition-opacity duration-500',
        `stroke-${activeStroke}`,
        'opacity-70'
      )}
      style={{
        background: `
          linear-gradient(
            ${activeStroke === 'horizontal' ? '90deg' : 
              activeStroke === 'vertical' ? '0deg' : 
              activeStroke === 'curve' ? '45deg' : '180deg'},
            hsla(var(--ink) / 0.2) 0%,
            hsla(var(--ink-light) / 0.1) 50%,
            transparent 100%
          )`
      }}
    />
  )

  return (
    <div 
      ref={cardRef}
      className={cn(
        'group relative',
        compositionVariants[composition],
        enableVoidBreathing && 'void-breathing-animation',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setActiveStroke(null)
      }}
      onMouseMove={handleMouseMove}
    >
      <Card
        className={cn(
          cardVariants[variant].base,
          cardVariants[variant].hover,
          'relative overflow-hidden cursor-pointer will-change-transform',
          'before:absolute before:inset-0 before:z-0 before:pointer-events-none'
        )}
      >
        {culturalDepthLayer}
        {strokeAnimationLayer}
        
        <CardContent className={cn(
          'relative z-10 p-0',
          composition === 'thirds' && 'thirds-center',
          composition === 'golden' && 'place-self-center'
        )}>
          <Link href={`/gallery/${artwork.slug}`} className="block">
            {/* Enhanced Image Container with Traditional Composition */}
            <div className={cn(
              'relative',
              imageVariants[variant],
              'group-hover:transform-gpu will-change-transform',
              composition === 'thirds' && 'thirds-center',
              depthLayerClasses[depthLayer]
            )}>
              <GalleryGridImage
                artwork={artwork}
                className={cn(
                  'w-full h-full object-cover transition-all duration-1000',
                  isHovered && variant === 'traditional' && 'scale-105 filter brightness-105 sepia(0.1)',
                  isHovered && variant === 'seasonal' && `scale-110 filter saturate-150 ${culturalSeason !== 'eternal' ? `season-${culturalSeason}` : ''}`,
                  isHovered && variant === 'balanced' && 'scale-105 filter brightness-110 contrast-110',
                  isHovered && variant === 'immersive' && 'scale-105 filter brightness-105 saturate-120 hue-rotate-2'
                )}
                priority={priority}
              />
              
              {/* Traditional Composition Overlay */}
              {composition === 'thirds' && (
                <div className="absolute inset-0 composition-thirds opacity-0 group-hover:opacity-20 transition-opacity duration-2000 pointer-events-none">
                  <div className="thirds-top-left w-2 h-2 bg-gold rounded-full" />
                  <div className="thirds-top-right w-2 h-2 bg-gold rounded-full" />
                  <div className="thirds-bottom-left w-2 h-2 bg-gold rounded-full" />
                  <div className="thirds-bottom-right w-2 h-2 bg-gold rounded-full" />
                </div>
              )}

              {/* Seasonal cultural overlay */}
              {culturalSeason !== 'eternal' && (
                <div 
                  className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-2000',
                    `season-${culturalSeason}`,
                    'seasonal-shift'
                  )}
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        hsla(var(--season-${culturalSeason}) / 0.1) 0%,
                        transparent 60%
                      )`
                  }}
                />
              )}

              {/* Yin-Yang Balance Indicator */}
              {variant === 'balanced' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-r from-ink to-paper opacity-0 group-hover:opacity-60 transition-opacity duration-1000 yin-yang-balance" />
              )}
            </div>

            {/* Enhanced Content Area with Cultural Typography */}
            {showMetadata && (
              <div className={cn(
                'relative z-20 void-breathing space-y-zen-sm',
                variant === 'seasonal' && 'brutal-border border-t-0',
                composition === 'thirds' && 'thirds-bottom-center'
              )}>
                {/* Dynamic Title with Enhanced Cultural Typography */}
                <h3 className={cn(
                  typographyVariants[variant].title,
                  'line-clamp-2 group-hover:text-gold transition-all duration-1000',
                  isHovered && 'transform translate-y-[-2px]',
                  enableStroke && activeStroke && `stroke-${activeStroke}`
                )}>
                  {artwork.title}
                </h3>

                {/* Cultural Metadata Display */}
                <div className={cn(
                  'flex items-center justify-between',
                  typographyVariants[variant].meta,
                  'group-hover:transform group-hover:translate-x-1 transition-transform duration-1000'
                )}>
                  <div className="flex items-center gap-zen-xs">
                    <Calendar className="w-4 h-4 group-hover:text-gold transition-colors duration-500" />
                    <span>{artwork.year}</span>
                  </div>

                  <div className="flex items-center gap-zen-xs">
                    {culturalSeason !== 'eternal' && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs transition-all duration-500',
                          `season-${culturalSeason}`,
                          'group-hover:scale-110 group-hover:shadow-lg'
                        )}
                      >
                        {culturalSeason === 'spring' && '春'}
                        {culturalSeason === 'summer' && '夏'}
                        {culturalSeason === 'autumn' && '秋'}
                        {culturalSeason === 'winter' && '冬'}
                      </Badge>
                    )}
                    
                    {artwork.featured && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs transition-all duration-500',
                          variant === 'seasonal' && 'brutal-border bg-gold text-ink font-black uppercase',
                          'group-hover:scale-110 group-hover:shadow-lg'
                        )}
                      >
                        대표작
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Cultural Context Information */}
                <div className={cn(
                  typographyVariants[variant].details,
                  'space-y-zen-xs group-hover:opacity-100 transition-opacity duration-1000',
                  !isHovered && 'opacity-70'
                )}>
                  {artwork.medium && (
                    <p className="line-clamp-1 group-hover:transform group-hover:translate-x-1 transition-transform duration-700">
                      {artwork.medium}
                    </p>
                  )}
                  {artwork.dimensions && (
                    <p className="line-clamp-1 group-hover:transform group-hover:translate-x-2 transition-transform duration-1000">
                      {artwork.dimensions}
                    </p>
                  )}
                  
                  {/* Cultural depth indicator */}
                  <div className="flex items-center gap-zen-xs text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-1000">
                    <Sparkles className="w-3 h-3" />
                    <span>전통 {depthLayer} 층위</span>
                  </div>
                </div>

                {/* Cultural Action Buttons */}
                {showActions && (
                  <div className={cn(
                    'flex items-center justify-between mt-zen-md pt-zen-sm border-t border-stone-light',
                    'group-hover:border-gold/30 transition-colors duration-1000'
                  )}>
                    <div className="flex items-center gap-zen-sm">
                      <button className={cn(
                        'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-all duration-500 focus-art',
                        'hover:scale-110 hover:translate-y-[-1px]',
                        typographyVariants[variant].details,
                        enableStroke && 'stroke-press'
                      )}>
                        <Heart className="w-4 h-4" />
                        <span>감상</span>
                      </button>
                      <button className={cn(
                        'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-all duration-500 focus-art',
                        'hover:scale-110 hover:translate-y-[-1px]',
                        typographyVariants[variant].details,
                        enableStroke && 'stroke-horizontal'
                      )}>
                        <Share2 className="w-4 h-4" />
                        <span>공유</span>
                      </button>
                    </div>
                    <button className={cn(
                      'flex items-center gap-zen-xs text-ink-light hover:text-gold transition-all duration-500 focus-art',
                      'hover:scale-110 hover:translate-y-[-1px]',
                      typographyVariants[variant].details,
                      enableStroke && 'stroke-curve'
                    )}>
                      <Eye className="w-4 h-4" />
                      <span>깊이보기</span>
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

// Cultural Gallery Grid with Traditional Composition
interface CulturalGalleryProps {
  artworks: Artwork[]
  variant?: 'traditional' | 'seasonal' | 'balanced' | 'immersive'
  composition?: 'thirds' | 'golden' | 'flowing' | 'centered'
  culturalSeason?: 'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'
  enableStroke?: boolean
  enableVoidBreathing?: boolean
  className?: string
  showMetadata?: boolean
  showActions?: boolean
}

export function CulturalGallery({
  artworks,
  variant = 'traditional',
  composition = 'thirds',
  culturalSeason = 'eternal',
  enableStroke = true,
  enableVoidBreathing = false,
  className,
  showMetadata = true,
  showActions = false,
}: CulturalGalleryProps) {
  const layoutVariants = {
    thirds: 'composition-thirds gap-void-infinite',
    golden: 'composition-golden gap-void-contemplative',
    flowing: 'columns-1 md:columns-2 lg:columns-3 gap-void-breathing',
    centered: 'flex flex-wrap justify-center gap-void-breathing'
  }

  const containerVariants = {
    traditional: 'cultural-context temporal-depth zen-brutalist-layout py-zen-4xl',
    seasonal: 'cultural-immersion seasonal-shift max-w-7xl mx-auto py-zen-3xl',
    balanced: 'yin-yang-balance container-art py-zen-3xl bg-gradient-zen',
    immersive: 'cultural-layer-flow zen-brutalist-layout py-zen-4xl bg-gradient-ink'
  }

  return (
    <div className={cn(containerVariants[variant], className)}>
      <div className={cn(layoutVariants[composition], 'relative')}>
        {/* Cultural ambient effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'cultural-layer-flow opacity-10',
            enableVoidBreathing && 'void-breathing-animation'
          )} />
          <div className="traditional-composition opacity-5" />
        </div>
        
        {artworks.map((artwork, index) => (
          <CulturalArtworkCard
            key={artwork.id}
            artwork={artwork}
            variant={variant}
            composition="flowing" // Individual cards use flowing layout within the grid
            culturalSeason={culturalSeason}
            depthLayer={index % 2 === 0 ? 'middle' : 'cultural'}
            enableStroke={enableStroke}
            enableVoidBreathing={enableVoidBreathing}
            showMetadata={showMetadata}
            showActions={showActions}
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  )
}

// Enhanced Loading Skeleton with Cultural Elements
export function CulturalArtworkCardSkeleton({
  variant = 'traditional',
  composition = 'thirds'
}: {
  variant?: 'traditional' | 'seasonal' | 'balanced' | 'immersive'
  composition?: 'thirds' | 'golden' | 'flowing' | 'centered'
}) {
  const skeletonVariants = {
    traditional: 'cultural-context ink-glass-primary rounded-xl void-breathing',
    seasonal: 'cultural-immersion rounded-2xl void-contemplative seasonal-shift',
    balanced: 'yin-element glass-layer-2 rounded-lg void-infinite',
    immersive: 'cultural-layer-flow glass-layer-3 rounded-2xl void-cosmic'
  }

  const imageAspectRatio = {
    traditional: 'aspect-[4/5]',
    seasonal: 'aspect-[3/4]',
    balanced: 'aspect-[1/1]',
    immersive: 'aspect-[5/7]'
  }

  return (
    <Card className={cn(skeletonVariants[variant], 'overflow-hidden')}>
      <CardContent className="p-0">
        <div
          className={cn(
            'bg-stone-light animate-pulse temporal-depth',
            imageAspectRatio[variant],
            'rounded-t-lg'
          )}
        />
        
        <div className="void-breathing space-y-zen-sm">
          <div className="h-8 bg-stone-light animate-pulse rounded stroke-horizontal" />
          <div className="h-5 bg-stone-light animate-pulse rounded w-3/4 stroke-vertical" />
          <div className="h-4 bg-stone-light animate-pulse rounded w-1/2 stroke-curve" />
        </div>
      </CardContent>
    </Card>
  )
}