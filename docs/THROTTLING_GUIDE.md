# ANAM Gallery Throttling Implementation Guide

This guide documents the comprehensive throttling implementation for performance-sensitive handlers throughout the ANAM Gallery application, ensuring smooth 60fps performance.

## Overview

The throttling system provides optimized performance for:
- Mouse move handlers (like mouse tracking in HeroSection)
- Scroll handlers for infinite loading
- Resize handlers for responsive components
- Search input handlers for filter components
- API calls and heavy computations

## Core Utilities

### 1. Throttle Functions (`/lib/utils/throttle.ts`)

```typescript
import { throttle, throttleAnimationFrame, THROTTLE_DELAYS } from '@/lib/utils/throttle'

// Basic throttling
const throttledFn = throttle(originalFunction, 300)

// Animation frame throttling (optimal for visual updates)
const smoothFn = throttleAnimationFrame(visualUpdateFunction)

// Pre-configured delays for common use cases
const delays = THROTTLE_DELAYS // { MOUSE_MOVE: 16, SCROLL: 16, RESIZE: 100, SEARCH: 300, API: 500 }
```

### 2. React Hooks (`/lib/hooks/use-throttled-handlers.ts`)

```typescript
import {
  useThrottledMouseMove,
  useThrottledScroll,
  useThrottledResize,
  useThrottledSearch,
  useThrottledIntersection
} from '@/lib/hooks/use-throttled-handlers'

// Mouse move throttling
const handleMouseMove = useThrottledMouseMove((event) => {
  // Your mouse move logic
}, [dependencies])

// Search input throttling
const handleSearch = useThrottledSearch((query) => {
  // Your search logic
}, 300, [dependencies])
```

## Implementation Examples

### 1. Hero Section Mouse Tracking

**Before (components/sections/HeroSection.tsx):**
```typescript
const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  // Unthrottled - fires for every mouse move
  const rect = heroRef.current.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  setMousePosition({ x, y })
}, [])
```

**After:**
```typescript
const handleMouseMove = useThrottledMouseMove(
  useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Throttled to 60fps - smooth performance
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }, []),
  []
)
```

### 2. Search Filter Component

**Before (components/search-filter.tsx):**
```typescript
onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
```

**After:**
```typescript
const throttledSearchUpdate = useThrottledSearch(
  (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }))
  },
  300, // 300ms delay for search input
  []
)

// In JSX:
onChange={(e) => throttledSearchUpdate(e.target.value)}
```

### 3. Gallery Infinite Scroll

**Implementation (components/throttled-infinite-scroll.tsx):**
```typescript
import { ThrottledInfiniteScroll } from '@/components/throttled-infinite-scroll'

function Gallery() {
  return (
    <ThrottledInfiniteScroll
      hasMore={hasMore}
      isLoading={isLoading}
      onLoadMore={loadMore}
      threshold={200}
    >
      {/* Your gallery content */}
    </ThrottledInfiniteScroll>
  )
}
```

### 4. Responsive Components

**Implementation (components/throttled-responsive-component.tsx):**
```typescript
import { useThrottledResponsive, ThrottledResponsiveGrid } from '@/components/throttled-responsive-component'

function ResponsiveGallery() {
  const { breakpoint } = useThrottledResponsive()
  
  return (
    <ThrottledResponsiveGrid
      columnConfig={{
        mobile: 1,
        tablet: 2,
        desktop: 3,
        wide: 4
      }}
      gap={6}
    >
      {/* Your content */}
    </ThrottledResponsiveGrid>
  )
}
```

## Performance Monitoring

### Development Monitor

```typescript
import { ThrottlePerformanceMonitor } from '@/components/throttle-performance-monitor'

function App() {
  return (
    <div>
      {/* Your app content */}
      <ThrottlePerformanceMonitor 
        isVisible={process.env.NODE_ENV === 'development'}
        position="top-right"
      />
    </div>
  )
}
```

### Performance Tracking Hook

```typescript
import { useThrottlePerformanceTracking } from '@/components/throttle-performance-monitor'

function MyComponent() {
  const { trackRender, trackThrottle } = useThrottlePerformanceTracking('MyComponent')
  
  useEffect(() => {
    const endTracking = trackRender()
    return endTracking
  })
  
  const handleThrottledAction = useCallback(() => {
    trackThrottle('userAction', false)
    // Your action logic
  }, [trackThrottle])
}
```

