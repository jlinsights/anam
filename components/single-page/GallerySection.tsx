'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Artwork } from '@/lib/types'
import { useGalleryStore, useArtworks, useGalleryFilters } from '@/lib/stores/gallery-store-safe'
import { ArtworkGridPortrait, ArtworkCardPortraitSkeleton } from '@/components/artwork-card-portrait'
import { useThrottledSearch } from '@/lib/hooks/use-throttled-handlers'

interface GallerySectionProps {
  artworks: Artwork[]
  onArtworkSelect: (artwork: Artwork) => void
}

export function GallerySection({ artworks, onArtworkSelect }: GallerySectionProps) {
  // Use store for filters and search
  const filteredArtworks = useArtworks()
  const { searchTerm, selectedYear, selectedMedium } = useGalleryFilters()
  const { setSearchTerm, setSelectedYear, clearFilters } = useGalleryStore()

  // Throttled search handler for better performance
  const throttledSearchUpdate = useThrottledSearch(
    (term: string) => {
      setSearchTerm(term)
    },
    300, // 300ms delay for search input
    []
  )

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(artworks.map(artwork => artwork.year))]
    return years.sort((a, b) => b - a)
  }, [artworks])

  return (
    <div className="max-w-7xl mx-auto px-zen-md">
      {/* Section header */}
      <motion.header
        className="text-center mb-zen-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h1 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
          작품 갤러리
        </h1>
        <p className="font-display text-ink-light text-lg">
          Gallery • {artworks.length}개 작품
        </p>
        <div className="mt-zen-sm flex justify-center" aria-hidden="true">
          <div className="w-24 h-1 bg-gold"></div>
        </div>
      </motion.header>

      {/* Search and filter controls */}
      <motion.section
        className="mb-zen-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        aria-labelledby="gallery-filters-title"
      >
        <h2 id="gallery-filters-title" className="sr-only">작품 검색 및 필터</h2>
        <div className="flex flex-col sm:flex-row gap-zen-sm justify-center items-center">
          {/* Search input */}
          <div className="relative">
            <label htmlFor="gallery-search" className="sr-only">작품 검색</label>
            <input
              id="gallery-search"
              type="text"
              placeholder="작품 검색..."
              value={searchTerm}
              onChange={(e) => throttledSearchUpdate(e.target.value)}
              className="
                px-zen-md py-zen-sm border-2 border-ink
                bg-paper focus:bg-paper-warm
                font-display text-ink
                focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
                transition-colors duration-300
                w-64
              "
              aria-describedby="search-help"
            />
            <div className="absolute right-zen-sm top-1/2 transform -translate-y-1/2" aria-hidden="true">
              🔍
            </div>
            <div id="search-help" className="sr-only">
              작품 제목으로 검색할 수 있습니다
            </div>
          </div>

          {/* Year filter */}
          <div>
            <label htmlFor="year-filter" className="sr-only">제작 연도 필터</label>
            <select
              id="year-filter"
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="
                px-zen-md py-zen-sm border-2 border-ink
                bg-paper focus:bg-paper-warm
                font-display text-ink
                focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
                transition-colors duration-300
              "
              aria-describedby="year-filter-help"
            >
              <option value="">전체 연도</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <div id="year-filter-help" className="sr-only">
              제작 연도별로 작품을 필터링할 수 있습니다
            </div>
          </div>

          {/* Clear filters */}
          {(searchTerm || selectedYear) && (
            <button
              onClick={clearFilters}
              className="
                px-zen-sm py-zen-xs text-sm font-display
                text-ink-light hover:text-gold
                border border-ink/20 hover:border-gold
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-gold/20
              "
              aria-label="모든 필터 초기화"
            >
              필터 초기화
            </button>
          )}
        </div>
      </motion.section>

      {/* Results count */}
      <motion.div
        className="text-center mb-zen-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <p 
          className="font-display text-ink-light text-sm"
          role="status"
          aria-live="polite"
          aria-label={`검색 결과: ${filteredArtworks.length}개 작품 ${searchTerm || selectedYear ? '검색됨' : '전체'}`}
        >
          {filteredArtworks.length}개 작품 {searchTerm || selectedYear ? '검색됨' : '전체'}
        </p>
      </motion.div>

      {/* Artwork grid with 9:16 portrait layout */}
      {filteredArtworks.length > 0 ? (
        <section aria-labelledby="gallery-results-title">
          <h2 id="gallery-results-title" className="sr-only">작품 갤러리 결과</h2>
          <ArtworkGridPortrait 
            artworks={filteredArtworks}
            showMetadata={true}
            columns={{
              mobile: 2,
              tablet: 3, 
              desktop: 4,
              wide: 5
            }}
            className="mb-zen-lg"
          />
        </section>
      ) : (
        /* No results message */
        <motion.section
          className="text-center py-zen-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          aria-labelledby="no-results-title"
        >
          <h2 id="no-results-title" className="font-display text-ink-light text-lg mb-zen-sm">
            검색 결과가 없습니다
          </h2>
          <p className="font-display text-ink-light text-sm mb-zen-md">
            다른 검색어나 필터를 시도해보세요
          </p>
          <button
            onClick={clearFilters}
            className="
              px-zen-md py-zen-sm
              bg-ink text-paper font-display
              hover:bg-gold transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-gold/20
            "
            aria-label="모든 필터를 초기화하고 전체 작품 보기"
          >
            전체 작품 보기
          </button>
        </motion.section>
      )}
    </div>
  )
}