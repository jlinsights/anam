'use client'

import { getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import type { Metadata } from 'next'
import type { Artwork, Artist } from '@/lib/types'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

// Metadata is handled in layout.tsx

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artist, setArtist] = useState<Artist | undefined>()
  const [displayedArtworks, setDisplayedArtworks] = useState<Artwork[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

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
            artistData = await fetchArtist('fallback-artist').catch(() => undefined)
          }
        } catch (apiError) {
          console.log('Artist API failed, using static data:', apiError)
          artistData = await fetchArtist('fallback-artist').catch(() => undefined)
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

  // Auto-rotate artworks every 5 seconds
  useEffect(() => {
    if (artworks.length <= 8) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % artworks.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [artworks.length])

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">아남 배옥영 서예 갤러리</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">전통과 현대가 만나는 서예의 새로운 지평</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Gallery Grid */}
        <section id="gallery" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">작품 갤러리</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {loading ? '작품을 불러오는 중...' : `전체 ${artworks.length}개 작품 중 8개 전시`}
              </p>
            </div>
            {artworks.length > 8 && (
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  {Array.from({ length: Math.ceil(artworks.length / 8) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        Math.floor(currentIndex / 8) === i ? 'bg-gray-900' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">자동 순환 중</span>
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
                  >
                    <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-105">
                      {artwork.imageUrl ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="eager"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2">
                              <h3 className="font-medium text-sm mb-1 line-clamp-2">{artwork.title}</h3>
                              <p className="text-xs opacity-90">{artwork.year}년</p>
                              <p className="text-xs opacity-75 mt-1">{artwork.medium}</p>
                            </div>
                          </div>
                          {/* Click indicator */}
                          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Gallery Navigation */}
              <div className="flex justify-center items-center gap-4">
                <Link 
                  href="/gallery" 
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  전체 갤러리 보기
                </Link>
                {artworks.length > 8 && (
                  <button
                    onClick={() => setCurrentIndex(prev => (prev + 8) % artworks.length)}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    다음 8개 작품
                  </button>
                )}
              </div>
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

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
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