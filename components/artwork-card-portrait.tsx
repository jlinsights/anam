/**
 * @fileoverview Artwork Card Components with 9:16 Portrait Aspect Ratio
 * 
 * This module provides components for displaying artworks in a vertical 9:16 aspect ratio
 * with comprehensive metadata display including title, year, medium, and dimensions.
 * 
 * Components:
 * - ArtworkCardPortrait: Individual artwork card with metadata
 * - ArtworkGridPortrait: Responsive grid layout for multiple artworks  
 * - ArtworkCardPortraitSkeleton: Loading skeleton component
 * 
 * Features:
 * - 9:16 aspect ratio optimized for portrait artworks
 * - Comprehensive metadata display (title, year, medium, dimensions)
 * - Responsive grid layouts (2-5 columns based on screen size)
 * - Progressive image loading with priority optimization
 * - Hover effects with gradient overlays
 * - Brutalist design system integration
 * - Featured artwork badge support
 * - Series and technique information display
 */

'use client'

import { memo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArtworkImage } from '@/components/common/ProgressiveImage'
import type { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar, Palette, Ruler } from 'lucide-react'

interface ArtworkCardPortraitProps {
  artwork: Artwork
  className?: string
  priority?: boolean
  showMetadata?: boolean
  index?: number
}

