# Advanced Performance Monitoring System for ANAM Gallery

This comprehensive performance monitoring system provides Real User Monitoring (RUM), Core Web Vitals tracking, gallery-specific metrics, error correlation, and advanced analytics for the ANAM Gallery application.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [Implementation Guide](#implementation-guide)
5. [Component Reference](#component-reference)
6. [API Reference](#api-reference)
7. [Performance Budgets](#performance-budgets)
8. [Alert System](#alert-system)
9. [Analytics Dashboard](#analytics-dashboard)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

## Overview

The ANAM Gallery performance monitoring system is designed to provide comprehensive insights into application performance, user experience, and optimization opportunities. It combines industry-standard Core Web Vitals with gallery-specific metrics to deliver actionable performance data.

### Key Capabilities

- **Real User Monitoring (RUM)**: Track actual user experience across devices and networks
- **Core Web Vitals**: Monitor LCP, INP, CLS, FCP, and TTFB with performance budgets
- **Gallery-Specific Metrics**: Track artwork loading, search performance, and user interactions
- **Error Correlation**: Analyze relationship between errors and performance degradation
- **Bundle Analysis**: Monitor JavaScript bundle sizes and optimization opportunities
- **Performance Alerts**: Real-time notifications for budget violations and regressions
- **Advanced Analytics**: Comprehensive reporting and trend analysis

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Monitoring System                │
├─────────────────────────────────────────────────────────────────┤
│  Client-Side Components                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Performance     │  │ Gallery         │  │ Error           │ │
│  │ Monitor         │  │ Tracker         │  │ Correlator      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  React Hooks & Context                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ usePerformance  │  │ Performance     │  │ Performance     │ │
│  │ Monitoring      │  │ Provider        │  │ Dashboard       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Server-Side Components                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Analytics API   │  │ Bundle          │  │ Regression      │ │
│  │ Endpoint        │  │ Analyzer        │  │ Detector        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Features

### 1. Real User Monitoring (RUM)

Track actual user experience with detailed metrics:

```typescript
interface RUMData {
  sessionId: string
  userId?: string
  userAgent: string
  viewport: { width: number; height: number }
  connectionType: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  pageMetrics: PerformanceMetrics
  userJourney: UserInteraction[]
  errors: ErrorEvent[]
  timestamp: number
}
```

### 2. Core Web Vitals Tracking

Monitor Google's Core Web Vitals with performance budgets:

- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **INP (Interaction to Next Paint)**: Target < 200ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **FCP (First Contentful Paint)**: Target < 1.8s
- **TTFB (Time to First Byte)**: Target < 800ms

### 3. Gallery-Specific Metrics

Track ANAM Gallery-specific performance:

```typescript
interface GalleryPerformanceMetrics {
  artworkListLoadTime?: number      // Gallery page load time
  artworkDetailLoadTime?: number    // Individual artwork load time
  searchResponseTime?: number       // Search functionality response
  filterResponseTime?: number       // Filter functionality response
  imageLoadingTime?: number         // High-res image loading
  thumbnailLoadTime?: number        // Thumbnail loading
  artworkModalOpenTime?: number     // Modal interaction time
  scrollPerformance?: number        // Scroll frame rate
}
```

### 4. Performance Budgets

Strict budgets to maintain optimal performance:

```typescript
const PERFORMANCE_BUDGETS = {
  GALLERY_LOAD_TIME: 2000,        // 2 seconds
  ARTWORK_DETAIL_LOAD: 1500,      // 1.5 seconds
  SEARCH_RESPONSE: 300,           // 300ms
  FILTER_RESPONSE: 200,           // 200ms
  IMAGE_LOAD_BUDGET: 3000,        // 3 seconds
  THUMBNAIL_LOAD_BUDGET: 500,     // 500ms
  MODAL_OPEN_BUDGET: 150,         // 150ms
  MAIN_BUNDLE_BUDGET: 300 * 1024, // 300KB
  TOTAL_BUNDLE_BUDGET: 1024 * 1024 // 1MB
}
```

## Implementation Guide

### 1. Basic Setup

Add the performance provider to your app:

```tsx
// app/layout.tsx
import { PerformanceProvider } from '@/components/performance-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PerformanceProvider
          autoStart={true}
          showAlerts={true}
          alertThreshold="medium"
          enableGalleryTracking={true}
          enableErrorCorrelation={true}
          realTimeUpdates={true}
        >
          {children}
        </PerformanceProvider>
      </body>
    </html>
  )
}
```

### 2. Track Gallery Performance

Use the performance context in gallery components:

```tsx
// components/gallery.tsx
import { usePerformanceContext } from '@/components/performance-provider'

export function Gallery() {
  const { trackGalleryLoad, trackImageLoading } = usePerformanceContext()
  
  useEffect(() => {
    const startTime = performance.now()
    
    // Load gallery data
    loadArtworks().then(() => {
      const endTime = performance.now()
      trackGalleryLoad(startTime, endTime, artworks.length)
    })
  }, [])
  
  const handleImageLoad = (imageUrl: string, startTime: number) => {
    const loadTime = performance.now() - startTime
    trackImageLoading(imageUrl, loadTime, 0)
  }
  
  return (
    <div className="gallery">
      {artworks.map(artwork => (
        <ArtworkImage 
          key={artwork.id}
          src={artwork.imageUrl}
          onLoad={(e) => handleImageLoad(artwork.imageUrl, startTime)}
        />
      ))}
    </div>
  )
}
```

### 3. Track Search Performance

Monitor search functionality:

```tsx
// components/search.tsx
import { usePerformanceContext } from '@/components/performance-provider'

export function Search() {
  const { trackSearchPerformance } = usePerformanceContext()
  
  const handleSearch = async (query: string) => {
    const startTime = performance.now()
    
    try {
      const results = await searchArtworks(query)
      const responseTime = performance.now() - startTime
      
      trackSearchPerformance(query, responseTime, results.length)
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search artworks..."
    />
  )
}
```

### 4. Performance Dashboard Integration

Add the dashboard to an admin page:

```tsx
// app/admin/performance/page.tsx
import PerformanceDashboard from '@/components/performance-dashboard'

export default function PerformancePage() {
  return (
    <div className="container mx-auto py-8">
      <PerformanceDashboard 
        realTime={true}
        className="max-w-7xl mx-auto"
      />
    </div>
  )
}
```

### 5. Performance Reports

Generate comprehensive reports:

```tsx
// app/admin/reports/page.tsx
import PerformanceReport from '@/components/performance-report'

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8">
      <PerformanceReport 
        timeRange="24h"
        autoRefresh={true}
        refreshInterval={300000}
      />
    </div>
  )
}
```

## Component Reference

### PerformanceProvider

Main provider component for performance monitoring:

```tsx
<PerformanceProvider
  autoStart={true}                    // Start monitoring automatically
  showAlerts={true}                   // Show toast notifications
  alertThreshold="medium"             // Alert threshold level
  enableGalleryTracking={true}        // Track gallery-specific metrics
  enableErrorCorrelation={true}       // Correlate errors with performance
  enableBundleAnalysis={true}         // Analyze bundle performance
  realTimeUpdates={true}              // Enable real-time updates
  updateInterval={30000}              // Update interval in ms
>
  {children}
</PerformanceProvider>
```

### PerformanceDashboard

Comprehensive performance monitoring dashboard:

```tsx
<PerformanceDashboard 
  compact={false}                     // Compact or full view
  realTime={true}                     // Real-time updates
  className="w-full"                  // Additional CSS classes
/>
```

### PerformanceReport

Detailed performance analytics and reporting:

```tsx
<PerformanceReport 
  timeRange="24h"                     // 1h, 24h, 7d, 30d
  autoRefresh={false}                 // Auto-refresh reports
  refreshInterval={300000}            // Refresh interval in ms
  className="w-full"                  // Additional CSS classes
/>
```

### Hooks

#### usePerformanceMonitoring

Primary hook for performance monitoring:

```tsx
const {
  metrics,                            // Current performance metrics
  score,                              // Overall performance score
  alerts,                             // Performance alerts
  isMonitoring,                       // Monitoring status
  lastUpdated,                        // Last update timestamp
  
  startMonitoring,                    // Start monitoring
  stopMonitoring,                     // Stop monitoring
  clearAlerts,                        // Clear alerts
  
  trackGalleryLoad,                   // Track gallery loading
  trackArtworkDetail,                 // Track artwork details
  trackSearchPerformance,             // Track search performance
  trackImageLoading,                  // Track image loading
  
  trackError                          // Track errors
} = usePerformanceMonitoring({
  autoStart: true,
  realTimeUpdates: true,
  enableGalleryTracking: true
})
```

#### useWebVitals

Track Core Web Vitals only:

```tsx
const { lcp, inp, cls, fcp, ttfb } = useWebVitals()
```

#### usePerformanceMeasurement

Measure custom performance metrics:

```tsx
const { startMeasure, endMeasure, measure } = usePerformanceMeasurement()

// Method 1: Manual measurement
startMeasure('gallery-load')
// ... perform operation
const duration = endMeasure('gallery-load')

// Method 2: Automatic measurement
const { result, duration } = await measure('search-operation', async () => {
  return await searchArtworks(query)
})
```

## API Reference

### Performance Analytics Endpoint

**POST /api/performance/analytics**

Submit performance data:

```typescript
// Submit metrics
fetch('/api/performance/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom-performance-metrics',
    data: {
      metrics: { lcp: 2500, inp: 150 },
      userAgent: navigator.userAgent,
      viewport: { width: 1920, height: 1080 },
      timestamp: Date.now()
    }
  })
})

// Submit alert
fetch('/api/performance/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom-performance-alert',
    data: {
      severity: 'high',
      metric: 'lcp',
      value: 4500,
      threshold: 2500,
      message: 'LCP exceeded threshold'
    }
  })
})
```

**GET /api/performance/analytics**

Retrieve performance data:

```typescript
// Get summary
const summary = await fetch('/api/performance/analytics?type=summary&timeRange=24h')

// Get detailed metrics
const metrics = await fetch('/api/performance/analytics?type=metrics&limit=100')

// Get alerts
const alerts = await fetch('/api/performance/analytics?type=alerts&timeRange=1h')
```

## Performance Budgets

### Core Web Vitals Budgets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| INP | ≤ 200ms | 200ms - 500ms | > 500ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB | ≤ 800ms | 800ms - 1.8s | > 1.8s |

### Gallery-Specific Budgets

| Metric | Budget | Critical Threshold |
|--------|--------|--------------------|
| Gallery Load Time | 2.0s | 3.0s |
| Artwork Detail Load | 1.5s | 2.5s |
| Search Response | 300ms | 500ms |
| Filter Response | 200ms | 400ms |
| Image Loading | 3.0s | 5.0s |
| Thumbnail Loading | 500ms | 1.0s |
| Modal Open Time | 150ms | 300ms |

### Bundle Size Budgets

| Component | Budget | Critical Threshold |
|-----------|--------|--------------------|
| Main Bundle | 300KB | 500KB |
| Chunk Bundle | 100KB | 200KB |
| Total Bundle | 1MB | 2MB |
| Image Assets | 50MB | 100MB |

## Alert System

### Alert Types

1. **Budget Exceeded**: Performance metric exceeds defined budget
2. **Threshold Exceeded**: Metric crosses warning/critical thresholds
3. **Regression Detected**: Performance degradation compared to baseline

### Alert Severity Levels

- **Critical**: Immediate action required, severe user impact
- **High**: Significant performance issue, requires urgent attention
- **Medium**: Performance concern, should be addressed soon
- **Low**: Minor issue, can be addressed in regular maintenance

### Alert Configuration

```typescript
const alertConfig = {
  showAlerts: true,                   // Enable toast notifications
  alertThreshold: 'medium',           // Minimum severity to show
  criticalAlertCallback: (alert) => {
    // Handle critical alerts
    console.error('Critical performance issue:', alert)
    // Send to monitoring service
    sendToMonitoring(alert)
  }
}
```

## Analytics Dashboard

### Dashboard Features

1. **Real-Time Metrics**: Live performance data updates
2. **Historical Trends**: Performance trends over time
3. **Device Breakdown**: Performance by device type
4. **Network Analysis**: Performance by connection type
5. **Error Correlation**: Relationship between errors and performance
6. **Bundle Analysis**: JavaScript bundle size and optimization
7. **User Journey**: User interaction patterns and performance impact

### Dashboard Tabs

- **Overview**: Key metrics and performance score
- **Core Web Vitals**: Detailed Web Vitals analysis
- **Gallery Metrics**: ANAM-specific performance data
- **Bundle Analysis**: JavaScript bundle insights
- **Alerts & Journey**: Performance alerts and user interactions

## Best Practices

### 1. Performance Monitoring

- **Start Early**: Begin monitoring from development phase
- **Set Realistic Budgets**: Balance performance with functionality
- **Monitor Continuously**: Use real-time monitoring in production
- **Act on Alerts**: Respond promptly to performance degradation

### 2. Gallery Optimization

- **Lazy Loading**: Load images only when visible
- **Progressive Enhancement**: Load low-quality previews first
- **Virtual Scrolling**: Render only visible items in large galleries
- **Caching Strategy**: Cache frequently accessed artworks

### 3. Bundle Optimization

- **Code Splitting**: Split code by routes and features
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Load features on demand
- **Bundle Analysis**: Regular bundle size monitoring

### 4. Error Handling

- **Graceful Degradation**: Maintain functionality during errors
- **Error Boundaries**: Isolate component failures
- **Performance Correlation**: Track error-performance relationships
- **User Experience**: Minimize error impact on users

## Troubleshooting

### Common Issues

#### High LCP Scores

**Symptoms**: LCP > 4 seconds
**Causes**: Large images, slow server response, render-blocking resources
**Solutions**:
- Optimize image sizes and formats
- Implement critical CSS inlining
- Use CDN for static assets
- Preload critical resources

#### Poor Search Performance

**Symptoms**: Search response > 500ms
**Causes**: Inefficient search algorithm, large datasets, network latency
**Solutions**:
- Implement search debouncing
- Add result caching
- Optimize search indexing
- Consider server-side search

#### Bundle Size Violations

**Symptoms**: Total bundle > 2MB
**Causes**: Large dependencies, unnecessary code, poor code splitting
**Solutions**:
- Analyze bundle composition
- Remove unused dependencies
- Implement dynamic imports
- Optimize vendor chunks

#### Memory Leaks

**Symptoms**: Memory usage increasing over time
**Causes**: Event listeners, DOM references, large object caches
**Solutions**:
- Clean up event listeners
- Remove DOM references
- Implement cache size limits
- Monitor memory usage patterns

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable performance debugging
localStorage.setItem('performance-debug', 'true')

// This will enable:
// - Detailed console logging
// - Performance mark/measure calls
// - Alert debugging information
// - Memory usage tracking
```

### Performance Profiling

Use browser dev tools for deep analysis:

1. **Chrome DevTools Performance Tab**:
   - Record performance during gallery navigation
   - Analyze main thread activity
   - Identify bottlenecks

2. **Lighthouse Integration**:
   - Run Lighthouse audits regularly
   - Compare with RUM data
   - Follow optimization recommendations

3. **Bundle Analyzer**:
   - Use webpack-bundle-analyzer
   - Identify large dependencies
   - Optimize import strategies

## Conclusion

The ANAM Gallery performance monitoring system provides comprehensive insights into application performance, enabling data-driven optimization decisions. By combining industry-standard metrics with gallery-specific tracking, it ensures optimal user experience across all devices and network conditions.

Regular monitoring, prompt response to alerts, and continuous optimization based on real user data will help maintain excellent performance standards for the ANAM Gallery application.