## Throttle Delays Configuration

### Recommended Delays

```typescript
export const THROTTLE_DELAYS = {
  MOUSE_MOVE: 16,    // ~60fps - smooth mouse tracking
  SCROLL: 16,        // ~60fps - smooth scroll handling
  RESIZE: 100,       // 10fps - sufficient for layout updates
  SEARCH: 300,       // Good for user typing experience
  API: 500,          // Reduce server load
  COMPUTATION: 200,  // Balance performance and responsiveness
} as const
```

### Usage Guidelines

- **Mouse events**: Use 16ms (60fps) for smooth visual feedback
- **Scroll events**: Use 16ms for infinite loading, 100ms for heavy operations
- **Resize events**: Use 100ms for layout calculations
- **Search input**: Use 300ms to balance responsiveness with API calls
- **API calls**: Use 500ms to prevent excessive server requests

## Advanced Features

### 1. Virtualized Infinite Scroll

For large datasets (1000+ items):
```typescript
import { VirtualizedInfiniteScroll } from '@/components/throttled-infinite-scroll'

<VirtualizedInfiniteScroll
  items={largeDataset}
  itemHeight={200}
  renderItem={(item, index) => <ItemComponent item={item} />}
  containerHeight={600}
  hasMore={hasMore}
  isLoading={isLoading}
  onLoadMore={loadMore}
/>
```

### 2. Monitored Throttling

Track performance metrics:
```typescript
import { throttleWithMonitoring } from '@/lib/utils/throttle'

const monitoredHandler = throttleWithMonitoring(
  originalHandler,
  300,
  'SearchHandler'
)
```

### 3. Higher-Order Component

Apply throttling to entire components:
```typescript
import { withThrottle } from '@/lib/utils/throttle'

const ThrottledComponent = withThrottle(MyComponent, {
  onMouseMove: 16,
  onScroll: 100,
  onResize: 100
})
```

## Performance Benefits

### Before Implementation
- Unthrottled mouse moves: ~1000+ calls/second
- Unthrottled search: API call on every keystroke
- Unthrottled scroll: ~300+ calls/second
- Frame drops during intensive interactions

### After Implementation
- Mouse moves: ~60 calls/second (60fps)
- Search: Debounced to reasonable intervals
- Scroll: Optimized for smooth infinite loading
- Consistent 60fps performance
- Reduced server load and improved UX

## Troubleshooting

### Common Issues

1. **Throttled function not working**
   - Ensure dependencies array is correct
   - Check if function is being recreated on every render

2. **Performance still poor**
   - Verify throttle delays are appropriate
   - Check for other performance bottlenecks
   - Use performance monitor to identify issues

3. **Search feels unresponsive**
   - Reduce throttle delay for search
   - Consider showing loading states
   - Implement debouncing for final API calls

### Debugging

Enable performance monitoring in development:
```typescript
// Enable detailed logging
const monitor = ThrottleMonitor.getInstance()
console.log(monitor.getMetrics())

// Check frame rate
const fps = measureFrameRate() // Custom utility
console.log(`Current FPS: ${fps}`)
```

## Best Practices

1. **Choose appropriate delays**: Use THROTTLE_DELAYS constants
2. **Monitor performance**: Use development tools to track metrics
3. **Test on slower devices**: Ensure smooth performance across devices
4. **Combine with other optimizations**: Use alongside React.memo, useMemo
5. **Clean up properly**: Throttled functions auto-cleanup, but verify
6. **Profile before optimizing**: Measure actual performance impact

## Browser Compatibility

- Modern browsers: Full support with requestAnimationFrame
- Older browsers: Graceful degradation to setTimeout
- Mobile: Optimized for touch events and mobile performance
- Safari: Tested for WebKit-specific behavior

## Migration Guide

### From Unthrottled to Throttled

1. Identify performance-sensitive handlers
2. Replace with appropriate throttled versions
3. Test performance improvements
4. Monitor and adjust delays as needed

### From Custom Throttling

1. Replace custom implementations with utility functions
2. Use consistent delay configurations
3. Add performance monitoring
4. Verify improvements with metrics

## Future Enhancements

- Adaptive throttling based on device performance
- Machine learning-based delay optimization
- Automatic performance regression detection
- Integration with Core Web Vitals monitoring