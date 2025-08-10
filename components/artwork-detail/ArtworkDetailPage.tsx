'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Artwork, Artist } from '@/lib/types'
import { ArtworkImage } from '@/components/common/ProgressiveImage'

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
    <div className="min-h-screen bg-paper">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-zen-md py-zen-sm">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-ink hover:text-gold transition-colors duration-300"
            >
              <span className="mr-2">←</span>
              <span className="font-display font-medium">뒤로가기</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {previousArtwork && (
                <Link 
                  href={`/gallery/${previousArtwork.slug}`}
                  className="p-2 text-ink hover:text-gold transition-colors duration-300"
                  title="이전 작품"
                >
                  ←
                </Link>
              )}
              <span className="font-display text-sm text-ink-light">
                {currentIndex + 1} / {allArtworks.length}
              </span>
              {nextArtwork && (
                <Link 
                  href={`/gallery/${nextArtwork.slug}`}
                  className="p-2 text-ink hover:text-gold transition-colors duration-300"
                  title="다음 작품"
                >
                  →
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-zen-md py-zen-xl">
        {/* Main artwork section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-xl items-start">
          {/* Artwork image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="
              relative aspect-square bg-paper-cream border-4 border-ink
              shadow-brutal hover:shadow-brutal-strong
              transition-all duration-500
              overflow-hidden
            ">
              <ArtworkImage
                artwork={artwork}
                size="large"
                className="absolute inset-4"
                priority={true}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Loading overlay */}
              <AnimatePresence>
                {!imageLoaded && (
                  <motion.div
                    className="absolute inset-4 bg-paper-warm flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-display text-ink-light">작품 이미지 로딩중...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Artwork information */}
          <motion.div
            className="space-y-zen-lg"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <h1 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
                {artwork.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-lg font-display text-ink-light mb-zen-md">
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
                className="bg-paper-warm p-zen-lg border-l-4 border-gold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h3 className="font-display font-semibold text-ink mb-zen-sm">작품 해설</h3>
                <p className="font-display text-ink leading-relaxed whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </motion.div>
            )}

            {/* Artist notes */}
            {artwork.artistNote && (
              <motion.div
                className="bg-paper-cream p-zen-lg border-2 border-ink/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h3 className="font-display font-semibold text-ink mb-zen-sm">작가 노트</h3>
                <blockquote className="font-display text-ink-light italic leading-relaxed">
                  "{artwork.artistNote}"
                </blockquote>
                {artist?.name && (
                  <cite className="block mt-zen-sm text-sm text-ink-light">
                    - {artist.name}
                  </cite>
                )}
              </motion.div>
            )}

            {/* Technical details */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-zen-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-ink">작품 정보</h4>
                <div className="space-y-1 text-sm text-ink-light">
                  <div><strong>제작연도:</strong> {artwork.year}년</div>
                  {artwork.medium && <div><strong>재료:</strong> {artwork.medium}</div>}
                  {artwork.dimensions && <div><strong>크기:</strong> {artwork.dimensions}</div>}
                  {artwork.price && <div><strong>가격:</strong> {artwork.price}</div>}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-ink">수집 정보</h4>
                <div className="space-y-1 text-sm text-ink-light">
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
                            className="px-2 py-1 bg-gold/20 text-ink text-xs rounded"
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
              className="flex flex-col sm:flex-row gap-zen-sm pt-zen-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <button className="
                px-zen-lg py-zen-md
                bg-ink text-paper font-display font-bold
                hover:bg-gold hover:text-ink
                transition-all duration-300
                shadow-brutal hover:shadow-brutal-strong
                transform hover:-translate-x-1 hover:-translate-y-1
                border-4 border-ink hover:border-gold
              ">
                고화질 이미지 보기
              </button>
              
              <Link 
                href="/#artist"
                className="
                  inline-block text-center px-zen-lg py-zen-md
                  bg-paper border-4 border-ink text-ink font-display font-bold
                  hover:bg-ink hover:text-paper
                  transition-all duration-300
                  shadow-brutal-offset hover:shadow-brutal
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
            className="mt-zen-2xl pt-zen-xl border-t-2 border-ink/20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="font-calligraphy font-bold text-ink text-2xl mb-zen-lg text-center">
              관련 작품
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-zen-md">
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
                      relative aspect-square bg-paper-cream border-2 border-ink
                      shadow-brutal-sm group-hover:shadow-brutal
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
                        absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300
                        flex items-center justify-center
                      ">
                        <span className="font-display text-ink text-xs">보기</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-center">
                      <p className="font-display text-ink text-sm font-medium truncate">
                        {relatedArtwork.title}
                      </p>
                      <p className="font-display text-ink-light text-xs">
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
  )
}