'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { useThrottle } from '@/lib/hooks/use-throttled-handlers'
import { cn } from '@/lib/utils'
import type { Artwork } from '@/lib/types'
import Image from 'next/image'

interface BMADGallerySystemProps {
  artworks: Artwork[]
  variant?: 'zen' | 'brutal' | 'immersive' | 'cultural' | 'narrative'
  layout?: 'masonry' | 'grid' | 'timeline' | 'story' | 'adaptive'
  culturalContext?: 'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'
  enableBenchmarkFeatures?: boolean
  className?: string
}

interface GalleryMetrics {
  loadTime: number
  interactionRate: number
  viewportUtilization: number
  culturalEngagement: number
  performanceScore: number
}

export function BMADGallerySystem({
  artworks,
  variant = 'immersive',
  layout = 'adaptive',
  culturalContext = 'eternal',
  enableBenchmarkFeatures = true,
  className
}: BMADGallerySystemProps) {
  const [metrics, setMetrics] = useState<GalleryMetrics>({
    loadTime: 0,
    interactionRate: 0,
    viewportUtilization: 0,
    culturalEngagement: 0,
    performanceScore: 0
  })

  const [viewState, setViewState] = useState({
    currentFilter: 'all',
    sortBy: 'year',
    viewMode: layout,
    selectedArtwork: null as string | null,
    narrativeMode: false
  })

  const galleryRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(galleryRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  // 🎯 BMAD Pattern: Measure - Performance Tracking
  useEffect(() => {
    const startTime = performance.now()
    
    const observer = new IntersectionObserver((entries) => {
      const visibleCount = entries.filter(entry => entry.isIntersecting).length
      const utilizationRate = visibleCount / entries.length
      
      setMetrics(prev => ({
        ...prev,
        viewportUtilization: utilizationRate,
        performanceScore: (utilizationRate * 0.4 + prev.interactionRate * 0.6) * 100
      }))
    })

    const artworkElements = document.querySelectorAll('[data-artwork-card]')
    artworkElements.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      const endTime = performance.now()
      setMetrics(prev => ({ ...prev, loadTime: endTime - startTime }))
    }
  }, [artworks])

  // 🎯 SuperClaude Pattern: Intelligent Filtering & Sorting
  const processedArtworks = useMemo(() => {
    let filtered = artworks

    // Cultural Context Filtering (Benchmark: 권소영 시간순 구성)
    if (culturalContext !== 'eternal') {
      // Map seasons to years for thematic grouping
      const seasonYearMap = {
        spring: [2024, 2023],
        summer: [2022, 2021],
        autumn: [2020, 2019],
        winter: [2018, 2017]
      }
      const relevantYears = seasonYearMap[culturalContext] || []
      filtered = filtered.filter(artwork => relevantYears.includes(artwork.year))
    }

    // Advanced Sorting (BMAD Analyze Pattern)
    const sortFunctions = {
      year: (a: Artwork, b: Artwork) => b.year - a.year,
      title: (a: Artwork, b: Artwork) => a.title.localeCompare(b.title, 'ko'),
      narrative: (a: Artwork, b: Artwork) => {
        // Sort by cultural narrative significance
        const significanceScore = (artwork: Artwork) => {
          let score = 0
          if (artwork.featured) score += 10
          if (artwork.category === 'recent') score += 5
          if (artwork.medium.includes('color')) score += 3
          return score
        }
        return significanceScore(b) - significanceScore(a)
      },
      engagement: (a: Artwork, b: Artwork) => {
        // Sort by potential engagement (benchmark insight)
        const engagementScore = (artwork: Artwork) => {
          let score = 0
          if (artwork.aspectRatio === '1/1') score += 2 // Square format more engaging
          if (artwork.title.length < 10) score += 1 // Shorter titles more memorable
          if (artwork.year >= 2022) score += 3 // Recent works more relevant
          return score
        }
        return engagementScore(b) - engagementScore(a)
      }
    }

    return filtered.sort(sortFunctions[viewState.sortBy as keyof typeof sortFunctions] || sortFunctions.year)
  }, [artworks, viewState.sortBy, culturalContext])

  // 🎯 BMAD Pattern: Build - Dynamic Layout Calculation
  const layoutConfig = useMemo(() => {
    const configs = {
      masonry: {
        gridClasses: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-zen-md',
        itemClasses: 'break-inside-avoid mb-zen-md',
        animation: { staggerChildren: 0.1 }
      },
      grid: {
        gridClasses: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-zen-md',
        itemClasses: 'aspect-square',
        animation: { staggerChildren: 0.15 }
      },
      timeline: {
        gridClasses: 'flex flex-col space-y-zen-xl',
        itemClasses: 'flex items-center space-x-zen-lg even:flex-row-reverse',
        animation: { staggerChildren: 0.2 }
      },
      story: {
        gridClasses: 'grid grid-cols-1 lg:grid-cols-2 gap-zen-xl',
        itemClasses: 'story-card cultural-composition',
        animation: { staggerChildren: 0.25 }
      },
      adaptive: {
        gridClasses: cn(
          'grid gap-zen-md',
          processedArtworks.length <= 6 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        ),
        itemClasses: 'adaptive-card',
        animation: { staggerChildren: 0.12 }
      }
    }
    
    return configs[layout] || configs.adaptive
  }, [layout, processedArtworks.length])

  // 🎨 Cultural Context Animation Variants
  const culturalVariants = {
    spring: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -10, scale: 0.98 },
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    summer: {
      initial: { opacity: 0, rotateY: -15 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: 15 },
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    },
    autumn: {
      initial: { opacity: 0, scale: 1.1, filter: 'blur(4px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 0.9, filter: 'blur(2px)' },
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
    },
    winter: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 30 },
      transition: { type: 'tween', duration: 0.8, ease: 'easeOut' }
    },
    eternal: {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -15 },
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  }

  const currentVariant = culturalVariants[culturalContext]

  // 🎯 SuperClaude Pattern: Intelligent Interaction Tracking
  const handleArtworkInteraction = useCallback((artworkId: string, interactionType: 'view' | 'hover' | 'click') => {
    setMetrics(prev => ({
      ...prev,
      interactionRate: prev.interactionRate + 0.1,
      culturalEngagement: interactionType === 'click' ? prev.culturalEngagement + 1 : prev.culturalEngagement
    }))

    if (interactionType === 'click') {
      setViewState(prev => ({ ...prev, selectedArtwork: artworkId }))
    }
  }, [])

  // 🎯 BMAD Pattern: Decide - Adaptive Layout Switching
  const handleLayoutOptimization = useCallback(() => {
    const currentScore = metrics.performanceScore
    
    if (currentScore < 60 && layout === 'masonry') {
      setViewState(prev => ({ ...prev, viewMode: 'grid' }))
    } else if (currentScore > 80 && layout === 'grid') {
      setViewState(prev => ({ ...prev, viewMode: 'masonry' }))
    }
  }, [metrics.performanceScore, layout])

  useEffect(() => {
    if (enableBenchmarkFeatures) {
      handleLayoutOptimization()
    }
  }, [handleLayoutOptimization, enableBenchmarkFeatures])

  // Animation trigger
  useEffect(() => {
    if (isInView) {
      controls.start('animate')
    }
  }, [isInView, controls])

  return (
    <div
      ref={galleryRef}
      className={cn(
        'bmad-gallery-system aceternity-section',
        'bg-background text-foreground',
        `variant-${variant}`,
        `layout-${layout}`,
        `cultural-${culturalContext}`,
        culturalContext && `aceternity-cultural-${culturalContext}`,
        enableBenchmarkFeatures && 'benchmark-optimized',
        className
      )}
    >
      {/* 🎯 BMAD Control Panel (Benchmark Feature) */}
      {enableBenchmarkFeatures && (
        <motion.div
          className="aceternity-card aceternity-card-elevated mb-8 p-6 shadow-aceternity-lg border-2 border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-zen-sm items-center justify-between">
            <div className="flex gap-zen-sm">
              <select
                value={viewState.sortBy}
                onChange={(e) => setViewState(prev => ({ ...prev, sortBy: e.target.value }))}
                className="aceternity-input px-3 py-2 text-sm shadow-aceternity-sm"
              >
                <option value="year">연도순</option>
                <option value="title">제목순</option>
                <option value="narrative">내러티브</option>
                <option value="engagement">참여도</option>
              </select>
              
              <select
                value={viewState.viewMode}
                onChange={(e) => setViewState(prev => ({ ...prev, viewMode: e.target.value as any }))}
                className="aceternity-input px-3 py-2 text-sm shadow-aceternity-sm"
              >
                <option value="adaptive">적응형</option>
                <option value="grid">그리드</option>
                <option value="masonry">벽돌형</option>
                <option value="timeline">타임라인</option>
                <option value="story">스토리</option>
              </select>
            </div>
            
            <div className="aceternity-caption text-muted-foreground space-x-4">
              <span>성능: {metrics.performanceScore.toFixed(0)}%</span>
              <span>참여: {metrics.culturalEngagement}</span>
              <span>작품: {processedArtworks.length}개</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🎨 Main Gallery Grid */}
      <motion.div
        className={layoutConfig.gridClasses}
        variants={{
          animate: {
            transition: layoutConfig.animation
          }
        }}
        initial="initial"
        animate={controls}
      >
        <AnimatePresence mode="popLayout">
          {processedArtworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              data-artwork-card
              className={cn(
                layoutConfig.itemClasses,
                'cursor-pointer group',
                'zen-brutalist-artwork-card',
                'gallery-card-transform'
              )}
              variants={currentVariant}
              layout
              onHoverStart={() => handleArtworkInteraction(artwork.id, 'hover')}
              onClick={() => handleArtworkInteraction(artwork.id, 'click')}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative overflow-hidden rounded-lg bg-paper">
                {/* Artwork Image */}
                <div className="relative aspect-square">
                  <Image
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading={index < 8 ? 'eager' : 'lazy'}
                  />
                  
                  {/* Cultural Overlay */}
                  <div className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    'bg-gradient-to-t from-ink/20 via-transparent to-transparent'
                  )} />
                </div>

                {/* Artwork Info */}
                <div className="p-zen-sm">
                  <h3 className="font-display text-lg text-ink line-clamp-1 group-hover:text-gold transition-colors">
                    {artwork.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-sm text-ink-light">
                    <span>{artwork.year}</span>
                    <span className="text-xs">{artwork.medium}</span>
                  </div>
                  
                  {/* Benchmark Feature: Cultural Context Badge */}
                  {enableBenchmarkFeatures && artwork.featured && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                        주요 작품
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 🎯 Performance Metrics (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-zen-lg p-4 bg-ink/5 rounded text-xs font-mono">
          <h4 className="font-bold mb-2">BMAD Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>Load Time: {metrics.loadTime.toFixed(0)}ms</div>
            <div>Interaction Rate: {(metrics.interactionRate * 100).toFixed(1)}%</div>
            <div>Viewport Util: {(metrics.viewportUtilization * 100).toFixed(1)}%</div>
            <div>Cultural Engagement: {metrics.culturalEngagement}</div>
            <div>Performance Score: {metrics.performanceScore.toFixed(1)}</div>
            <div>Layout: {layout}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BMADGallerySystem