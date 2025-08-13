'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useArtworks, useArtist, useRandomArtworks } from '@/hooks/use-artwork-api'
import { ApiErrorRecovery } from './api-error-recovery'
import { ErrorBoundary } from './error-boundary'
import { Loader2, RefreshCw, Search, Filter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useThrottledSearch, useThrottledGalleryScroll } from '@/lib/hooks/use-throttled-handlers'

interface EnhancedGalleryComponentProps {
  className?: string
  showSearch?: boolean
  showFilters?: boolean
  maxItems?: number
}

/**
 * Example component demonstrating comprehensive request cancellation implementation
 * with multiple API calls, error handling, and user-friendly recovery options
 */
export function EnhancedGalleryComponent({
  className = '',
  showSearch = false,
  showFilters = false,
  maxItems = 12
}: EnhancedGalleryComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Primary data fetching with cancellation support
  const {
    data: artworks,
    loading: artworksLoading,
    error: artworksError,
    retry: retryArtworks,
    cancel: cancelArtworks
  } = useArtworks()

  const {
    data: artist,
    loading: artistLoading,
    error: artistError,
    retry: retryArtist
  } = useArtist()

  // Secondary data fetching (random artworks for recommendations)
  const {
    data: randomArtworks,
    loading: randomLoading,
    error: randomError,
    retry: retryRandom
  } = useRandomArtworks(undefined, 4)

  // Filtered artworks based on search and category
  const filteredArtworks = React.useMemo(() => {
    if (!artworks) return []
    
    let filtered = artworks

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(artwork =>
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.medium?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory)
    }

    return filtered.slice(0, maxItems)
  }, [artworks, searchQuery, selectedCategory, maxItems])

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    if (!artworks) return []
    const cats = [...new Set(artworks.map(artwork => artwork.category).filter(Boolean))]
    return cats
  }, [artworks])

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
    retryArtworks()
    retryArtist()
    retryRandom()
  }, [retryArtworks, retryArtist, retryRandom])

  // Throttled search handler for better performance
  const throttledSearch = useThrottledSearch(
    (query: string) => {
      setSearchQuery(query)
    },
    300, // 300ms delay for search input
    []
  )

  // Handle search
  const handleSearch = useCallback((query: string) => {
    throttledSearch(query)
  }, [throttledSearch])

  // Handle category filter
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  // Cancel all requests on unmount
  useEffect(() => {
    return () => {
      cancelArtworks()
    }
  }, [cancelArtworks])

  const isLoading = artworksLoading || artistLoading
  const hasErrors = artworksError || artistError

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              작품 갤러리
            </h2>
            {artist && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                by {artist.name}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="새로고침"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            새로고침
          </button>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="작품 검색..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Category Filter */}
            {showFilters && categories.length > 0 && (
              <div className="sm:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">모든 카테고리</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Recovery */}
        {hasErrors && (
          <ApiErrorRecovery
            error={artworksError || artistError}
            onRetry={handleRefresh}
            loading={isLoading}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isLoading && !hasErrors && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Main Gallery Grid */}
        {!isLoading && !hasErrors && filteredArtworks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredArtworks.map((artwork, index) => (
              <Link
                key={artwork.id}
                href={`/gallery/${artwork.slug || artwork.id}`}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  {artwork.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        loading={index < 4 ? "eager" : "lazy"}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-medium text-sm mb-1 line-clamp-2">
                            {artwork.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs opacity-90">
                            {artwork.year && <span>{artwork.year}년</span>}
                            {artwork.year && artwork.medium && <span>•</span>}
                            {artwork.medium && (
                              <span className="line-clamp-1">{artwork.medium}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm">이미지 준비중</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasErrors && filteredArtworks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              작품을 찾을 수 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery || selectedCategory
                ? '검색 조건을 변경해 보세요.'
                : '표시할 작품이 없습니다.'
              }
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                }}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                필터 초기화
              </button>
            )}
          </div>
        )}

        {/* Random Artworks Recommendations */}
        {!randomLoading && randomArtworks && randomArtworks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                추천 작품
              </h3>
              <button
                onClick={retryRandom}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                다른 작품 보기
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {randomArtworks.map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/gallery/${artwork.slug || artwork.id}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                    {artwork.imageUrl ? (
                      <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                        <span className="text-xs">이미지 준비중</span>
                      </div>
                    )}
                  </div>
                  <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {artwork.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {!isLoading && !hasErrors && artworks && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {artworks.length}
                </div>
                <div>전체 작품</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {filteredArtworks.length}
                </div>
                <div>표시된 작품</div>
              </div>
              {categories.length > 0 && (
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {categories.length}
                  </div>
                  <div>카테고리</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}