'use client'

import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ErrorBoundary } from '@/components/error-boundary'
import type { Artwork } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

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
  {
    id: 'fallback-3',
    title: '전통과 현대의 조화',
    slug: 'harmony',
    year: 2024,
    medium: '서예',
    dimensions: '68 x 136 cm',
    aspectRatio: '4/5',
    description: '전통과 현대가 조화를 이루는 작품',
    imageUrl: '/placeholders/placeholder.jpg',
    featured: true,
  },
]

// 작품 소개 섹션 - 컴팩트하고 읽기 쉽게 개선
function FeaturedWorksSection() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArtworks() {
      try {
        setLoading(true)
        const response = await fetch('/api/artworks')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        const allArtworks = result.data || []

        // Featured 작품들만 필터링 - 6개로 줄여서 더 집중감 있게
        const featured = allArtworks
          .filter((artwork: Artwork) => artwork.featured)
          .slice(0, 6)

        setFeaturedArtworks(featured)
      } catch (error) {
        console.error('Failed to load featured artworks:', error)
        // 안전한 fallback 데이터 사용
        setFeaturedArtworks(safeFallbackArtworks)
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  return (
    <section className='py-16 bg-paper'>
      <div className='container mx-auto px-4 max-w-6xl'>
        {/* 헤더 섹션 - 더 컴팩트하게 */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center px-4 py-2 bg-gold/10 rounded-full mb-4'>
            <span className='text-gold text-sm font-medium tracking-wide'>
              Featured Works
            </span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-ink mb-4'>
            대표 작품
          </h2>
          <p className='text-ink-light max-w-2xl mx-auto'>
            전통 서예의 정신과 현대적 감각이 어우러진 아남 배옥영의 대표
            작품들을 감상해보세요.
          </p>
        </div>

        {/* 작품 그리드 */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className='bg-background rounded-lg p-4 animate-pulse'
              >
                <div className='w-full h-48 bg-gray-200 rounded-lg mb-4'></div>
                <div className='h-4 bg-gray-200 rounded mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-2/3'></div>
              </div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {featuredArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className='bg-background rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
              >
                <div className='aspect-[4/5] bg-gray-100 flex items-center justify-center'>
                  <span className='text-gray-400 text-sm'>{artwork.title}</span>
                </div>
                <div className='p-4'>
                  <h3 className='font-semibold text-ink mb-1'>
                    {artwork.title}
                  </h3>
                  <p className='text-sm text-ink-light'>
                    {artwork.year} • {artwork.medium}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        <div className='text-center mt-8'>
          <a
            href='/gallery'
            className='inline-flex items-center px-6 py-3 bg-gold text-paper rounded-lg font-medium hover:bg-gold-light transition-colors duration-200'
          >
            전체 작품 보기
          </a>
        </div>
      </div>
    </section>
  )
}

// 작가 소개 섹션 - 더 클린하고 읽기 쉽게 개선
function ArtistSection() {
  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    '/Images/Artist/artist-large.jpg'
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfileImage() {
      try {
        const response = await fetch('/api/artist')
        if (!response.ok) throw new Error('작가 이미지를 불러오지 못했습니다')
        const result = await response.json()
        if (result.data?.profileImageUrl) {
          setProfileImageUrl(result.data.profileImageUrl)
        }
      } catch (err: any) {
        console.log('Using fallback artist image:', err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfileImage()
  }, [])

  return (
    <section className='py-20 bg-stone/5'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* 텍스트 콘텐츠 */}
          <div className='space-y-6 lg:order-1'>
            <div className='inline-flex items-center px-4 py-2 bg-gold/10 rounded-full mb-2'>
              <span className='text-gold text-sm font-medium tracking-wide'>
                Artist
              </span>
            </div>

            <div className='space-y-4'>
              <h2 className='text-4xl font-bold text-ink'>아남 배옥영</h2>
              <p className='text-xl text-ink-light font-medium'>한국 서예가</p>
              <div className='w-16 h-1 bg-gold rounded-full'></div>
            </div>

            <p className='text-lg text-ink-light leading-relaxed max-w-lg'>
              전통 서예의 깊이와 현대적 감각을 조화시키며, 한국 미학의 정수를
              현대적 언어로 재해석하는 작업을 하고 있습니다.
            </p>

            <div className='pt-4'>
              <a
                href='/artist'
                className='inline-flex items-center px-6 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors duration-200'
              >
                작가 소개 더보기
              </a>
            </div>
          </div>

          {/* 프로필 이미지 */}
          <div className='relative lg:order-2'>
            <div className='relative bg-white rounded-2xl shadow-xl overflow-hidden'>
              <div className='aspect-[3/4] relative'>
                {loading ? (
                  <div className='w-full h-full bg-stone/20 animate-pulse flex items-center justify-center'>
                    <div className='text-stone/40'>Loading...</div>
                  </div>
                ) : (
                  <img
                    src={profileImageUrl}
                    alt='아남 배옥영 작가 프로필'
                    className='w-full h-full object-cover'
                  />
                )}

                {/* 서명 오버레이 */}
                <div className='absolute bottom-4 right-4'>
                  <div className='bg-ink/80 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center'>
                    <span className='text-paper text-sm font-bold'>芽南</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// 전시 정보 섹션 - 더 클린하고 정돈된 디자인
function ExhibitionSection() {
  return (
    <section className='py-16 bg-paper'>
      <div className='container mx-auto px-4 max-w-6xl'>
        {/* 헤더 */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center px-4 py-2 bg-gold/10 rounded-full mb-4'>
            <span className='text-gold text-sm font-medium tracking-wide'>
              Exhibition 2026
            </span>
          </div>
          <h2 className='text-3xl font-bold text-ink mb-3'>먹, 그리고... 道</h2>
          <p className='text-lg text-ink-light max-w-2xl mx-auto leading-relaxed'>
            아남 배옥영 개인전에 여러분을 초대합니다
          </p>
        </div>

        {/* 전시 정보 그리드 */}
        <div className='grid md:grid-cols-3 gap-8 mb-12'>
          {/* 전시 기간 */}
          <div className='bg-white rounded-xl p-6 shadow-md text-center'>
            <div className='w-14 h-14 bg-ink rounded-full flex items-center justify-center mx-auto mb-4'>
              <Calendar className='w-6 h-6 text-paper' />
            </div>
            <h3 className='text-lg font-semibold text-ink mb-3'>전시 기간</h3>
            <div className='space-y-1'>
              <p className='text-base text-ink font-medium'>
                2026년 4월 15일 ~ 4월 20일
              </p>
              <p className='text-ink-light text-sm'>화요일 ~ 일요일 (6일간)</p>
              <p className='text-ink-lighter text-sm'>오전 10시 - 오후 6시</p>
            </div>
          </div>

          {/* 전시 장소 */}
          <div className='bg-white rounded-xl p-6 shadow-md text-center'>
            <div className='w-14 h-14 bg-ink rounded-full flex items-center justify-center mx-auto mb-4'>
              <MapPin className='w-6 h-6 text-paper' />
            </div>
            <h3 className='text-lg font-semibold text-ink mb-3'>전시 장소</h3>
            <div className='space-y-1'>
              <p className='text-base text-ink font-medium'>
                예술의전당 서울서예박물관
              </p>
              <p className='text-ink-light text-sm'>제1전시실</p>
              <p className='text-ink-lighter text-sm'>서울시 서초구</p>
            </div>
          </div>

          {/* 관람 안내 */}
          <div className='bg-white rounded-xl p-6 shadow-md text-center'>
            <div className='w-14 h-14 bg-gold rounded-full flex items-center justify-center mx-auto mb-4'>
              <ArrowRight className='w-6 h-6 text-paper' />
            </div>
            <h3 className='text-lg font-semibold text-ink mb-3'>관람 안내</h3>
            <div className='space-y-1'>
              <p className='text-base text-ink font-medium'>무료 관람</p>
              <p className='text-ink-light text-sm'>사전 예약 불필요</p>
              <p className='text-ink-lighter text-sm'>단체 관람 환영</p>
            </div>
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className='text-center'>
          <a
            href='/exhibition'
            className='inline-flex items-center px-8 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors duration-200 shadow-lg hover:shadow-xl'
          >
            전시 상세 정보
          </a>
        </div>
      </div>
    </section>
  )
}

// Zen Brutalist Hero Section for Main Page
function MainPageHero() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])

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
        console.error('Failed to load featured artworks for hero:', error)
        // 안전한 fallback 데이터 사용
        setFeaturedArtworks(safeFallbackArtworks)
      }
    }

    loadFeaturedArtworks()
  }, [])

  return (
    <ZenBrutalistHero
      title="먹, 그리고... 아남 배옥영 개인전"
      subtitle="Contemporary Calligraphy Solo Exhibition"
      description="전통 서예의 정신과 현대적 감각이 어우러진 혁신적인 디지털 갤러리"
      season="autumn"
    />
  )
}

// 메인 페이지 컴포넌트 - 클린한 디자인으로 개선
export default function HomePage() {
  return (
    <main className='min-h-screen bg-paper flex flex-col'>
      {/* 네비게이션 */}
      <ArtNavigation />

      {/* 히어로 섹션 */}
      <MainPageHero />

      {/* 네비게이션 스페이서 */}
      <NavigationSpacer />

      {/* 메인 콘텐츠 섹션들 */}
      <div className='flex-1'>
        <FeaturedWorksSection />
        <ArtistSection />
        <ExhibitionSection />
      </div>

      {/* 푸터 */}
      <footer className="bg-ink text-paper py-zen-xl">
        <div className="container mx-auto px-4 text-center">
          <p className="text-calligraphy-body text-responsive-base">
            © 2024 아남 배옥영 서예 갤러리. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
