'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Artwork } from '@/lib/types'
import { useGalleryStore, useArtworks } from '@/lib/stores/gallery-store'
import { ArtworkImage } from '@/components/common/ProgressiveImage'
import { useArtworkSwipe } from '@/hooks/useSwipeGestures'

interface ArtworkModalProps {
  artwork: Artwork
  onClose: () => void
  artworks: Artwork[]
  onArtworkChange: (artwork: Artwork) => void
}

export function ArtworkModal({ artwork, onClose, artworks, onArtworkChange }: ArtworkModalProps) {
  // Use store for navigation
  const filteredArtworks = useArtworks()
  const { nextArtwork, previousArtwork, currentArtworkIndex } = useGalleryStore()
  
  // Touch gesture support
  const swipeRef = useArtworkSwipe(nextArtwork, previousArtwork, onClose)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          previousArtwork()
          break
        case 'ArrowRight':
          nextArtwork()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal content */}
      <motion.div
        className="
          relative bg-paper border-4 border-ink shadow-brutal-strong
          max-w-4xl w-full max-h-[90vh] overflow-hidden
          flex flex-col
        "
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, type: 'spring' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-zen-md border-b-2 border-ink bg-paper-warm">
          <div>
            <h2 className="font-calligraphy font-bold text-ink text-lg md:text-xl">
              {artwork.title}
            </h2>
            <p className="font-display text-ink-light text-sm">
              {artwork.year} • {artwork.medium}
              {artwork.dimensions && ` • ${artwork.dimensions}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-zen-sm">
            {/* Navigation info */}
            <span className="font-display text-ink-light text-sm hidden sm:block">
              {currentArtworkIndex + 1} / {filteredArtworks.length}
            </span>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="
                w-8 h-8 bg-ink text-paper hover:bg-gold
                transition-colors duration-300
                flex items-center justify-center
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Artwork display */}
        <div 
          className="flex-1 flex items-center justify-center p-zen-lg bg-paper-cream"
          ref={swipeRef}
        >
          <div className="relative max-w-2xl w-full">
            {/* High-quality artwork image */}
            <motion.div
              className="aspect-square shadow-brutal-sm overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ArtworkImage
                artwork={artwork}
                size="large"
                className="w-full h-full"
                placeholderClassName="bg-paper border-2 border-ink/20"
                priority={true}
              />
            </motion.div>

            {/* Navigation arrows */}
            <button
              onClick={previousArtwork}
              className="
                absolute left-4 top-1/2 transform -translate-y-1/2
                w-10 h-10 bg-ink/80 text-paper hover:bg-gold
                transition-colors duration-300
                flex items-center justify-center
                backdrop-blur-sm
              "
            >
              ←
            </button>
            
            <button
              onClick={nextArtwork}
              className="
                absolute right-4 top-1/2 transform -translate-y-1/2
                w-10 h-10 bg-ink/80 text-paper hover:bg-gold
                transition-colors duration-300
                flex items-center justify-center
                backdrop-blur-sm
              "
            >
              →
            </button>
          </div>
        </div>

        {/* Artwork details */}
        <div className="p-zen-md border-t-2 border-ink bg-paper">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-zen-md">
            <div>
              <h4 className="font-display font-semibold text-ink mb-zen-sm">작품 정보</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">제목:</span> {artwork.title}</p>
                <p><span className="font-medium">연도:</span> {artwork.year}</p>
                <p><span className="font-medium">재료:</span> {artwork.medium}</p>
                {artwork.dimensions && (
                  <p><span className="font-medium">크기:</span> {artwork.dimensions}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-ink mb-zen-sm">작품 설명</h4>
              <p className="font-display text-ink-light text-sm leading-relaxed">
                {artwork.description || '전통 서예의 깊이와 현대적 감각이 어우러진 작품입니다.'}
              </p>
              
              {artwork.artistNote && (
                <div className="mt-zen-sm">
                  <h5 className="font-display font-medium text-ink text-xs mb-1">작가 노트</h5>
                  <p className="font-display text-ink-light text-xs leading-relaxed">
                    {artwork.artistNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail navigation */}
        <div className="px-zen-md py-zen-sm border-t border-ink/20 bg-paper-warm">
          <div className="flex space-x-2 overflow-x-auto">
            {filteredArtworks.slice(Math.max(0, currentArtworkIndex - 2), currentArtworkIndex + 3).map((art, index) => {
              const actualIndex = Math.max(0, currentArtworkIndex - 2) + index
              return (
                <button
                  key={art.id}
                  onClick={() => onArtworkChange(art)}
                  className={`
                    flex-shrink-0 w-12 h-12 border-2
                    ${art.id === artwork.id ? 'border-gold bg-gold/10' : 'border-ink/20 bg-paper'}
                    hover:border-gold transition-colors duration-300
                    flex items-center justify-center
                  `}
                >
                  <span className="text-xs font-calligraphy">
                    {art.title.substring(0, 1)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}