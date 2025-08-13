# Error Boundary Usage Guide for ANAM Gallery

This guide demonstrates how to use the comprehensive error boundary system implemented for the ANAM Gallery application.

## Overview

The ANAM Gallery application now includes specialized error boundaries for different types of errors:

- **RootErrorBoundary**: Application-level errors, chunk loading failures, critical JavaScript errors
- **GalleryErrorBoundary**: Gallery component errors, artwork listing issues
- **ApiErrorBoundary**: API/data fetching errors with retry logic
- **ImageErrorBoundary**: Image loading errors with progressive retry
- **ArtworkErrorBoundary**: Artwork-specific errors (existing, enhanced)

All error boundaries follow the Zen Brutalism design system and provide user-friendly Korean messages.

## Features

### 🛡️ Comprehensive Error Coverage
- **Root Level**: Application crashes, chunk loading, JavaScript errors
- **Gallery Level**: Gallery rendering, artwork listing failures
- **API Level**: Network issues, server errors, timeout handling
- **Image Level**: Image loading failures, broken links

### 🔄 Intelligent Retry Logic
- **Exponential Backoff**: Progressive retry delays
- **Context-Aware Retries**: Different strategies for different error types
- **Retry Limits**: Prevents infinite retry loops
- **Manual Reset**: User-initiated retry options

### 📊 Error Tracking
- **Comprehensive Logging**: Detailed error context and metadata
- **Sentry Integration**: Automatic error reporting
- **Development Info**: Detailed stack traces in development mode
- **Error IDs**: Unique identifiers for support

### 🎨 Zen Brutalism Design
- **Korean Messages**: Culturally appropriate error messaging
- **Consistent Styling**: Matches application design system
- **Accessibility**: Proper focus management and ARIA labels
- **Responsive**: Works on all device sizes

## Quick Start

### 1. Root Level Protection

```tsx
// app/layout.tsx or components/client-layout.tsx
import { RootErrorBoundary, useGlobalErrorHandler } from '@/components/error-boundary'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // Set up global error handlers
  useGlobalErrorHandler()
  
  return (
    <RootErrorBoundary>
      <div className='min-h-screen bg-paper text-ink'>
        {children}
      </div>
    </RootErrorBoundary>
  )
}
```

### 2. Gallery Components

```tsx
// components/gallery/GallerySection.tsx
import { GalleryErrorBoundary, ApiErrorBoundary } from '@/components/error-boundary'

export function GallerySection({ artworks }: { artworks: Artwork[] }) {
  return (
    <GalleryErrorBoundary>
      <div className="gallery-container">
        <h2>작품 갤러리</h2>
        
        <ApiErrorBoundary apiContext="artworks">
          <ArtworkGrid artworks={artworks} />
        </ApiErrorBoundary>
      </div>
    </GalleryErrorBoundary>
  )
}
```

### 3. Image Components

```tsx
// components/artwork/ArtworkCard.tsx
import { ImageErrorBoundary } from '@/components/error-boundary'
import { OptimizedArtworkImageWithErrorBoundary } from '@/components/optimized-image-with-error-boundary'

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <div className="artwork-card">
      <OptimizedArtworkImageWithErrorBoundary
        artwork={artwork}
        usage="gallery-grid"
        className="w-full h-64"
      />
      <div className="artwork-info">
        <h3>{artwork.title}</h3>
        <p>{artwork.year}</p>
      </div>
    </div>
  )
}
```

### 4. API Components

```tsx
// components/data/ArtworkLoader.tsx
import { ApiErrorBoundary } from '@/components/error-boundary'

export function ArtworkLoader() {
  return (
    <ApiErrorBoundary 
      apiContext="artworks"
      onError={(error, errorInfo) => {
        console.error('Failed to load artworks:', { error, errorInfo })
      }}
    >
      <ArtworkDataComponent />
    </ApiErrorBoundary>
  )
}
```

## Advanced Usage

