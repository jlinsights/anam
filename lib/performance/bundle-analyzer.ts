// 🚀 Bundle Analysis & Optimization
// SuperClaude Pattern: Evidence-based performance optimization

export interface BundleAnalysisReport {
  totalSize: number
  gzippedSize: number
  chunks: ChunkInfo[]
  recommendations: OptimizationRecommendation[]
  score: number
  metrics: BundleMetrics
}

export interface ChunkInfo {
  name: string
  size: number
  gzippedSize: number
  modules: ModuleInfo[]
  route?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface ModuleInfo {
  name: string
  size: number
  reasons: string[]
  optimized: boolean
}

export interface OptimizationRecommendation {
  type: 'code-split' | 'tree-shake' | 'compress' | 'lazy-load' | 'preload'
  target: string
  impact: 'high' | 'medium' | 'low'
  description: string
  implementation: string
  estimatedSavings: number
}

export interface BundleMetrics {
  loadTime: number
  parseTime: number
  executeTime: number
  cacheHitRate: number
  compressionRatio: number
}

class BundleAnalyzer {
  private performanceEntries: PerformanceEntry[] = []
  private resourceTimings: PerformanceResourceTiming[] = []

  constructor() {
    this.collectPerformanceData()
  }

  private collectPerformanceData() {
    if (typeof window === 'undefined') return

    // Collect all performance entries
    this.performanceEntries = performance.getEntries()
    this.resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    // Listen for new entries
    const observer = new PerformanceObserver((list) => {
      this.performanceEntries.push(...list.getEntries())
      this.resourceTimings.push(
        ...list.getEntries().filter(entry => entry.entryType === 'resource') as PerformanceResourceTiming[]
      )
    })

    observer.observe({ entryTypes: ['resource', 'navigation', 'measure'] })
  }

  // 🎯 SuperClaude Pattern: Comprehensive Bundle Analysis
  public async analyzeBundles(): Promise<BundleAnalysisReport> {
    const chunks = await this.analyzeChunks()
    const metrics = this.calculateMetrics()
    const recommendations = this.generateRecommendations(chunks, metrics)
    const score = this.calculateOptimizationScore(chunks, metrics)

    return {
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      gzippedSize: chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0),
      chunks,
      recommendations,
      score,
      metrics
    }
  }

  private async analyzeChunks(): Promise<ChunkInfo[]> {
    const chunks: ChunkInfo[] = []

    // Analyze JavaScript chunks
    const jsResources = this.resourceTimings.filter(
      resource => resource.name.endsWith('.js') || resource.name.includes('/_next/static/chunks/')
    )

    for (const resource of jsResources) {
      const chunkInfo = await this.analyzeChunk(resource)
      if (chunkInfo) {
        chunks.push(chunkInfo)
      }
    }

    // Sort by size (largest first)
    return chunks.sort((a, b) => b.size - a.size)
  }

  private async analyzeChunk(resource: PerformanceResourceTiming): Promise<ChunkInfo | null> {
    try {
      const response = await fetch(resource.name, { method: 'HEAD' })
      const contentLength = response.headers.get('content-length')
      const contentEncoding = response.headers.get('content-encoding')

      if (!contentLength) return null

      const size = parseInt(contentLength, 10)
      const gzippedSize = contentEncoding === 'gzip' ? size : Math.floor(size * 0.3) // Estimate

      // Extract chunk name and route
      const urlParts = resource.name.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const chunkName = fileName.replace(/\.[^.]+$/, '')

      // Determine route and priority
      const route = this.inferRoute(resource.name)
      const priority = this.determinePriority(resource, route)

      return {
        name: chunkName,
        size,
        gzippedSize,
        modules: [], // Would need webpack bundle analyzer for detailed module info
        route,
        priority
      }
    } catch (error) {
      console.warn('Failed to analyze chunk:', resource.name, error)
      return null
    }
  }

  private inferRoute(resourceUrl: string): string | undefined {
    // Try to map chunk to route based on URL patterns
    if (resourceUrl.includes('pages/')) {
      const match = resourceUrl.match(/pages\/(.+?)[-.]/)
      return match ? `/${match[1]}` : undefined
    }
    
    if (resourceUrl.includes('app/')) {
      const match = resourceUrl.match(/app\/(.+?)[-.]/)
      return match ? `/${match[1]}` : undefined
    }

    return undefined
  }

  private determinePriority(resource: PerformanceResourceTiming, route?: string): 'critical' | 'high' | 'medium' | 'low' {
    // Critical: Main bundle, polyfills
    if (resource.name.includes('main') || resource.name.includes('polyfill')) {
      return 'critical'
    }

    // High: Current page, shared components
    if (route === window.location.pathname || resource.name.includes('shared')) {
      return 'high'
    }

    // Medium: Common chunks
    if (resource.name.includes('commons') || resource.name.includes('vendor')) {
      return 'medium'
    }

    // Low: Route-specific chunks not on current page
    return 'low'
  }

