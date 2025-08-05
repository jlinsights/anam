'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { ContactInfo } from '@/components/contact-info'
import { ContactForm } from '@/components/contact-form'
import { ErrorBoundary } from '@/components/error-boundary'
import type { Artwork } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

// 안전한 fallback 데이터
const safeFallbackArtworks: Artwork[] = [
  {
    id: 'fallback-1',
    title: '전통 서예 작품',
    slug: 'traditional-calligraphy',
    year: 2024,
    medium: '서예',
    dimensions: '68 x 136 cm',
    aspectRatio: '4/5',
    description: '전통 서예의 아름다움을 담은 작품',
    imageUrl: '/placeholders/placeholder.jpg',
    featured: true,
  },
  {
    id: 'fallback-2',
    title: '현대 서예 작품',
    slug: 'modern-calligraphy',
    year: 2024,
    medium: '서예',
    dimensions: '68 x 136 cm',
    aspectRatio: '4/5',
    description: '현대적 감각의 서예 작품',
    imageUrl: '/placeholders/placeholder.jpg',
    featured: true,
  },
]

export default function ContactPage() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setMousePosition({ x, y })
  }, [])

  // Featured artworks 가져오기 - 안전한 방식으로 수정
  useEffect(() => {
    async function loadFeaturedArtworks() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/artworks')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        const allArtworks = result.data || []

        // Featured 작품들을 배경으로 사용
        const featured = allArtworks
          .filter((artwork: Artwork) => artwork.featured)
          .slice(0, 6)

        setFeaturedArtworks(featured)
      } catch (error) {
        console.error(
          'Failed to load featured artworks for contact hero:',
          error
        )
        // 안전한 fallback 데이터 사용
        setFeaturedArtworks(safeFallbackArtworks)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedArtworks()
  }, [])

  // Dynamic background based on mouse position
  const dynamicBackground = {
    background: `radial-gradient(
      circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
      hsla(var(--season-spring) / 0.1) 0%,
      hsla(var(--season-summer) / 0.08) 25%,
      hsla(var(--season-autumn) / 0.12) 50%,
      hsla(var(--season-winter) / 0.06) 75%,
      transparent 100%
    )`,
  }

  return (
    <ErrorBoundary>
      <div
        ref={containerRef}
        className='min-h-screen bg-paper relative overflow-hidden flex flex-col'
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Zen Brutalism Foundation Background Effects */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute inset-0 zen-breathe-deep opacity-2' />
          <div className='absolute inset-0 ink-flow-ambient opacity-1' />
          <div
            className={`absolute inset-0 transition-opacity duration-2000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            style={dynamicBackground}
          />
        </div>

        <ArtNavigation />

        {/* Zen Brutalist Hero for Contact Page */}
        <ZenBrutalistHero
          phase='3'
          title={{
            main: '문의하기',
            sub: 'CONTACT US',
            english: 'Get in Touch',
          }}
          description={{
            main:
              '작품 구매, 전시 관련 문의, 기타 궁금한 사항이 있으시면 언제든지 연락해 주세요',
            sub:
              '전통 서예의 아름다움과 작가의 철학에 대해 더 자세히 알고 싶으시다면 언제든 연락주세요',
          }}
          concept='ARTIST CONTACT'
          navigation={{
            prev: { href: '/exhibition', label: '전시 정보' },
            demo: { href: '/zen-demo', label: 'Zen 체험' },
          }}
          variant='fusion'
          enableInteraction={true}
          className='min-h-[35vh]'
          backgroundArtworks={featuredArtworks}
          showImageCarousel={featuredArtworks.length > 0 && !isLoading}
        />

        <NavigationSpacer />

        {/* Main Content - 균형잡힌 레이아웃 */}
        <main className='section-padding relative z-10 flex-1'>
          <div className='zen-brutalist-layout'>
            {/* 연락처 정보와 문의 폼을 균형잡힌 그리드로 배치 */}
            <div className='contact-balanced-grid temporal-depth'>
              {/* 연락처 정보 - 40% 비율 */}
              <div className='contact-info-balanced'>
                <ContactInfo />
              </div>

              {/* 문의 폼 - 60% 비율 */}
              <div className='contact-form-balanced'>
                <ContactForm />
              </div>
            </div>
          </div>
        </main>

        {/* Zen Brutalist Footer */}
        <ZenBrutalistFooter
          variant='cultural'
          showPhaseNavigation={true}
          enableInteraction={true}
        />
      </div>
    </ErrorBoundary>
  )
}
