'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ArtworkGrid } from '@/components/artwork-card'
import { SectionHeader } from '@/components/section-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/lib/types'
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// 히어로 섹션 컴포넌트
function HeroSection() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    async function loadFeaturedArtworks() {
      try {
        const { fallbackArtworksData } = await import('@/lib/artworks')
        const fallbackFeatured = fallbackArtworksData
          .filter((artwork) => artwork.featured)
          .slice(0, 6)

        const initialArtworks =
          fallbackFeatured.length > 0
            ? fallbackFeatured
            : fallbackArtworksData.slice(0, 6)

        setFeaturedArtworks(initialArtworks)
        setLoading(false)

        try {
          const { getFeaturedArtworks } = await import('@/lib/artworks')
          const airtableArtworks = await getFeaturedArtworks(6)

          if (airtableArtworks && airtableArtworks.length > 0) {
            setFeaturedArtworks(airtableArtworks)
          }
        } catch (airtableError) {
          console.log('Using fallback data')
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        setLoading(false)
      }
    }

    loadFeaturedArtworks()
  }, [])

  useEffect(() => {
    if (featuredArtworks.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % featuredArtworks.length)
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [featuredArtworks.length])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % featuredArtworks.length)
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + featuredArtworks.length) % featuredArtworks.length
    )
  }

  if (loading || featuredArtworks.length === 0) {
    return (
      <section className='relative min-h-screen flex items-center justify-center bg-gradient-zen'>
        <div className='absolute inset-0 bg-ink/10' />
        <div className='relative z-10 text-center'>
          <div className='animate-pulse space-y-6'>
            <div className='w-32 h-32 bg-ink/20 rounded-full mx-auto' />
            <div className='h-8 bg-ink/20 rounded w-64 mx-auto' />
            <div className='h-4 bg-ink/20 rounded w-96 mx-auto' />
          </div>
        </div>
      </section>
    )
  }

  const currentArtwork = featuredArtworks[currentImageIndex]

  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
      {/* 배경 이미지 */}
      <div className='absolute inset-0'>
        {featuredArtworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
              index === currentImageIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            {artwork.imageUrl && (
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className={`object-cover transition-transform duration-8000 ease-linear ${
                  index === currentImageIndex ? 'scale-110' : 'scale-100'
                }`}
                priority={index === 0}
                style={{
                  filter:
                    index === currentImageIndex
                      ? 'brightness(0.7) contrast(1.1) saturate(1.1)'
                      : 'brightness(0.5) contrast(1.0) saturate(1.0)',
                  transition: 'filter 2s ease-in-out, transform 8s ease-out',
                }}
              />
            )}
          </div>
        ))}

        {/* 오버레이 */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60' />
        <div className='absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20' />
      </div>

      {/* 네비게이션 컨트롤 */}
      <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-between px-6 md:px-12'>
        <Button
          variant='ghost'
          size='lg'
          onClick={prevImage}
          className='glass-strong hover:bg-white/20 text-white border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-110 focus-art'
          aria-label='이전 이미지'
        >
          <ChevronLeft className='h-6 w-6 transition-transform duration-300 hover:scale-125' />
        </Button>
        <Button
          variant='ghost'
          size='lg'
          onClick={nextImage}
          className='glass-strong hover:bg-white/20 text-white border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-110 focus-art'
          aria-label='다음 이미지'
        >
          <ChevronRight className='h-6 w-6 transition-transform duration-300 hover:scale-125' />
        </Button>
      </div>

      {/* 인디케이터 */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-20'>
        <div className='glass-strong rounded-full px-4 py-2 border border-white/20'>
          <div className='flex space-x-2'>
            {featuredArtworks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-700 hover:scale-150 focus-art ${
                  index === currentImageIndex
                    ? 'bg-white shadow-lg scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 히어로 콘텐츠 */}
      <div className='relative z-10 text-center text-white px-4 container-art'>
        <div className='animate-brush-in'>
          {/* 상단 영문 타이틀 */}
          <div className='mb-8 md:mb-12'>
            <p className='text-xs md:text-sm text-white/60 tracking-[0.3em] uppercase text-shadow-soft mb-2 hover:text-white/80 transition-colors duration-700'>
              Contemporary Calligraphy Solo Exhibition
            </p>
            <p className='text-xs md:text-sm text-white/50 tracking-wide text-shadow-soft hover:text-white/70 transition-colors duration-700'>
              @heelang_calligraphy
            </p>
          </div>

          {/* 메인 타이틀 */}
          <div className='mb-12 md:mb-16 hover-scale'>
            <h1 className='font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-wider text-shadow-strong hover:text-shadow-glow transition-all duration-1000'>
              길 道
            </h1>
            <p className='font-display text-2xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] text-white/90 text-shadow-medium hover:text-white hover:tracking-[0.25em] transition-all duration-1000'>
              WAY
            </p>
          </div>

          {/* 서브타이틀 */}
          <div className='mb-12'>
            <p className='text-lg md:text-xl lg:text-2xl text-white/80 mb-8 text-shadow-medium hover:text-white/95 transition-colors duration-700'>
              희랑 공경순 개인전
            </p>

            {/* 전시 정보 카드 */}
            <Card className='glass-strong border-white/20 max-w-md mx-auto hover:bg-white/10 hover:border-white/30 hover-lift'>
              <CardContent className='p-6 space-y-4'>
                <div className='flex items-center justify-center space-x-2 text-white/90'>
                  <Calendar className='w-4 h-4' />
                  <span className='font-medium'>2025년 6월 18일 - 24일</span>
                </div>
                <p className='text-sm text-white/70'>오전 10시 - 오후 6시</p>

                <div className='w-12 h-px bg-white/30 mx-auto' />

                <div className='flex items-center justify-center space-x-2 text-white/90'>
                  <MapPin className='w-4 h-4' />
                  <span className='font-medium'>인사동 한국미술관 2층</span>
                </div>
                <p className='text-xs text-white/70'>
                  후원: 사단법인 동양서예협회
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA 버튼 */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Button
              asChild
              size='lg'
              className='btn-art bg-white text-ink hover:bg-white/90'
            >
              <Link href='/gallery'>
                작품 감상하기
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='btn-art-outline border-white text-white hover:bg-white hover:text-ink'
            >
              <Link href='/exhibition'>전시 정보</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// 작품 소개 섹션
function FeaturedWorksSection() {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArtworks() {
      try {
        // API를 통해 안전하게 Featured 작품들을 가져옴
        const response = await fetch('/api/artworks')
        if (!response.ok) {
          throw new Error('Failed to fetch artworks')
        }

        const result = await response.json()
        const allArtworks = result.data || []

        // Featured 작품들만 필터링
        const featured = allArtworks
          .filter((artwork: Artwork) => artwork.featured)
          .slice(0, 8)

        setFeaturedArtworks(featured)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load featured artworks:', error)
        // 에러 발생 시 fallback 데이터 사용
        try {
          const { fallbackArtworksData } = await import('@/lib/artworks')
          const fallbackFeatured = fallbackArtworksData
            .filter((artwork) => artwork.featured)
            .slice(0, 8)

          setFeaturedArtworks(
            fallbackFeatured.length > 0
              ? fallbackFeatured
              : fallbackArtworksData.slice(0, 8)
          )
        } catch (fallbackError) {
          console.error('Failed to load fallback artworks:', fallbackError)
        }
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  return (
    <section className='section-padding bg-background'>
      <div className='container-art'>
        <SectionHeader
          badge='Featured Works'
          title='대표 작품'
          subtitle='문방사우와 서예의 조화'
          description='전통 서예의 정신과 현대적 감각이 어우러진 희랑 작가의 대표작들을 만나보세요.'
          variant='centered'
          size='lg'
          action={{
            label: '전체 작품 보기',
            href: '/gallery',
            variant: 'outline',
          }}
        />

        <div className='mt-16'>
          {loading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='card-art'>
                  <div className='aspect-[3/4] bg-stone-light animate-pulse rounded-t-xl' />
                  <div className='p-4 space-y-3'>
                    <div className='h-6 bg-stone-light animate-pulse rounded' />
                    <div className='h-4 bg-stone-light animate-pulse rounded w-3/4' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ArtworkGrid
              artworks={featuredArtworks}
              variant='featured'
              columns={4}
              showActions={true}
            />
          )}
        </div>
      </div>
    </section>
  )
}

// 작가 소개 섹션
function ArtistSection() {
  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    '/images/artist/artist-medium.jpg'
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfileImage() {
      try {
        const response = await fetch('/api/artist')
        if (!response.ok) throw new Error('작가 이미지를 불러오지 못했습니다')
        const result = await response.json()
        if (
          result.data?.profileImageUrl &&
          typeof result.data.profileImageUrl === 'string'
        ) {
          setProfileImageUrl(result.data.profileImageUrl)
        }
      } catch (err: any) {
        setError(err.message || '알 수 없는 에러')
      } finally {
        setLoading(false)
      }
    }
    loadProfileImage()
  }, [])

  return (
    <section className='section-padding bg-gradient-zen'>
      <div className='container-art'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          <div className='space-y-8'>
            <SectionHeader
              badge='Artist'
              title='희랑 공경순'
              subtitle='서예가'
              description='전통 서예의 깊이와 현대적 감각을 조화시키며, 문방사우의 정신을 현대에 되살리는 작업을 하고 있습니다.'
              size='lg'
              action={{
                label: '작가 소개 더보기',
                href: '/artist',
                variant: 'default',
              }}
            />
          </div>
          <div className='relative'>
            <Card className='card-art-elevated overflow-hidden'>
              <CardContent className='p-0'>
                <div className='aspect-[4/5] relative bg-stone-100'>
                  {loading ? (
                    <div className='w-full h-full flex items-center justify-center animate-pulse bg-stone-200' />
                  ) : (
                    <Image
                      src={profileImageUrl}
                      alt='희랑 공경순 작가 프로필'
                      fill
                      className='object-cover hover-scale'
                      sizes='(max-width: 768px) 100vw, 50vw'
                      priority
                      placeholder='blur'
                      blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli5N4Q5Ox4DfveMEEAAkAAEAAA='
                    />
                  )}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
                </div>
              </CardContent>
            </Card>
            {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

// 전시 정보 섹션
function ExhibitionSection() {
  return (
    <section className='section-padding bg-background'>
      <div className='container-art'>
        <SectionHeader
          badge='Exhibition'
          title='전시 정보'
          subtitle='길 道 WAY'
          description='2025년 6월, 인사동에서 열리는 희랑 공경순 작가의 개인전에 여러분을 초대합니다.'
          variant='centered'
          size='lg'
        />

        <div className='mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          <Card className='card-art-elevated'>
            <CardContent className='p-8 text-center space-y-4'>
              <div className='w-12 h-12 bg-gradient-ink rounded-full flex items-center justify-center mx-auto'>
                <Calendar className='w-6 h-6 text-white dark:text-paper' />
              </div>
              <h3 className='font-display text-xl font-semibold text-ink'>
                전시 기간
              </h3>
              <div className='space-y-2'>
                <p className='font-medium text-ink'>2025년 6월 18일 - 24일</p>
                <p className='text-sm text-ink-light'>오전 10시 - 오후 6시</p>
                <p className='text-xs text-ink-lighter'>월요일 휴관</p>
              </div>
            </CardContent>
          </Card>

          <Card className='card-art-elevated'>
            <CardContent className='p-8 text-center space-y-4'>
              <div className='w-12 h-12 bg-gradient-ink rounded-full flex items-center justify-center mx-auto'>
                <MapPin className='w-6 h-6 text-white dark:text-paper' />
              </div>
              <h3 className='font-display text-xl font-semibold text-ink'>
                전시 장소
              </h3>
              <div className='space-y-2'>
                <p className='font-medium text-ink'>인사동 한국미술관</p>
                <p className='text-sm text-ink-light'>2층 전시실</p>
                <p className='text-xs text-ink-lighter'>
                  서울시 종로구 인사동길
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='card-art-elevated md:col-span-2 lg:col-span-1'>
            <CardContent className='p-8 text-center space-y-4'>
              <div className='w-12 h-12 bg-gradient-ink rounded-full flex items-center justify-center mx-auto'>
                <ArrowRight className='w-6 h-6 text-white dark:text-paper' />
              </div>
              <h3 className='font-display text-xl font-semibold text-ink'>
                관람 안내
              </h3>
              <div className='space-y-2'>
                <p className='font-medium text-ink'>무료 관람</p>
                <p className='text-sm text-ink-light'>사전 예약 불필요</p>
                <p className='text-xs text-ink-lighter'>단체 관람 문의 환영</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='mt-12 text-center'>
          <Button asChild size='lg' className='btn-art'>
            <Link href='/exhibition'>
              전시 상세 정보
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// 메인 페이지 컴포넌트
export default function HomePage() {
  return (
    <main className='min-h-screen'>
      <ArtNavigation variant='transparent' />
      <HeroSection />
      <NavigationSpacer />
      <FeaturedWorksSection />
      <ArtistSection />
      <ExhibitionSection />
    </main>
  )
}
