'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { ErrorBoundary } from '@/components/error-boundary'
import type { Artist, Artwork } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Award,
  Calendar,
  GraduationCap,
  MapPin,
  Palette,
  BookOpen,
  Users,
  Heart,
  Lightbulb,
  Brush,
  Package,
  Globe,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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

interface ArtistClientProps {
  artist: Artist
}

export default function ArtistClient({ artist }: ArtistClientProps) {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadFeaturedArtworks() {
      try {
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
          'Failed to load featured artworks for artist hero:',
          error
        )
        // 안전한 fallback 데이터 사용
        setFeaturedArtworks(safeFallbackArtworks)
      }
    }

    loadFeaturedArtworks()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setMousePosition({ x, y })
  }, [])

  const renderSection = (
    title: string,
    content: string[] | string | undefined,
    icon: React.ReactNode
  ) => {
    if (!content || (Array.isArray(content) && content.length === 0))
      return null

    return (
      <div className='zen-brutalist-card glass-layer-1 zen-hover-scale p-zen-md'>
        <div className='flex items-center gap-zen-sm mb-zen-md'>
          <div className='p-zen-xs bg-gold/10 rounded-lg text-gold'>{icon}</div>
          <h3 className='text-base font-semibold text-ink'>{title}</h3>
        </div>
        <div className='space-y-zen-xs'>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <p key={index} className='text-sm text-ink-light leading-normal'>
                {item}
              </p>
            ))
          ) : (
            <p className='text-sm text-ink-light leading-normal whitespace-pre-wrap'>
              {content}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Dynamic background based on mouse position
  const dynamicBackground = {
    background: `radial-gradient(
      circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
      hsla(var(--ink) / 0.08) 0%,
      hsla(var(--gold) / 0.05) 40%,
      transparent 70%
    )`,
  }

  return (
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

      {/* Zen Brutalist Hero for Artist Page - 더 컴팩트화하고 Featured 이미지 배경 추가 */}
      <ZenBrutalistHero
        phase='1'
        title={{
          main: '아남 배옥영',
          sub: 'ANAM BAE OK YOUNG',
          english: 'Korean Calligraphy Artist',
        }}
        description={{
          main: '전통 서예의 정신과 현대적 감각이 조화를 이루는 작가',
          sub:
            '먹과 붓으로 그려내는 한국의 미학, 그 깊이와 아름다움을 탐험합니다',
        }}
        concept='ARTIST PROFILE'
        navigation={{
          prev: { href: '/gallery', label: '갤러리' },
          demo: { href: '/zen-demo', label: 'Zen 체험' },
        }}
        variant='zen'
        enableInteraction={true}
        className='min-h-[35vh]'
        backgroundArtworks={featuredArtworks}
        showImageCarousel={featuredArtworks.length > 0}
      />

      <NavigationSpacer />

      <main className='section-padding relative z-10 flex-1'>
        <div className='zen-brutalist-layout'>
          {/* 메인 콘텐츠 - 반응형 개선 */}
          <div className='grid lg:grid-cols-2 gap-zen-lg mb-zen-xl temporal-depth'>
            {/* 왼쪽: 프로필 섹션 */}
            <div className='space-y-zen-lg void-contemplative'>
              {/* 프로필 이미지 - 크기 최적화 */}
              <div className='zen-brutalist-card glass-layer-1 cultural-context'>
                <div className='relative w-full h-[300px] rounded-2xl overflow-hidden mb-zen-md'>
                  <Image
                    src={
                      artist.profileImageUrl ||
                      '/Images/Artist/artist-large.jpg'
                    }
                    alt={artist.name}
                    fill
                    className='object-cover zen-hover-scale'
                    priority
                  />
                  {/* Image overlay with traditional ink effect */}
                  <div className='absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-transparent pointer-events-none' />
                </div>

                {/* 연락처 정보 섹션 - 가로 배치로 최적화 */}
                <div className='space-y-zen-sm void-breathing'>
                  <h2 className='zen-typography-section text-ink stroke-press mb-zen-md text-center'>
                    {artist.name}
                  </h2>

                  {/* 연락처 정보를 가로로 배치 */}
                  <div className='flex flex-wrap justify-center gap-zen-md'>
                    {/* 인스타그램 */}
                    {artist.socialLinks?.instagram && (
                      <div className='flex items-center gap-zen-xs zen-hover-scale bg-pink-50 px-zen-sm py-zen-xs rounded-lg'>
                        <Link
                          href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-pink-600 hover:text-pink-700 transition-colors font-medium'
                        >
                          {artist.socialLinks.instagram}
                        </Link>
                      </div>
                    )}
                    {/* 이메일 */}
                    {artist.email && (
                      <div className='flex items-center gap-zen-xs zen-hover-scale bg-blue-50 px-zen-sm py-zen-xs rounded-lg'>
                        <Link
                          href={`mailto:${artist.email}`}
                          className='text-sm text-ink-light hover:text-ink transition-colors'
                        >
                          {artist.email}
                        </Link>
                      </div>
                    )}
                    {/* 전화번호 */}
                    {artist.phone && (
                      <div className='flex items-center gap-zen-xs zen-hover-scale bg-green-50 px-zen-sm py-zen-xs rounded-lg'>
                        <Link
                          href={`tel:${artist.phone}`}
                          className='text-sm text-ink-light hover:text-ink transition-colors'
                        >
                          {artist.phone}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상세 정보 섹션 - 타이포그래피 개선 */}
            <div className='space-y-zen-md void-contemplative'>
              {/* 작가 소개 */}
              {artist.bio && (
                <div className='zen-brutalist-card glass-layer-1 zen-hover-scale p-zen-lg'>
                  <h3 className='text-lg font-semibold text-ink mb-zen-md'>
                    작가 소개
                  </h3>
                  <p className='text-base text-ink-light leading-relaxed whitespace-pre-wrap'>
                    {artist.bio}
                  </p>
                </div>
              )}

              {/* 작품 철학 */}
              {artist.philosophy && (
                <div className='zen-brutalist-card glass-layer-1 zen-hover-scale p-zen-lg'>
                  <div className='flex items-center gap-zen-md mb-zen-md'>
                    <div className='p-zen-sm bg-gold/10 rounded-lg text-gold'>
                      <BookOpen className='h-5 w-5' />
                    </div>
                    <h3 className='text-lg font-semibold text-ink'>
                      작품 철학
                    </h3>
                  </div>
                  <p className='text-base text-ink-light leading-relaxed whitespace-pre-wrap'>
                    {artist.philosophy}
                  </p>
                </div>
              )}

              {/* 작가 노트 */}
              {artist.statement && (
                <div className='zen-brutalist-card glass-layer-1 zen-hover-scale p-zen-lg'>
                  <div className='flex items-center gap-zen-md mb-zen-md'>
                    <div className='p-zen-sm bg-gold/10 rounded-lg text-gold'>
                      <MapPin className='h-5 w-5' />
                    </div>
                    <h3 className='text-lg font-semibold text-ink'>
                      작가 노트
                    </h3>
                  </div>
                  <p className='text-base text-ink-light leading-relaxed whitespace-pre-wrap'>
                    {artist.statement}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 추가 정보 섹션 - 그리드 최적화 */}
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-zen-md temporal-depth'>
            {/* 학력 */}
            {renderSection(
              '학력',
              artist.education,
              <GraduationCap className='h-4 w-4' />
            )}

            {/* 전시 */}
            {renderSection(
              '전시',
              artist.exhibitions,
              <Palette className='h-4 w-4' />
            )}

            {/* 수상 */}
            {renderSection(
              '수상',
              artist.awards,
              <Award className='h-4 w-4' />
            )}

            {/* 강의 */}
            {renderSection(
              '강의 경력',
              artist.teachingExperience,
              <Users className='h-4 w-4' />
            )}

            {/* 출판 */}
            {renderSection(
              '출판',
              artist.publications,
              <Package className='h-4 w-4' />
            )}

            {/* 소속 */}
            {renderSection(
              '소속',
              artist.memberships,
              <Globe className='h-4 w-4' />
            )}

            {/* 컬렉션 */}
            {renderSection(
              '컬렉션',
              artist.collections,
              <Calendar className='h-4 w-4' />
            )}
          </div>
        </div>
      </main>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter
        variant='zen'
        showPhaseNavigation={true}
        enableInteraction={true}
      />
    </div>
  )
}
