'use client'

/**
 * Example: Complete Performance Monitoring Integration for ANAM Gallery
 * 
 * This example demonstrates how to integrate the advanced performance monitoring
 * system into gallery components for comprehensive performance tracking.
 */

import React, { useEffect, useState, useCallback } from 'react'
import { usePerformanceContext } from '@/components/performance-provider'
import { usePerformanceMeasurement, useScrollPerformance } from '@/hooks/use-performance-monitoring'
import PerformanceDashboard from '@/components/performance-dashboard'
import PerformanceReport from '@/components/performance-report'

// Example: Gallery Component with Performance Tracking
export function ExampleGallery() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})

  // Performance monitoring hooks
  const {
    trackGalleryLoad,
    trackSearchPerformance,
    trackFilterPerformance,
    trackImageLoading,
    trackError
  } = usePerformanceContext()

  const { measure } = usePerformanceMeasurement()
  const { fps, isSmooth } = useScrollPerformance()

  // Track gallery loading performance
  const loadGallery = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Measure gallery loading time
      const { result: loadedArtworks, duration } = await measure('gallery-load', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200))
        return Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          title: `Artwork ${i + 1}`,
          imageUrl: `/images/artworks/optimized/${i + 1}/${i + 1}-medium.webp`,
          thumbnailUrl: `/images/artworks/optimized/${i + 1}/${i + 1}-thumb.jpg`
        }))
      })

      setArtworks(loadedArtworks)
      
      // Track gallery load performance
      const startTime = performance.now() - duration
      trackGalleryLoad(startTime, performance.now(), loadedArtworks.length)

    } catch (error) {
      trackError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [measure, trackGalleryLoad, trackError])

  // Track search performance
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    try {
      const { result: searchResults, duration } = await measure('search-operation', async () => {
        // Simulate search API call
        await new Promise(resolve => setTimeout(resolve, 250))
        return artworks.filter(artwork => 
          artwork.title.toLowerCase().includes(query.toLowerCase())
        )
      })

      setArtworks(searchResults)
      trackSearchPerformance(query, duration, searchResults.length)

    } catch (error) {
      trackError(error as Error)
    }
  }, [artworks, measure, trackSearchPerformance, trackError])

  // Track filter performance
  const handleFilter = useCallback(async (newFilters: Record<string, any>) => {
    try {
      const { duration } = await measure('filter-operation', async () => {
        // Simulate filter processing
        await new Promise(resolve => setTimeout(resolve, 150))
        setFilters(newFilters)
      })

      trackFilterPerformance(newFilters, duration)

    } catch (error) {
      trackError(error as Error)
    }
  }, [measure, trackFilterPerformance, trackError])

  // Track image loading
  const handleImageLoad = useCallback((imageUrl: string, startTime: number) => {
    const loadTime = performance.now() - startTime
    trackImageLoading(imageUrl, loadTime, 0)
  }, [trackImageLoading])

  // Load gallery on mount
  useEffect(() => {
    loadGallery()
  }, [loadGallery])

  return (
    <div className="gallery-container">
      {/* Performance Indicator */}
      <div className="performance-indicator mb-4 p-2 bg-gray-100 rounded">
        <div className="flex items-center justify-between text-sm">
          <span>Scroll Performance: {fps.toFixed(1)} FPS</span>
          <span className={isSmooth ? 'text-green-600' : 'text-red-600'}>
            {isSmooth ? '✓ Smooth' : '⚠ Choppy'}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-section mb-6">
        <input
          type="text"
          placeholder="Search artworks..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            // Debounced search
            setTimeout(() => handleSearch(e.target.value), 300)
          }}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* Filter Controls */}
      <div className="filter-section mb-6">
        <button
          onClick={() => handleFilter({ category: 'painting' })}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Paintings
        </button>
        <button
          onClick={() => handleFilter({ category: 'sculpture' })}
          className="mr-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          Sculptures
        </button>
        <button
          onClick={() => handleFilter({})}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear Filters
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 aspect-square rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))
        ) : (
          // Artwork cards
          artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onImageLoad={handleImageLoad}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Example: Artwork Card with Image Loading Tracking
function ArtworkCard({ 
  artwork, 
  onImageLoad 
}: { 
  artwork: any
  onImageLoad: (imageUrl: string, startTime: number) => void 
}) {
  const [imageStartTime, setImageStartTime] = useState<number>(0)
  const { trackError } = usePerformanceContext()

  const handleImageLoadStart = () => {
    setImageStartTime(performance.now())
  }

  const handleImageLoadComplete = () => {
    if (imageStartTime > 0) {
      onImageLoad(artwork.imageUrl, imageStartTime)
    }
  }

  const handleImageError = (error: Event) => {
    trackError(new Error(`Image load failed: ${artwork.imageUrl}`))
  }

  return (
    <div className="artwork-card border rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-square bg-gray-200">
        <img
          src={artwork.thumbnailUrl}
          alt={artwork.title}
          className="w-full h-full object-cover"
          onLoadStart={handleImageLoadStart}
          onLoad={handleImageLoadComplete}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{artwork.title}</h3>
        <p className="text-gray-600">ID: {artwork.id}</p>
      </div>
    </div>
  )
}

// Example: Performance Dashboard Page
export function ExamplePerformanceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <PerformanceDashboard 
          realTime={true}
          className="max-w-7xl mx-auto"
        />
      </div>
    </div>
  )
}

// Example: Performance Reports Page
export function ExamplePerformanceReports() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <PerformanceReport 
          timeRange={timeRange}
          autoRefresh={true}
          refreshInterval={300000} // 5 minutes
          className="max-w-7xl mx-auto"
        />
      </div>
    </div>
  )
}

// Example: App Layout with Performance Provider
export function ExampleApp() {
  return (
    <PerformanceProvider
      autoStart={true}
      showAlerts={true}
      alertThreshold="medium"
      enableGalleryTracking={true}
      enableErrorCorrelation={true}
      enableBundleAnalysis={true}
      realTimeUpdates={true}
      updateInterval={30000}
    >
      <div className="app">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">ANAM Gallery Performance Demo</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <ExampleGallery />
        </main>

        <footer className="bg-gray-100 py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
            Performance monitoring system active
          </div>
        </footer>
      </div>
    </PerformanceProvider>
  )
}

// Example: Custom Performance Hook Usage
export function useCustomPerformanceTracking() {
  const { metrics, score, alerts } = usePerformanceContext()
  const [performanceStatus, setPerformanceStatus] = useState<'good' | 'warning' | 'poor'>('good')

  useEffect(() => {
    // Determine performance status based on score and alerts
    if (score >= 90 && alerts.filter(a => a.severity === 'critical').length === 0) {
      setPerformanceStatus('good')
    } else if (score >= 70 && alerts.filter(a => a.severity === 'critical').length === 0) {
      setPerformanceStatus('warning')
    } else {
      setPerformanceStatus('poor')
    }
  }, [score, alerts])

  return {
    metrics,
    score,
    alerts,
    performanceStatus,
    criticalIssues: alerts.filter(a => a.severity === 'critical').length,
    hasPerformanceIssues: performanceStatus !== 'good'
  }
}

export default ExampleApp