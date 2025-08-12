'use client'

import { getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import type { Metadata } from 'next'
import type { Artwork, Artist } from '@/lib/types'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MinimalHeader } from '@/components/layout/MinimalHeader'
import { HeroSection } from '@/components/sections/HeroSection'
import UpcomingExhibition from '@/components/exhibition/UpcomingExhibition'

// Metadata is handled in layout.tsx

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artist, setArtist] = useState<Artist | undefined>()
  const [displayedArtworks, setDisplayedArtworks] = useState<Artwork[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch data on client side
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try API first, then fallback to static data
        let artworksData: Artwork[] = []
        let artistData: Artist | undefined

        try {
          const artworksResponse = await fetch('/api/artworks')
          const artworksJson = await artworksResponse.json()
          
          if (artworksJson.success && artworksJson.data && artworksJson.data.length > 0) {
            artworksData = artworksJson.data
          } else {
            // Fallback to static data
            artworksData = await getArtworks()
          }
        } catch (apiError) {
          console.log('API failed, using static data:', apiError)
          artworksData = await getArtworks()
        }

        try {
          const artistResponse = await fetch('/api/artist')
          const artistJson = await artistResponse.json()
          if (artistJson.success && artistJson.data) {
            artistData = artistJson.data
          } else {
            artistData = await fetchArtist('fallback-artist').catch(() => null) || undefined
          }
        } catch (apiError) {
          console.log('Artist API failed, using static data:', apiError)
          artistData = await fetchArtist('fallback-artist').catch(() => null) || undefined
        }
        
        setArtworks(artworksData)
        setArtist(artistData)
        
        // Initialize with first 8 random artworks
        if (artworksData && artworksData.length > 0) {
          const shuffled = [...artworksData].sort(() => 0.5 - Math.random())
          setDisplayedArtworks(shuffled.slice(0, 8))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Final fallback to static data
        try {
          const fallbackArtworks = await getArtworks()
          setArtworks(fallbackArtworks)
          if (fallbackArtworks && fallbackArtworks.length > 0) {
            const shuffled = [...fallbackArtworks].sort(() => 0.5 - Math.random())
            setDisplayedArtworks(shuffled.slice(0, 8))
          }
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Enhanced auto-rotation with user control (BMAD: User Ability)
  const startAutoRotation = useCallback(() => {
    if (artworks.length <= 8 || !isPlaying) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % artworks.length)
    }, 4000) // Slightly faster rotation for better engagement
  }, [artworks.length, isPlaying])

  const stopAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      startAutoRotation()
    } else {
      stopAutoRotation()
    }

    return () => stopAutoRotation()
  }, [startAutoRotation, stopAutoRotation, isPlaying])

  // Pause auto-rotation on hover (BMAD: Behavior awareness)
  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index)
    if (isPlaying) {
      stopAutoRotation()
    }
  }, [isPlaying, stopAutoRotation])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    if (isPlaying) {
      startAutoRotation()
    }
  }, [isPlaying, startAutoRotation])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Update displayed artworks when currentIndex changes
  useEffect(() => {
    if (artworks.length > 8) {
      const newDisplayed = []
      for (let i = 0; i < 8; i++) {
        const index = (currentIndex + i) % artworks.length
        newDisplayed.push(artworks[index])
      }
      setDisplayedArtworks(newDisplayed)
    }
  }, [currentIndex, artworks])

  // Get featured artwork for hero
  const featuredArtwork = displayedArtworks.length > 0 ? displayedArtworks[0] : undefined

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Minimal Header */}
      <MinimalHeader />
      
      {/* Hero Section */}
      <HeroSection 
        title="아남 배옥영"
        subtitle="전통과 현대가 만나는 서예의 새로운 지평"
        description="깊이 있는 전통 서예 기법과 현대적 감각이 조화를 이루는 독창적인 작품 세계를 만나보세요."
        featuredArtwork={featuredArtwork ? {
          id: featuredArtwork.id,
          title: featuredArtwork.title,
          imageUrl: featuredArtwork.imageUrl || '',
          year: featuredArtwork.year?.toString() || '',
          medium: featuredArtwork.medium || ''
        } : undefined}
        stats={{
          totalArtworks: artworks.length,
          yearsActive: 30,
          exhibitions: 25
        }}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Gallery Grid */}
        <section id="gallery" className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">작품 갤러리</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    작품을 불러오는 중...
                  </span>
                ) : (
                  `전체 ${artworks.length}개 작품 중 8개 전시`
                )}
              </p>
              {/* BMAD: Data - Show current position and status */}
              {!loading && artworks.length > 8 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  현재 {Math.floor(currentIndex / 8) + 1} / {Math.ceil(artworks.length / 8)} 페이지 
                  {isPlaying ? ' • 자동 회전 중' : ' • 일시 정지'}
                </p>
              )}
            </div>
            
            {/* BMAD: Ability - Enhanced user controls */}
            {artworks.length > 8 && (
              <div className="flex items-center gap-4">
                {/* Play/Pause Control */}
                <button
                  onClick={togglePlayPause}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title={isPlaying ? '자동 회전 일시정지' : '자동 회전 시작'}
                >
                  {isPlaying ? (
                    <>
                      <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400"></div>
                      <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 ml-0.5"></div>
                      <span className="hidden sm:inline">일시정지</span>
                    </>
                  ) : (
                    <>
                      <div className="w-0 h-0 border-l-[6px] border-l-gray-600 dark:border-l-gray-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                      <span className="hidden sm:inline">재생</span>
                    </>
                  )}
                </button>

                {/* Page Indicators */}
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.ceil(artworks.length / 8) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i * 8)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                          Math.floor(currentIndex / 8) === i 
                            ? 'bg-gray-900 dark:bg-gray-100 shadow-sm' 
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                        }`}
                        title={`${i + 1}번째 페이지로 이동`}
                      />
                    ))}
                  </div>
                </div>

                {/* Manual Navigation */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentIndex(prev => prev === 0 ? artworks.length - 8 : Math.max(0, prev - 8))}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="이전 8개 작품"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentIndex(prev => (prev + 8) >= artworks.length ? 0 : prev + 8)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="다음 8개 작품"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : displayedArtworks.length > 0 ? (
            <>
              {/* 1x8 Grid (mobile) → 2x4 Grid (tablet) → 4x2 Grid (desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                {displayedArtworks.map((artwork, index) => (
                  <Link 
                    key={`${artwork.id}-${currentIndex}`}
                    href={`/gallery/${artwork.slug || artwork.id}`}
                    className="group cursor-pointer opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animationFillMode: 'forwards'
                    }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`
                      aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden 
                      transition-all duration-500 
                      hover:shadow-2xl hover:shadow-gray-300/50 dark:hover:shadow-gray-900/50
                      hover:scale-[1.02] hover:-translate-y-1
                      ${hoveredIndex === index ? 'ring-2 ring-gray-400/50' : ''}
                    `}>
                      {artwork.imageUrl ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading={index < 4 ? "eager" : "lazy"} // Eager load first 4 for better UX
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                          />
                          
                          {/* Enhanced Hover Overlay with BMAD principles */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            {/* Content positioned at bottom for better readability */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <h3 className="font-medium text-sm mb-1 line-clamp-2 text-shadow-sm">{artwork.title}</h3>
                              <div className="flex items-center gap-2 text-xs opacity-90">
                                <span>{artwork.year}년</span>
                                <span>•</span>
                                <span className="line-clamp-1">{artwork.medium}</span>
                              </div>
                              {artwork.dimensions && (
                                <p className="text-xs opacity-75 mt-1">{artwork.dimensions}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Status indicators (BMAD: Data visibility) */}
                          <div className="absolute top-2 left-2 flex gap-1">
                            {artwork.featured && (
                              <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">
                                추천
                              </div>
                            )}
                            {artwork.category === 'recent' && (
                              <div className="bg-green-400 text-green-900 text-xs px-2 py-0.5 rounded-full font-medium">
                                최신
                              </div>
                            )}
                          </div>

                          {/* Enhanced click indicator */}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>

                          {/* Loading state overlay for better UX */}
                          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse opacity-0 group-hover:opacity-0 transition-opacity">
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-50 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm gap-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>이미지 준비중</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Enhanced Gallery Navigation (BMAD: Clear Motivation + Enhanced Ability) */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link 
                  href="/gallery" 
                  className="group flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <span>전체 갤러리 보기</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-xs opacity-75 hidden sm:inline">({artworks.length}개 작품)</span>
                </Link>
                
                {/* Quick action buttons */}
                <div className="flex items-center gap-2">
                  {artworks.length > 8 && (
                    <button
                      onClick={() => setCurrentIndex(prev => (prev + 8) % artworks.length)}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span>다음 8개</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      const shuffled = [...artworks].sort(() => 0.5 - Math.random())
                      setDisplayedArtworks(shuffled.slice(0, 8))
                      setCurrentIndex(0)
                    }}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="작품을 무작위로 섞어서 다시 표시"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">섞기</span>
                  </button>
                </div>
              </div>

              {/* Enhanced stats and engagement metrics (BMAD: Data visibility) */}
              {!loading && artworks.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">갤러리 현황</h3>
                    <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>추천작품 {artworks.filter(a => a.featured).length}개</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>최신작품 {artworks.filter(a => a.category === 'recent').length}개</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>전체작품 {artworks.length}개</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      각 작품을 클릭하면 상세 정보를 확인할 수 있습니다
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">표시할 작품이 없습니다.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">데이터를 불러오는 중입니다...</p>
            </div>
          )}
        </section>

        {/* Artist Section */}
        {artist && (
          <section id="artist" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">작가 소개</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{artist.name}</h3>
              {artist.bio && <p className="text-gray-600 dark:text-gray-300 mt-4">{artist.bio}</p>}
            </div>
          </section>
        )}

        {/* Navigation Links */}
        <section id="navigation" className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gallery" className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              상세 갤러리
            </Link>
            <Link href="/artist" className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              작가 정보
            </Link>
            <Link href="/contact" className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              연락처
            </Link>
          </div>
        </section>
      </main>

      {/* Upcoming Exhibition Section */}
      <UpcomingExhibition />

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-0">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 아남 배옥영. All rights reserved.</p>
            <p className="mt-2 text-sm">전통 서예와 현대적 감각이 조화를 이루는 독창적 작품</p>
          </div>
        </div>
      </footer>
    </div>
  )
}