### Custom Error Handlers

```tsx
import { GalleryErrorBoundary } from '@/components/error-boundary'
import { captureError } from '@/lib/error-logger'

function CustomGallerySection() {
  const handleGalleryError = (error: Error, errorInfo: ErrorInfo) => {
    // Custom error handling logic
    console.error('Gallery error:', { error, errorInfo })
    
    // Send to analytics
    analytics.track('Gallery Error', {
      error: error.message,
      component: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })
    
    // Send to error tracking
    captureError(error, {
      component: 'CustomGallerySection',
      errorBoundary: 'gallery',
      customContext: 'user-interaction'
    })
  }
  
  return (
    <GalleryErrorBoundary onError={handleGalleryError}>
      <YourGalleryComponent />
    </GalleryErrorBoundary>
  )
}
```

### Custom Fallback UI

```tsx
import { ApiErrorBoundary, ApiErrorFallback } from '@/components/error-boundary'

function CustomApiSection() {
  return (
    <ApiErrorBoundary
      apiContext="exhibitions"
      fallback={
        <div className="custom-error-fallback">
          <h3>전시 정보를 불러올 수 없습니다</h3>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      }
    >
      <ExhibitionList />
    </ApiErrorBoundary>
  )
}
```

### Nested Error Boundaries

```tsx
import { 
  GalleryErrorBoundary, 
  ApiErrorBoundary, 
  ImageErrorBoundary 
} from '@/components/error-boundary'

function ComprehensiveGalleryPage() {
  return (
    <GalleryErrorBoundary>
      <div className="gallery-page">
        <h1>작품 갤러리</h1>
        
        {/* API data with its own boundary */}
        <ApiErrorBoundary apiContext="artworks">
          <ArtworkMetadata />
        </ApiErrorBoundary>
        
        {/* Image gallery with image-specific boundaries */}
        <div className="artwork-grid">
          {artworks.map(artwork => (
            <ImageErrorBoundary 
              key={artwork.id}
              imageContext="gallery"
              artworkTitle={artwork.title}
            >
              <ArtworkCard artwork={artwork} />
            </ImageErrorBoundary>
          ))}
        </div>
        
        {/* Artist info with API boundary */}
        <ApiErrorBoundary apiContext="artist">
          <ArtistInfo />
        </ApiErrorBoundary>
      </div>
    </GalleryErrorBoundary>
  )
}
```

## Error Boundary Selection Guide

### When to Use Each Boundary

| Component Type | Recommended Boundary | Reason |
|---------------|---------------------|--------|
| Application Root | `RootErrorBoundary` | Catches all unhandled errors |
| Gallery Sections | `GalleryErrorBoundary` | Gallery-specific error handling |
| Data Fetching | `ApiErrorBoundary` | Network/API error handling |
| Image Components | `ImageErrorBoundary` | Image loading error handling |
| Artwork Details | `ArtworkErrorBoundary` | Artwork-specific errors |

### Boundary Hierarchy

```
RootErrorBoundary (Application)
└── GalleryErrorBoundary (Section)
    ├── ApiErrorBoundary (Data)
    └── ImageErrorBoundary (Images)
        └── ArtworkErrorBoundary (Specific Items)
```

## Error Context Types

### API Contexts
- `artworks`: Artwork data fetching
- `artist`: Artist information
- `exhibitions`: Exhibition data
- `data`: Generic data fetching

### Image Contexts
- `artwork`: Individual artwork images
- `gallery`: Gallery grid images
- `thumbnail`: Small preview images
- `featured`: Hero/featured images

## Best Practices

### 1. Granular Boundaries
```tsx
// ✅ Good: Specific boundaries for different concerns
<GalleryErrorBoundary>
  <ApiErrorBoundary apiContext="artworks">
    <ImageErrorBoundary imageContext="gallery">
      <ArtworkGrid />
    </ImageErrorBoundary>
  </ApiErrorBoundary>
</GalleryErrorBoundary>

// ❌ Avoid: Single boundary for everything
<RootErrorBoundary>
  <EverythingInOneComponent />
</RootErrorBoundary>
```