export const ArtworkCardPortrait = memo(function ArtworkCardPortrait({
  artwork,
  className,
  priority = false,
  showMetadata = true,
  index = 0,
}: ArtworkCardPortraitProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <motion.div
      className={cn('group cursor-pointer', className)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      viewport={{ once: true }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link 
        href={`/gallery/${artwork.slug}`} 
        className="block focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded"
        aria-label={`${artwork.title} 작품 상세보기 - ${artwork.year}년${artwork.medium ? `, ${artwork.medium}` : ''}`}
      >
        {/* Image Container with 9:16 aspect ratio */}
        <div className="
          relative bg-paper border-2 border-ink
          shadow-brutal-sm group-hover:shadow-brutal group-focus-within:shadow-brutal
          transition-all duration-300
          group-hover:-translate-x-1 group-hover:-translate-y-1 group-focus-within:-translate-x-1 group-focus-within:-translate-y-1
          overflow-hidden
          aspect-[9/16]
        ">
          {/* Progressive artwork image */}
          <ArtworkImage
            artwork={artwork}
            size="medium"
            className="absolute inset-2 rounded object-cover w-full h-full"
            placeholderClassName="bg-paper-cream"
            priority={priority}
            alt={`${artwork.title} - ${artwork.year}년 작품${artwork.medium ? `, ${artwork.medium}` : ''}`}
          />
          
          {/* Hover overlay */}
          <motion.div
            className="
              absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent
              flex items-end justify-center
              opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
              transition-opacity duration-300
            "
            animate={{
              opacity: isHovered ? 1 : 0
            }}
          >
            <div className="text-center p-zen-md pb-zen-lg">
              <div className="w-8 h-8 border border-paper mx-auto mb-2 flex items-center justify-center bg-paper/90 rounded" aria-hidden="true">
                <span className="text-xs">🖼</span>
              </div>
              <span className="font-display text-paper text-sm font-medium block">작품 상세보기</span>
              <div className="text-xs text-paper/80 mt-1">
                클릭하여 더 자세히 보기
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metadata Section */}
        {showMetadata && (
          <div className="mt-zen-sm space-y-zen-xs">
            {/* Title */}
            <h2 className="font-display font-bold text-ink text-lg leading-tight line-clamp-2">
              {artwork.title}
            </h2>

            {/* Artwork details */}
            <dl className="space-y-zen-xs">
              {/* Year */}
              <div className="flex items-center gap-2 text-ink-light">
                <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <dt className="sr-only">제작년도:</dt>
                <dd className="font-display text-sm">{artwork.year}년</dd>
              </div>

              {/* Medium */}
              {artwork.medium && (
                <div className="flex items-center gap-2 text-ink-light">
                  <Palette className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <dt className="sr-only">재료:</dt>
                  <dd className="font-display text-sm line-clamp-1">{artwork.medium}</dd>
                </div>
              )}

              {/* Dimensions */}
              {artwork.dimensions && (
                <div className="flex items-center gap-2 text-ink-light">
                  <Ruler className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <dt className="sr-only">크기:</dt>
                  <dd className="font-display text-sm line-clamp-1">{artwork.dimensions}</dd>
                </div>
              )}
            </dl>

            {/* Series or Technique if available */}
            {(artwork.series || artwork.technique) && (
              <div className="pt-zen-xs border-t border-stone/20">
                {artwork.series && (
                  <p className="font-display text-xs text-ink-light">
                    시리즈: {artwork.series}
                  </p>
                )}
                {artwork.technique && (
                  <p className="font-display text-xs text-ink-light mt-1">
                    기법: {artwork.technique}
                  </p>
                )}
              </div>
            )}

            {/* Featured badge */}
            {artwork.featured && (
              <div className="mt-zen-xs">
                <span className="
                  inline-block px-2 py-1 
                  bg-gold text-ink text-xs font-display font-bold
                  border border-ink
                ">
                  대표작
                </span>
              </div>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  )
})

// Portrait Grid Component for 9:16 artworks
interface ArtworkGridPortraitProps {
  artworks: Artwork[]
  className?: string
  showMetadata?: boolean
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
    wide?: number
  }
}

export const ArtworkGridPortrait = memo(function ArtworkGridPortrait({
  artworks,
  className,
  showMetadata = true,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    wide: 5
  }
}: ArtworkGridPortraitProps) {
  // Generate responsive grid classes based on columns config
  const gridClasses = cn(
    'grid gap-zen-md',
    // Mobile
    columns.mobile === 1 && 'grid-cols-1',
    columns.mobile === 2 && 'grid-cols-2',
    columns.mobile === 3 && 'grid-cols-3',
    // Tablet
    columns.tablet === 2 && 'sm:grid-cols-2',
    columns.tablet === 3 && 'sm:grid-cols-3', 
    columns.tablet === 4 && 'sm:grid-cols-4',
    // Desktop
    columns.desktop === 3 && 'md:grid-cols-3',
    columns.desktop === 4 && 'md:grid-cols-4',
    columns.desktop === 5 && 'md:grid-cols-5',
    columns.desktop === 6 && 'md:grid-cols-6',
    // Wide screens
    columns.wide === 4 && 'lg:grid-cols-4',
    columns.wide === 5 && 'lg:grid-cols-5',
    columns.wide === 6 && 'lg:grid-cols-6',
    columns.wide === 7 && 'lg:grid-cols-7',
    className
  )

  return (
    <div 
      className={gridClasses}
      role="grid"
      aria-label={`작품 갤러리 - ${artworks.length}개 작품`}
    >
      {artworks.map((artwork, index) => (
        <div key={artwork.id} role="gridcell">
          <ArtworkCardPortrait
            artwork={artwork}
            showMetadata={showMetadata}
            priority={index < 8} // Prioritize first 8 images for above-fold loading
            index={index}
          />
        </div>
      ))}
    </div>
  )
})

// Loading skeleton for portrait cards
export const ArtworkCardPortraitSkeleton = memo(function ArtworkCardPortraitSkeleton({
  showMetadata = true
}: {
  showMetadata?: boolean
}) {
  return (
    <div className="animate-pulse">
      {/* Image skeleton with 9:16 ratio */}
      <div className="
        aspect-[9/16] bg-stone/20 border-2 border-stone/40
        shadow-brutal-sm
      " />
      
      {/* Metadata skeleton */}
      {showMetadata && (
        <div className="mt-zen-sm space-y-zen-xs">
          <div className="h-5 bg-stone/20 rounded w-3/4" />
          <div className="h-4 bg-stone/20 rounded w-1/2" />
          <div className="h-4 bg-stone/20 rounded w-2/3" />
          <div className="h-4 bg-stone/20 rounded w-1/3" />
        </div>
      )}
    </div>
  )
})