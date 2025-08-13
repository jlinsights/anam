'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Artwork } from '@/lib/types'
import type { ErrorInfo } from 'react'
import { useGalleryStore, useArtworks, useGalleryFilters } from '@/lib/stores/gallery-store-safe'
import { ArtworkGridPortrait, ArtworkCardPortraitSkeleton } from '@/components/artwork-card-portrait'
import { GalleryErrorBoundary } from '@/components/error-boundary/GalleryErrorBoundary'
import { ApiErrorBoundary } from '@/components/error-boundary/ApiErrorBoundary'
import { ImageErrorBoundary } from '@/components/error-boundary/ImageErrorBoundary'

interface GallerySectionProps {
  artworks: Artwork[]
  onArtworkSelect: (artwork: Artwork) => void
}

// Separate component for filters to isolate API errors
function GalleryFilters({ 
  artworks, 
  searchTerm, 
  selectedYear, 
  setSearchTerm, 
  setSelectedYear, 
  clearFilters 
}: {
  artworks: Artwork[]
  searchTerm: string
  selectedYear: number | null
  setSearchTerm: (term: string) => void
  setSelectedYear: (year: number | null) => void
  clearFilters: () => void
}) {
  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(artworks.map(artwork => artwork.year))]
    return years.sort((a, b) => b - a)
  }, [artworks])

  return (
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
            focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
          "
        >
          필터 초기화
        </button>
      )}
    </motion.div>
  )
}

// Separate component for artwork grid with image error boundaries
function ArtworkGridWithErrorBoundaries({ 
  filteredArtworks 
}: {
  filteredArtworks: Artwork[]
}) {
  return (
    <ImageErrorBoundary
      imageContext="gallery"
      onError={(error, errorInfo) => {
        console.error('Gallery image error:', { error, errorInfo })
      }}
    >
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
    </ImageErrorBoundary>
  )
}

// Main gallery section with comprehensive error boundaries
export function GallerySectionWithErrorBoundaries({ 
  artworks, 
  onArtworkSelect 
}: GallerySectionProps) {
  return (
    <GalleryErrorBoundary
      onError={(error: Error, errorInfo: ErrorInfo) => {
        console.error('Gallery section error:', { error, errorInfo })
      }}
    >
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

        {/* API error boundary for data-dependent components */}
        <ApiErrorBoundary
          apiContext="artworks"
          onError={(error: Error, errorInfo: ErrorInfo) => {
            console.error('Gallery API error:', { error, errorInfo })
          }}
        >
          <GalleryDataSection 
            artworks={artworks} 
            onArtworkSelect={onArtworkSelect} 
          />
        </ApiErrorBoundary>
      </div>
    </GalleryErrorBoundary>
  )
}

// Data section wrapped in its own boundary
function GalleryDataSection({ 
  artworks, 
  onArtworkSelect 
}: GallerySectionProps) {
  // Use store for filters and search
  const filteredArtworks = useArtworks()
  const { searchTerm, selectedYear, selectedMedium } = useGalleryFilters()
  const { setSearchTerm, setSelectedYear, clearFilters } = useGalleryStore()

  return (
    <>
      {/* Search and filter controls with error boundary */}
      <GalleryErrorBoundary
        fallback={
          <div className="mb-zen-lg p-zen-md bg-paper-warm border border-ink/20 rounded text-center">
            <p className="font-display text-ink-light">
              검색 기능을 일시적으로 사용할 수 없습니다.
            </p>
          </div>
        }
      >
        <GalleryFilters
          artworks={artworks}
          searchTerm={searchTerm}
          selectedYear={selectedYear}
          setSearchTerm={setSearchTerm}
          setSelectedYear={setSelectedYear}
          clearFilters={clearFilters}
        />
      </GalleryErrorBoundary>

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

      {/* Artwork grid with image error boundaries */}
      <GalleryErrorBoundary
        fallback={
          <div className="min-h-[400px] flex items-center justify-center p-zen-lg bg-paper-warm border-2 border-ink/20">
            <div className="text-center space-y-zen-sm">
              <div className="w-16 h-16 mx-auto border-2 border-ink bg-paper flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className="font-display font-bold text-ink">
                갤러리를 불러올 수 없습니다
              </h3>
              <p className="font-display text-ink-light text-sm">
                작품 목록 로딩 중 문제가 발생했습니다.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="
                  px-zen-md py-zen-sm text-sm
                  bg-ink text-paper font-display
                  hover:bg-gold hover:text-ink
                  transition-all duration-300
                  border border-ink
                  focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
                "
              >
                새로고침
              </button>
            </div>
          </div>
        }
      >
        <ArtworkGridWithErrorBoundaries filteredArtworks={filteredArtworks} />
      </GalleryErrorBoundary>

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
              focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
            "
          >
            전체 작품 보기
          </button>
        </motion.div>
      )}
    </>
  )
}