### 2. Contextual Information
```tsx
// ✅ Good: Provide context for better error reporting
<ImageErrorBoundary 
  imageContext="artwork"
  artworkTitle={artwork.title}
  onError={(error, errorInfo) => {
    logError(error, { artwork: artwork.title })
  }}
>
  <ArtworkImage artwork={artwork} />
</ImageErrorBoundary>
```

### 3. Fallback UI
```tsx
// ✅ Good: Meaningful fallback UI
<ApiErrorBoundary
  apiContext="artworks"
  fallback={
    <div className="text-center p-zen-lg">
      <h3>작품을 불러올 수 없습니다</h3>
      <button onClick={retry}>다시 시도</button>
    </div>
  }
>
  <ArtworkList />
</ApiErrorBoundary>
```

### 4. Error Logging
```tsx
// ✅ Good: Comprehensive error logging
const handleError = (error: Error, errorInfo: ErrorInfo) => {
  captureError(error, {
    component: 'GallerySection',
    errorBoundary: 'gallery',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    componentStack: errorInfo.componentStack
  })
}
```

## Testing Error Boundaries

### Development Testing
```tsx
// Add to your component for testing
function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false)
  
  if (shouldError) {
    throw new Error('Test error for boundary testing')
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error (Dev Only)
    </button>
  )
}
```

### Error Simulation
```tsx
// Simulate different error types
function ErrorSimulator() {
  const simulateApiError = () => {
    throw new Error('Simulated API error')
  }
  
  const simulateImageError = () => {
    const img = new Image()
    img.onerror = () => {
      throw new Error('Simulated image error')
    }
    img.src = 'invalid-url'
  }
  
  return process.env.NODE_ENV === 'development' ? (
    <div className="error-simulator">
      <button onClick={simulateApiError}>API Error</button>
      <button onClick={simulateImageError}>Image Error</button>
    </div>
  ) : null
}
```

## Monitoring and Analytics

### Error Tracking Setup
```tsx
// lib/error-tracking.ts
import { captureError } from '@/lib/error-logger'

export function setupErrorTracking() {
  // Track error boundary activations
  window.addEventListener('error-boundary-activated', (event) => {
    const { errorType, component, errorId } = event.detail
    
    analytics.track('Error Boundary Activated', {
      errorType,
      component,
      errorId,
      timestamp: new Date().toISOString()
    })
  })
}
```

### Performance Impact
```tsx
// Monitor error boundary performance
const ErrorBoundaryMetrics = {
  trackRenderTime: (componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime
    console.log(`${componentName} render time: ${renderTime}ms`)
  },
  
  trackErrorResolution: (errorId: string, resolutionMethod: string) => {
    analytics.track('Error Resolved', {
      errorId,
      resolutionMethod,
      timestamp: new Date().toISOString()
    })
  }
}
```

## Troubleshooting

### Common Issues

1. **Error boundaries not catching errors**
   - Ensure errors are thrown during render, not in event handlers
   - Use `ErrorBoundary.componentDidCatch` for async errors

2. **Infinite error loops**
   - Check retry limits in error boundaries
   - Ensure error boundaries don't trigger new errors

3. **Development vs Production behavior**
   - React DevTools may interfere with error boundary testing
   - Test in production builds for accurate behavior

### Debug Mode
```tsx
// Enable debug mode for error boundaries
const DEBUG_ERROR_BOUNDARIES = process.env.NODE_ENV === 'development'

if (DEBUG_ERROR_BOUNDARIES) {
  console.log('Error boundary debug mode enabled')
}
```

This comprehensive error boundary system ensures that the ANAM Gallery application provides a graceful user experience even when unexpected errors occur, while maintaining the aesthetic and cultural appropriateness of the Zen Brutalism design system.