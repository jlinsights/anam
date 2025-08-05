# Changelog

All notable changes to the ANAM Gallery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-08-04

### Added

- Advanced image optimization system with WebP/AVIF support for 58 artwork
  images
- Multi-format image generation (JPEG, WebP, AVIF) with 3 responsive sizes
  (thumb, medium, large)
- New `OptimizedArtworkImage` component with lazy loading and error handling
- Gallery-specific optimized image components (`GalleryArtworkImage`,
  `DetailArtworkImage`)
- `imageId` field to Artwork interface for optimized image system integration
- Intersection Observer-based lazy loading for improved performance
- Responsive image sources with automatic format selection
- Image optimization script achieving 95-99% file size reduction

### Changed

- Updated `ArtworkCard` and `ZenBrutalistArtworkCard` to use optimized image
  system
- Enhanced fallback system for artworks without optimized images
- Improved image loading performance with progressive enhancement

### Fixed

- Image loading performance issues in gallery pages
- Large image file sizes causing slow page load times

## [0.1.0] - 2025-08-03

### Added

- Initial ANAM Gallery project setup with Next.js 15.3.3
- Zen Brutalism Foundation design system with 3-phase evolution
- Gallery page with 58 Korean calligraphy artworks
- Artist profile page and individual artwork detail pages
- Airtable CMS integration with fallback system
- Responsive design with dark/light theme support
- Interactive mouse tracking and glass morphism effects
- Traditional Korean color palette and typography system
- Demo pages showcasing design system evolution
