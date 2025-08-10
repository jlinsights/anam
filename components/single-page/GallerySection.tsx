'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Artwork } from '@/lib/types'
import { useGalleryStore, useArtworks, useGalleryFilters } from '@/lib/stores/gallery-store-safe'
import { ArtworkImage } from '@/components/common/ProgressiveImage'

interface GallerySectionProps {
  artworks: Artwork[]
  onArtworkSelect: (artwork: Artwork) => void
}

export function GallerySection({ artworks, onArtworkSelect }: GallerySectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // Use store for filters and search
  const filteredArtworks = useArtworks()
  const { searchTerm, selectedYear, selectedMedium } = useGalleryFilters()
  const { setSearchTerm, setSelectedYear, clearFilters } = useGalleryStore()

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(artworks.map(artwork => artwork.year))]
    return years.sort((a, b) => b - a)
  }, [artworks])

  return (
    <div className="max-w-7xl mx-auto px-zen-md">
      {/* Section header */}
      <motion.div
        className="text-center mb-zen-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
          작품 갤러리
        </h2>
        <p className="font-display text-ink-light text-lg">
          Gallery • {artworks.length}개 작품
        </p>
        <div className="mt-zen-sm flex justify-center">
          <div className="w-24 h-1 bg-gold"></div>
        </div>
      </motion.div>

      {/* Search and filter controls */}
      <motion.div
        className="mb-zen-lg flex flex-col sm:flex-row gap-zen-sm justify-center items-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="작품 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              px-zen-md py-zen-sm border-2 border-ink
              bg-paper focus:bg-paper-warm
              font-display text-ink
              focus:outline-none focus:border-gold
              transition-colors duration-300
              w-64
            "
          />
          <div className="absolute right-zen-sm top-1/2 transform -translate-y-1/2">
            🔍
          </div>
        </div>

        {/* Year filter */}
        <select
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
          className="
            px-zen-md py-zen-sm border-2 border-ink
            bg-paper focus:bg-paper-warm
            font-display text-ink
            focus:outline-none focus:border-gold
            transition-colors duration-300
          "
        >
          <option value="">전체 연도</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}년</option>
          ))}
        </select>

        {/* Clear filters */}
        {(searchTerm || selectedYear) && (
          <button
            onClick={clearFilters}
            className="
              px-zen-sm py-zen-xs text-sm font-display
              text-ink-light hover:text-gold
              border border-ink/20 hover:border-gold
              transition-colors duration-300
            "
          >
            필터 초기화
          </button>
        )}
      </motion.div>

      {/* Results count */}
      <motion.div
        className="text-center mb-zen-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <p className="font-display text-ink-light text-sm">
          {filteredArtworks.length}개 작품 {searchTerm || selectedYear ? '검색됨' : '전체'}
        </p>
      </motion.div>

      {/* Artwork grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-zen-sm md:gap-zen-md">
        {filteredArtworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            className="group cursor-pointer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onArtworkSelect(artwork)}
          >
            <div className="
              relative bg-paper aspect-square border-2 border-ink
              shadow-brutal-sm group-hover:shadow-brutal
              transition-all duration-300
              group-hover:-translate-x-1 group-hover:-translate-y-1
              overflow-hidden
            ">
              {/* Progressive artwork image */}
              <ArtworkImage
                artwork={artwork}
                size="thumb"
                className="absolute inset-2 rounded"
                placeholderClassName="bg-paper-cream"
                priority={index < 12} // Prioritize first 12 images
              />
              
              {/* Hover overlay */}
              <motion.div
                className="
                  absolute inset-0 bg-gold/10 
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                "
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0
                }}
              >
                <div className="text-center p-2">
                  <div className="w-6 h-6 border border-ink mx-auto mb-1 flex items-center justify-center">
                    <span className="text-xs">👁</span>
                  </div>
                  <span className="font-display text-ink text-xs">보기</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No results message */}
      {filteredArtworks.length === 0 && (
        <motion.div
          className="text-center py-zen-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="font-display text-ink-light text-lg mb-zen-sm">
            검색 결과가 없습니다
          </p>
          <button
            onClick={clearFilters}
            className="
              px-zen-md py-zen-sm
              bg-ink text-paper font-display
              hover:bg-gold transition-colors duration-300
            "
          >
            전체 작품 보기
          </button>
        </motion.div>
      )}
    </div>
  )
}