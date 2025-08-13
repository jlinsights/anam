'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Artwork } from '@/lib/types'
import { SearchFilter } from './search-filter'
import { ThrottledInfiniteScroll, useThrottledInfiniteScrollState } from './throttled-infinite-scroll'
import { ThrottledResponsiveGrid, ThrottledResponsiveImage, useThrottledResponsive } from './throttled-responsive-component'
import { ThrottlePerformanceMonitor, useThrottlePerformanceTracking } from './throttle-performance-monitor'
import { useThrottledAnimation } from '@/lib/hooks/use-throttled-handlers'
import { THROTTLE_DELAYS } from '@/lib/utils/throttle'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Heart, Share2, ZoomIn } from 'lucide-react'
import Link from 'next/link'

interface OptimizedGalleryProps {
  initialArtworks?: Artwork[]
  fetchMoreArtworks?: (offset: number, limit: number) => Promise<Artwork[]>
  pageSize?: number
  showPerformanceMonitor?: boolean
  className?: string
}

/**
 * Optimized gallery component with comprehensive throttling
 * Implements all performance optimizations for smooth 60fps experience
 */
export function OptimizedGallery({
  initialArtworks = [],
  fetchMoreArtworks,
  pageSize = 20,
  showPerformanceMonitor = process.env.NODE_ENV === 'development',
  className = ''
}: OptimizedGalleryProps) {
  // Performance tracking
  const { trackRender, trackThrottle } = useThrottlePerformanceTracking('OptimizedGallery')
  
  // Responsive handling
  const { breakpoint, width } = useThrottledResponsive()
  
  // Gallery state
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(initialArtworks)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [hoveredArtwork, setHoveredArtwork] = useState<string | null>(null)

  // Infinite scroll state
  const {
    data: displayedArtworks,
    isLoading,
    hasMore,
    loadMore,
    reset
  } = useThrottledInfiniteScrollState(
    filteredArtworks.slice(0, pageSize),
    fetchMoreArtworks || (async (offset, limit) => {
      // Default implementation for client-side pagination
      const start = offset
      const end = offset + limit
      return filteredArtworks.slice(start, end)
    }),
    pageSize
  )

  // Track render performance
  React.useEffect(() => {
    const endTracking = trackRender()
    return endTracking
  })

  // Throttled hover handlers
  const throttledHoverStart = useThrottledAnimation(
    useCallback((artworkId: string) => {
      trackThrottle('hover', false)
      setHoveredArtwork(artworkId)
    }, [trackThrottle]),
    []
  )

  const throttledHoverEnd = useThrottledAnimation(
    useCallback(() => {
      trackThrottle('hover', false)
      setHoveredArtwork(null)
    }, [trackThrottle]),
    []
  )

  // Handle filtered results from search component
  const handleFilteredResults = useCallback((results: Artwork[]) => {
    setFilteredArtworks(results)
    reset() // Reset infinite scroll when filters change
  }, [reset])

  // Handle artwork selection
  const handleArtworkClick = useCallback((artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setIsLightboxOpen(true)
  }, [])

  // Grid configuration based on breakpoint
  const gridConfig = useMemo(() => {
    switch (breakpoint) {
      case 'mobile':
        return { columns: 1, gap: 4 }
      case 'tablet':
        return { columns: 2, gap: 6 }
      case 'desktop':
        return { columns: 3, gap: 8 }
      case 'wide':
        return { columns: 4, gap: 8 }
      default:
        return { columns: 2, gap: 6 }
    }
  }, [breakpoint])

  // Memoized artwork components for performance
  const artworkComponents = useMemo(() => {
    return displayedArtworks.map((artwork, index) => (
      <ArtworkCard
        key={artwork.id}
        artwork={artwork}
        index={index}
        isHovered={hoveredArtwork === artwork.id}
        onHoverStart={() => throttledHoverStart(artwork.id)}
        onHoverEnd={throttledHoverEnd}
        onClick={() => handleArtworkClick(artwork)}
        priority={index < 4} // Priority loading for first 4 images
      />
    ))
  }, [displayedArtworks, hoveredArtwork, throttledHoverStart, throttledHoverEnd, handleArtworkClick])

  return (
    <div className={`w-full ${className}`}>
      {/* Performance monitor (development only) */}
      {showPerformanceMonitor && <ThrottlePerformanceMonitor />}
      
      {/* Search and filters */}
      <div className="mb-8">
        <SearchFilter
          artworks={initialArtworks}
          onFilteredResults={handleFilteredResults}
          className="max-w-4xl mx-auto"
        />
      </div>

      {/* Gallery grid with infinite scroll */}
      <ThrottledInfiniteScroll
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={loadMore}
        threshold={200}
        className="w-full"
      >
        <ThrottledResponsiveGrid
          columnConfig={{
            mobile: gridConfig.columns,
            tablet: gridConfig.columns,
            desktop: gridConfig.columns,
            wide: gridConfig.columns
          }}
          gap={gridConfig.gap}
          className="w-full"
        >
          {artworkComponents}
        </ThrottledResponsiveGrid>
      </ThrottledInfiniteScroll>

      {/* Lightbox modal */}
      <AnimatePresence>
        {isLightboxOpen && selectedArtwork && (
          <LightboxModal
            artwork={selectedArtwork}
            onClose={() => setIsLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Empty state */}
      {displayedArtworks.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            작품을 찾을 수 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            검색 조건을 변경해 보세요.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Optimized artwork card component with throttled interactions
 */
const ArtworkCard = React.memo(function ArtworkCard({
  artwork,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
  priority = false
}: {
  artwork: Artwork
  index: number
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
  priority?: boolean
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.05, 0.3),
        layout: { duration: 0.2 }
      }}
      className="group cursor-pointer"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* Main image */}
        <ThrottledResponsiveImage
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full"
          aspectRatio="1/1"
          priority={priority}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-medium text-sm mb-1 line-clamp-2">
              {artwork.title}
            </h3>
            <div className="flex items-center justify-between text-xs opacity-90">
              <div className="flex items-center gap-2">
                {artwork.year && <span>{artwork.year}년</span>}
                {artwork.year && artwork.medium && <span>•</span>}
                {artwork.medium && (
                  <span className="line-clamp-1">{artwork.medium}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <Heart className="w-4 h-4" />
                <Share2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
    </motion.div>
  )
})

/**
 * Lightbox modal component with optimized rendering
 */
function LightboxModal({
  artwork,
  onClose
}: {
  artwork: Artwork
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl max-h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          ✕
        </button>

        {/* Image */}
        <div className="relative">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>

        {/* Info */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {artwork.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            {artwork.year && <span>{artwork.year}년</span>}
            {artwork.medium && <span>{artwork.medium}</span>}
            {artwork.dimensions && <span>{artwork.dimensions}</span>}
          </div>
          {artwork.description && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {artwork.description}
            </p>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <Link
              href={`/gallery/${artwork.slug || artwork.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              상세보기
            </Link>
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
              좋아요
            </button>
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              공유
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}