'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  blurDataURL?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  blurDataURL,
  priority = false,
  sizes = '100vw',
  onLoad,
  onError,
  fallbackSrc
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setIsError(false)
    onLoad?.()
  }, [onLoad])

  // Handle image error
  const handleError = useCallback(() => {
    setIsError(true)
    setIsLoading(false)
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
    } else {
      onError?.()
    }
  }, [fallbackSrc, currentSrc, onError])

  // Enhanced intersection observer for better Core Web Vitals
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              // Preload image to improve LCP
              const preloadImg = new Image()
              preloadImg.onload = () => {
                img.src = img.dataset.src!
                img.removeAttribute('data-src')
              }
              preloadImg.src = img.dataset.src
              observer.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: '100px 0px', // Increased for better UX
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  // Generate placeholder with blur effect
  const generatePlaceholder = () => {
    if (blurDataURL) {
      return blurDataURL
    }
    
    // Only generate canvas placeholder on client side
    if (typeof window === 'undefined') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo='
    }
    
    try {
      // Generate a simple gradient placeholder
      const canvas = document.createElement('canvas')
      canvas.width = 40
      canvas.height = 30
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 40, 30)
        gradient.addColorStop(0, '#f3f4f6')
        gradient.addColorStop(1, '#e5e7eb')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 40, 30)
        return canvas.toDataURL()
      }
    } catch (error) {
      console.warn('Error generating placeholder:', error)
    }
    
    // Fallback SVG placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo='
  }

  const placeholderSrc = generatePlaceholder()

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/blur layer */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={`absolute inset-0 ${placeholderClassName}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Blur placeholder */}
            <img
              src={placeholderSrc}
              alt=""
              className="w-full h-full object-cover filter blur-md scale-110"
              aria-hidden="true"
            />
            
            {/* Loading overlay */}
            <div className="absolute inset-0 bg-paper/20 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 border-2 border-ink/30 border-t-ink rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main image */}
      <motion.img
        ref={imgRef}
        src={priority ? currentSrc : undefined}
        data-src={priority ? undefined : currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Error state */}
      <AnimatePresence>
        {isError && !isLoading && (
          <motion.div
            className="absolute inset-0 bg-paper-warm border-2 border-ink/20 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center p-4">
              <div className="w-12 h-12 border-2 border-ink/30 rounded-full mb-2 flex items-center justify-center mx-auto">
                <span className="text-ink/60">📷</span>
              </div>
              <p className="font-display text-ink-light text-sm">
                이미지를 불러올 수 없습니다
              </p>
              <button
                onClick={() => {
                  setIsError(false)
                  setIsLoading(true)
                  setCurrentSrc(src)
                }}
                className="mt-2 text-xs text-gold hover:text-ink transition-colors duration-300"
              >
                다시 시도
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Optimized artwork image component
interface ArtworkImageProps extends Omit<ProgressiveImageProps, 'src' | 'alt'> {
  artwork: {
    imageUrl?: string
    number?: number | string
    slug?: string
    title: string
    year: number
    id?: string
  }
  size?: 'thumb' | 'medium' | 'large'
  quality?: number
  alt?: string
}

export function ArtworkImage({ 
  artwork, 
  size = 'medium', 
  quality = 75,
  alt,
  ...props 
}: ArtworkImageProps) {
  // Generate optimized image URLs with enhanced error handling
  const generateImageUrl = (artwork: ArtworkImageProps['artwork'], size: string) => {
    try {
      // 우선순위 1: slug에서 숫자 추출 (new format: "01", "02", etc.)
      if (artwork.slug && typeof artwork.slug === 'string') {
        // Try direct number format first (01, 02, 03...)
        if (/^\d{1,2}$/.test(artwork.slug)) {
          const paddedNumber = artwork.slug.padStart(2, '0')
          return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
        }
        // Try anam-XX format
        const numberMatch = artwork.slug.match(/anam-(\d+)/)
        if (numberMatch) {
          const paddedNumber = numberMatch[1].padStart(2, '0')
          return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
        }
      }
      
      // 우선순위 2: number 필드 사용
      if (artwork.number) {
        const paddedNumber = String(artwork.number).padStart(2, '0')
        return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
      }
      
      // 우선순위 3: id 필드에서 숫자 추출
      if (artwork.id && typeof artwork.id === 'string') {
        const idNumber = parseInt(artwork.id)
        if (!isNaN(idNumber)) {
          const paddedNumber = idNumber.toString().padStart(2, '0')
          return `/Images/Artworks/optimized/${paddedNumber}/${paddedNumber}-${size}.jpg`
        }
      }
      
      console.warn('Could not generate image URL for artwork:', {
        title: artwork.title,
        slug: artwork.slug,
        number: artwork.number,
        id: artwork.id
      })
      // Fallback to legacy system or placeholder
      return artwork.imageUrl || '/images/placeholder-artwork.svg'
    } catch (error) {
      console.error('Error generating image URL:', error, 'for artwork:', artwork.title)
      return '/images/placeholder-artwork.svg'
    }
  }

  const src = generateImageUrl(artwork, size)
  const fallbackSrc = generateImageUrl(artwork, 'thumb')
  
  // Enhanced blur data URL with Korean traditional colors (SSR-safe)
  const generateBlurDataURL = () => {
    const svgString = `
      <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(254,252,232);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(120,113,108);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="serif" font-size="14" fill="#6b7280">
          ${artwork.title || 'Loading...'}
        </text>
      </svg>
    `.trim()
    
    // Use Buffer.from for Node.js SSR compatibility
    if (typeof window === 'undefined') {
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`
    } else {
      return `data:image/svg+xml;base64,${btoa(svgString)}`
    }
  }

  const blurDataURL = generateBlurDataURL()

  return (
    <ProgressiveImage
      src={src}
      alt={alt || `${artwork.title} (${artwork.year})`}
      blurDataURL={blurDataURL}
      fallbackSrc={fallbackSrc !== src ? fallbackSrc : undefined}
      {...props}
    />
  )
}