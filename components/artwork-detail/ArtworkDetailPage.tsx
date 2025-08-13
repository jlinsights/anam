'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Artwork, Artist } from '@/lib/types'
import { ArtworkImage } from '@/components/common/ProgressiveImage'
import { ArtworkErrorBoundary } from '@/components/error-boundary/ArtworkErrorBoundary'

interface ArtworkDetailPageProps {
  artwork: Artwork
  allArtworks: Artwork[]
  artist?: Artist
}

export function ArtworkDetailPage({ artwork, allArtworks, artist }: ArtworkDetailPageProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)

  // Find related artworks (same year or medium)
  const relatedArtworks = useMemo(() => {
    return allArtworks
      .filter(work => 
        work.id !== artwork.id && 
        (work.year === artwork.year || work.medium === artwork.medium)
      )
      .slice(0, 6)
  }, [allArtworks, artwork])

  // Find current artwork index for navigation
  const currentIndex = useMemo(() => {
    return allArtworks.findIndex(work => work.id === artwork.id)
  }, [allArtworks, artwork])

  const previousArtwork = currentIndex > 0 ? allArtworks[currentIndex - 1] : null
  const nextArtwork = currentIndex < allArtworks.length - 1 ? allArtworks[currentIndex + 1] : null

  return (
    <ArtworkErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b-2 border-gray-800 dark:border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-900 dark:text-white hover:text-yellow-600 transition-colors duration-300"
            >
              <span className="mr-2">←</span>
              <span className="font-display font-medium">뒤로가기</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {previousArtwork && (
                <Link 
                  href={`/gallery/${previousArtwork.slug}`}
                  className="p-2 text-gray-900 dark:text-white hover:text-yellow-600 transition-colors duration-300"
                  title="이전 작품"
                >
                  ←
                </Link>
              )}
              <span className="font-display text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {allArtworks.length}
              </span>
              {nextArtwork && (
                <Link 
                  href={`/gallery/${nextArtwork.slug}`}
                  className="p-2 text-gray-900 dark:text-white hover:text-yellow-600 transition-colors duration-300"
                  title="다음 작품"
                >
                  →
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Main artwork section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Artwork image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="
              relative aspect-square bg-amber-50 dark:bg-amber-900 border-4 border-gray-900 dark:border-gray-100
              shadow-lg hover:shadow-xl
              transition-all duration-500
              overflow-hidden
            ">
              <ArtworkImage
                artwork={artwork}
                size="large"
                className="absolute inset-4"
                priority={true}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  console.warn('Failed to load artwork image for:', artwork.title)
                  setImageLoaded(true) // Hide loading state even on error
                }}
                fallbackSrc="/Images/placeholder.jpg"
              />
              
              {/* Loading overlay */}
              <AnimatePresence>
                {!imageLoaded && (
                  <motion.div
                    className="absolute inset-4 bg-orange-50 dark:bg-orange-900 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-display text-gray-600 dark:text-gray-400">작품 이미지 로딩중...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Artwork information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <h1 className="font-calligraphy font-bold text-gray-900 dark:text-white text-3xl md:text-4xl mb-4">
                {artwork.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-lg font-display text-gray-600 dark:text-gray-400 mb-6">
                <span>{artwork.year}년</span>
                {artwork.medium && (
                  <>
                    <span>•</span>
                    <span>{artwork.medium}</span>
                  </>
                )}
                {artwork.dimensions && (
                  <>
                    <span>•</span>
                    <span>{artwork.dimensions}</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {artwork.description && (
              <motion.div
                className="bg-orange-50 dark:bg-orange-900 p-8 border-l-4 border-yellow-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">작품 해설</h3>
                <p className="font-display text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </motion.div>
            )}

            {/* Artist notes */}
            {artwork.artistNote && (
              <motion.div
                className="bg-amber-50 dark:bg-amber-900 p-8 border-2 border-gray-900/20 dark:border-gray-100/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">작가 노트</h3>
                <blockquote className="font-display text-gray-600 dark:text-gray-400 italic leading-relaxed">
                  "{artwork.artistNote}"
                </blockquote>
                {artist?.name && (
                  <cite className="block mt-4 text-sm text-gray-600 dark:text-gray-400">
                    - {artist.name}
                  </cite>
                )}
              </motion.div>
            )}

            {/* Technical details */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-gray-900 dark:text-white">작품 정보</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div><strong>제작연도:</strong> {artwork.year}년</div>
                  {artwork.medium && <div><strong>재료:</strong> {artwork.medium}</div>}
                  {artwork.dimensions && <div><strong>크기:</strong> {artwork.dimensions}</div>}
                  {artwork.price && <div><strong>가격:</strong> {artwork.price}</div>}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-gray-900 dark:text-white">수집 정보</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div><strong>작품 ID:</strong> {artwork.id}</div>
                  <div><strong>소장:</strong> 개인 소장</div>
                  <div><strong>상태:</strong> 양호</div>
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="pt-2">
                      <strong>태그:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {artwork.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-yellow-600/20 text-gray-900 dark:text-white text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <button className="
                px-8 py-4
                bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-display font-bold
                hover:bg-yellow-600 hover:text-gray-900
                transition-all duration-300
                shadow-lg hover:shadow-xl
                transform hover:-translate-x-1 hover:-translate-y-1
                border-4 border-gray-900 dark:border-gray-100 hover:border-yellow-600
              ">
                고화질 이미지 보기
              </button>
              
              <Link 
                href="/#artist"
                className="
                  inline-block text-center px-8 py-4
                  bg-white dark:bg-gray-800 border-4 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white font-display font-bold
                  hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900
                  transition-all duration-300
                  shadow-lg hover:shadow-xl
                  transform hover:translate-x-1 hover:translate-y-1
                "
              >
                작가 소개 보기
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Related artworks */}
        {relatedArtworks.length > 0 && (
          <motion.section
            className="mt-24 pt-16 border-t-2 border-gray-900/20 dark:border-gray-100/20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="font-calligraphy font-bold text-gray-900 dark:text-white text-2xl mb-8 text-center">
              관련 작품
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {relatedArtworks.map((relatedArtwork, index) => (
                <motion.div
                  key={relatedArtwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                >
                  <Link 
                    href={`/gallery/${relatedArtwork.slug}`}
                    className="block group"
                  >
                    <div className="
                      relative aspect-square bg-amber-50 dark:bg-amber-900 border-2 border-gray-900 dark:border-gray-100
                      shadow-md group-hover:shadow-lg
                      transition-all duration-300
                      group-hover:-translate-x-1 group-hover:-translate-y-1
                      overflow-hidden
                    ">
                      <ArtworkImage
                        artwork={relatedArtwork}
                        size="thumb"
                        className="absolute inset-2"
                      />
                      
                      <div className="
                        absolute inset-0 bg-yellow-600/10 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300
                        flex items-center justify-center
                      ">
                        <span className="font-display text-gray-900 dark:text-white text-xs">보기</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-center">
                      <p className="font-display text-gray-900 dark:text-white text-sm font-medium truncate">
                        {relatedArtwork.title}
                      </p>
                      <p className="font-display text-gray-600 dark:text-gray-400 text-xs">
                        {relatedArtwork.year}년
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
    </ArtworkErrorBoundary>
  )
}