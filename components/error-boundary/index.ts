// Error Boundary Components for ANAM Gallery
export { ArtworkErrorBoundary, ArtworkErrorFallback } from './ArtworkErrorBoundary'
export { GalleryErrorBoundary, GalleryErrorFallback } from './GalleryErrorBoundary'
export { ApiErrorBoundary, ApiErrorFallback } from './ApiErrorBoundary'
export { ImageErrorBoundary, ImageErrorFallback } from './ImageErrorBoundary'
export { RootErrorBoundary, useGlobalErrorHandler } from './RootErrorBoundary'

// Generic error boundary (legacy support)
export { ErrorBoundary } from '../error-boundary'

// Re-export types
export type { Component, ErrorInfo } from 'react'

// Error boundary types for better organization
export type ErrorBoundaryType = 
  | 'root'        // Application-level errors
  | 'gallery'     // Gallery component errors
  | 'api'         // API/data fetching errors
  | 'image'       // Image loading errors
  | 'artwork'     // Artwork-specific errors

// Error context types
export interface ErrorContext {
  component: string
  errorId?: string
  retryCount?: number
  errorBoundary: ErrorBoundaryType
  timestamp: string
  [key: string]: any
}

// Helper function to get appropriate error boundary for context
export function getErrorBoundaryForContext(context: string) {
  // Import the components locally to avoid circular dependencies
  const {
    GalleryErrorBoundary: Gallery,
    ApiErrorBoundary: Api,
    ImageErrorBoundary: Image,
    ArtworkErrorBoundary: Artwork,
    RootErrorBoundary: Root
  } = require('./index')
  
  switch (context) {
    case 'gallery':
    case 'artworks':
    case 'gallery-grid':
      return Gallery
    case 'api':
    case 'data':
    case 'fetch':
      return Api
    case 'image':
    case 'artwork-image':
    case 'gallery-image':
      return Image
    case 'artwork':
    case 'artwork-detail':
      return Artwork
    default:
      return Root
  }
}