  private calculateMetrics(): BundleMetrics {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart
    const parseTime = navigationEntry.domInteractive - navigationEntry.responseEnd
    const executeTime = navigationEntry.domContentLoadedEventEnd - navigationEntry.domInteractive

    // Calculate cache hit rate
    const cachedResources = this.resourceTimings.filter(
      resource => resource.transferSize === 0 && resource.decodedBodySize > 0
    )
    const cacheHitRate = cachedResources.length / this.resourceTimings.length

    // Estimate compression ratio
    const totalTransferSize = this.resourceTimings.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    const totalDecodedSize = this.resourceTimings.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0)
    const compressionRatio = totalDecodedSize > 0 ? totalTransferSize / totalDecodedSize : 1

    return {
      loadTime,
      parseTime,
      executeTime,
      cacheHitRate,
      compressionRatio
    }
  }

  private generateRecommendations(chunks: ChunkInfo[], metrics: BundleMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = []

    // Large chunk recommendations
    chunks.forEach(chunk => {
      if (chunk.size > 500 * 1024) { // > 500KB
        recommendations.push({
          type: 'code-split',
          target: chunk.name,
          impact: 'high',
          description: `Chunk "${chunk.name}" is ${Math.round(chunk.size / 1024)}KB. Consider code splitting.`,
          implementation: 'Use dynamic imports: const Component = lazy(() => import("./Component"))',
          estimatedSavings: Math.floor(chunk.size * 0.6) // Estimate 60% reduction
        })
      }

      if (chunk.size > 100 * 1024 && chunk.priority === 'low') { // > 100KB low priority
        recommendations.push({
          type: 'lazy-load',
          target: chunk.name,
          impact: 'medium',
          description: `Low priority chunk "${chunk.name}" should be lazy loaded.`,
          implementation: 'Implement route-based code splitting and lazy loading',
          estimatedSavings: chunk.size // Full savings from initial load
        })
      }
    })

    // Performance-based recommendations
    if (metrics.loadTime > 3000) { // > 3 seconds
      recommendations.push({
        type: 'preload',
        target: 'critical-resources',
        impact: 'high',
        description: 'Load time is slow. Preload critical resources.',
        implementation: '<link rel="preload" href="/critical.js" as="script">',
        estimatedSavings: 1000 // Estimate 1s improvement
      })
    }

    if (metrics.compressionRatio > 0.8) { // Poor compression
      recommendations.push({
        type: 'compress',
        target: 'all-assets',
        impact: 'medium',
        description: 'Enable better compression (Brotli/Gzip).',
        implementation: 'Configure server compression: Accept-Encoding: br, gzip',
        estimatedSavings: Math.floor(chunks.reduce((sum, c) => sum + c.size, 0) * 0.3)
      })
    }

    if (metrics.cacheHitRate < 0.7) { // < 70% cache hit rate
      recommendations.push({
        type: 'preload',
        target: 'static-assets',
        impact: 'medium',
        description: 'Improve caching strategy for better cache hit rate.',
        implementation: 'Set appropriate Cache-Control headers and implement service worker caching',
        estimatedSavings: 2000 // Estimate 2s improvement from caching
      })
    }

    return recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  private calculateOptimizationScore(chunks: ChunkInfo[], metrics: BundleMetrics): number {
    let score = 100

    // Penalize large chunks
    chunks.forEach(chunk => {
      if (chunk.size > 500 * 1024) score -= 20
      else if (chunk.size > 250 * 1024) score -= 10
      else if (chunk.size > 100 * 1024) score -= 5
    })

    // Penalize slow metrics
    if (metrics.loadTime > 5000) score -= 25
    else if (metrics.loadTime > 3000) score -= 15
    else if (metrics.loadTime > 2000) score -= 10

    if (metrics.parseTime > 1000) score -= 15
    if (metrics.executeTime > 1000) score -= 15

    // Bonus for good practices
    if (metrics.cacheHitRate > 0.8) score += 10
    if (metrics.compressionRatio < 0.4) score += 10

    return Math.max(0, Math.min(100, score))
  }

  // 🎯 SuperClaude Pattern: Real-time Bundle Monitoring
  public startRealTimeMonitoring(callback: (report: BundleAnalysisReport) => void) {
    // Initial analysis
    this.analyzeBundles().then(callback)

    // Monitor for new chunks (e.g., lazy loaded)
    const observer = new PerformanceObserver((list) => {
      const newResources = list.getEntries().filter(
        entry => entry.entryType === 'resource' && 
        (entry.name.endsWith('.js') || entry.name.includes('/_next/static/'))
      )

      if (newResources.length > 0) {
        // Re-analyze when new resources are loaded
        setTimeout(() => {
          this.analyzeBundles().then(callback)
        }, 1000) // Debounce
      }
    })

    observer.observe({ entryTypes: ['resource'] })

    return () => observer.disconnect()
  }
}

// 🎯 Factory Function
export function createBundleAnalyzer(): BundleAnalyzer {
  return new BundleAnalyzer()
}

export { BundleAnalyzer }
export default BundleAnalyzer