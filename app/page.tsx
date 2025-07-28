'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ArtworkGrid } from '@/components/artwork-card'
import { SectionHeader } from '@/components/section-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
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

// Zen Brutalist Hero Section for Main Page
function MainPageHero() {
  return (
    <ZenBrutalistHero
      phase="1"
      title={{
        main: "먹, 그리고...",
        sub: "INK, AND...",
        english: "Contemporary Calligraphy Solo Exhibition"
      }}
      description={{
        primary: "아남 배옥영 개인전",
        secondary: "전통 서예의 정신과 현대적 감각이 어우러진 혁신적인 디지털 갤러리"
      }}
      concept="ZEN BRUTALISM FOUNDATION"
      navigation={{
        demo: { href: '/zen-demo', label: 'Zen 체험' },
        next: { href: '/gallery', label: '갤러리' }
      }}
      variant="fusion"
      enableInteraction={true}
      className="min-h-screen"
    />
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
    <section className='section-padding bg-paper zen-breathe-deep'>
      <div className='zen-brutalist-layout'>
        <div className='text-center mb-zen-3xl'>
          <span className='brutal-typography-accent text-gold text-sm uppercase tracking-wider mb-zen-md block'>
            Featured Works
          </span>
          <h2 className='zen-typography-section text-ink mb-zen-lg stroke-horizontal'>
            대표 작품
          </h2>
          <p className='zen-typography-hero text-ink-light mb-zen-lg'>
            문방사우와 서예의 조화
          </p>
          <p className='zen-typography-body text-ink-lighter max-w-4xl mx-auto void-breathing'>
            전통 서예의 정신과 현대적 감각이 어우러진 아남 작가의 대표작들을 만나보세요.
          </p>
        </div>

        <div className='mt-zen-3xl'>
          {loading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-zen-lg'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='zen-brutalist-card void-breathing'>
                  <div className='aspect-[3/4] bg-stone/20 animate-pulse rounded-xl' />
                  <div className='p-zen-md space-y-zen-sm'>
                    <div className='h-6 bg-stone/20 animate-pulse rounded' />
                    <div className='h-4 bg-stone/20 animate-pulse rounded w-3/4' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-zen-xl'>
              <ArtworkGrid
                artworks={featuredArtworks}
                variant='featured'
                columns={4}
                showActions={true}
              />
              
              {/* Zen Brutalist CTA */}
              <div className='text-center'>
                <Button
                  asChild
                  className='btn-art px-zen-2xl py-zen-lg brutal-shadow'
                >
                  <Link href='/gallery'>
                    전체 작품 보기
                    <ArrowRight className='ml-zen-sm h-4 w-4' />
                  </Link>
                </Button>
              </div>
            </div>
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
    <section className='section-padding bg-gradient-zen cultural-context'>
      <div className='zen-brutalist-layout'>
        <div className='grid lg:grid-cols-2 gap-zen-3xl items-center'>
          <div className='space-y-zen-2xl void-breathing'>
            <div className='text-left space-y-zen-lg'>
              <span className='brutal-typography-accent text-gold text-sm uppercase tracking-wider'>
                Artist
              </span>
              <h2 className='zen-typography-section text-ink stroke-vertical'>
                아남 배옥영
              </h2>
              <p className='zen-typography-hero text-ink-light stroke-horizontal'>
                서예가
              </p>
              <p className='zen-typography-body text-ink-lighter void-contemplative max-w-2xl'>
                전통 서예의 깊이와 현대적 감각을 조화시키며, 문방사우의 정신을 현대에 되살리는 작업을 하고 있습니다.
              </p>
              
              <div className='pt-zen-lg'>
                <Button
                  asChild
                  className='btn-art px-zen-xl py-zen-md brutal-shadow'
                >
                  <Link href='/artist'>
                    작가 소개 더보기
                    <ArrowRight className='ml-zen-sm h-4 w-4' />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className='relative void-breathing'>
            <div className='zen-brutalist-card overflow-hidden glass-layer-1 brutal-shadow-strong'>
              <div className='aspect-[4/5] relative bg-stone/10'>
                {loading ? (
                  <div className='w-full h-full flex items-center justify-center animate-pulse bg-stone/20 zen-breathe-slow' />
                ) : (
                  <>
                    <Image
                      src={profileImageUrl}
                      alt='아남 배옥영 작가 프로필'
                      fill
                      className='object-cover zen-hover-scale'
                      sizes='(max-width: 768px) 100vw, 50vw'
                      priority
                      placeholder='blur'
                      blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli5N4Q5Ox4DfveMEEAAkAAEAAA='
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent' />
                    <div className='absolute top-zen-md right-zen-md'>
                      <div className='w-12 h-12 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center'>
                        <span className='text-gold text-sm font-bold'>芽南</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {error && (
              <div className='text-red-500 text-sm mt-zen-sm void-minimal'>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// 전시 정보 섹션 with Zen Brutalism
function ExhibitionSection() {
  return (
    <section className='section-padding bg-paper temporal-depth'>
      <div className='zen-brutalist-layout'>
        <div className='text-center mb-zen-3xl void-contemplative'>
          <span className='brutal-typography-accent text-gold text-sm uppercase tracking-wider mb-zen-md block'>
            Exhibition
          </span>
          <h2 className='zen-typography-section text-ink mb-zen-lg stroke-press'>
            전시 정보
          </h2>
          <p className='zen-typography-hero text-ink-light mb-zen-lg'>
            먹, 그리고... 道
          </p>
          <p className='zen-typography-body text-ink-lighter max-w-4xl mx-auto void-breathing'>
            2026년 4월, 서예박물관에서 열리는 아남 배옥영 작가의 개인전에 여러분을 초대합니다.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-zen-xl mb-zen-3xl'>
          {/* 전시 기간 */}
          <div className='zen-brutalist-card glass-layer-1 text-center space-y-zen-lg'>
            <div className='w-16 h-16 bg-gradient-to-br from-ink to-gold rounded-full flex items-center justify-center mx-auto brutal-shadow-soft'>
              <Calendar className='w-6 h-6 text-paper' />
            </div>
            <h3 className='zen-typography-hero text-ink'>
              전시 기간
            </h3>
            <div className='space-y-zen-sm void-breathing'>
              <p className='zen-typography-body text-ink font-medium'>2026년 4월 15일(화) ~ 4월 20일(일)</p>
              <p className='text-ink-light'>6일간</p>
              <p className='text-ink-lighter text-sm'>오전 10시 - 오후 6시</p>
            </div>
          </div>

          {/* 전시 장소 */}
          <div className='zen-brutalist-card glass-layer-1 text-center space-y-zen-lg'>
            <div className='w-16 h-16 bg-gradient-to-br from-ink to-gold rounded-full flex items-center justify-center mx-auto brutal-shadow-soft'>
              <MapPin className='w-6 h-6 text-paper' />
            </div>
            <h3 className='zen-typography-hero text-ink'>
              전시 장소
            </h3>
            <div className='space-y-zen-sm void-breathing'>
              <p className='zen-typography-body text-ink font-medium'>서예박물관</p>
              <p className='text-ink-light'>제1전시실</p>
              <p className='text-ink-lighter text-sm'>
                한국 전통 서예 문화의 성지
              </p>
            </div>
          </div>

          {/* 관람 안내 */}
          <div className='zen-brutalist-card glass-layer-1 text-center space-y-zen-lg md:col-span-2 lg:col-span-1'>
            <div className='w-16 h-16 bg-gradient-to-br from-ink to-gold rounded-full flex items-center justify-center mx-auto brutal-shadow-soft'>
              <ArrowRight className='w-6 h-6 text-paper' />
            </div>
            <h3 className='zen-typography-hero text-ink'>
              관람 안내
            </h3>
            <div className='space-y-zen-sm void-breathing'>
              <p className='zen-typography-body text-ink font-medium'>무료 관람</p>
              <p className='text-ink-light'>사전 예약 불필요</p>
              <p className='text-ink-lighter text-sm'>단체 관람 문의 환영</p>
            </div>
          </div>
        </div>

        <div className='text-center void-contemplative'>
          <Button 
            asChild 
            className='btn-art px-zen-2xl py-zen-lg brutal-shadow-strong'
          >
            <Link href='/exhibition'>
              전시 상세 정보
              <ArrowRight className='ml-zen-sm h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// 메인 페이지 컴포넌트 with Zen Brutalism Foundation
export default function HomePage() {
  return (
    <main className='min-h-screen bg-paper relative overflow-hidden flex flex-col'>
      {/* Zen Brutalism Foundation Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 zen-breathe-deep opacity-2' />
        <div className='absolute inset-0 ink-flow-ambient opacity-1' />
      </div>

      {/* Enhanced Navigation */}
      <ArtNavigation variant='transparent' />
      
      {/* Zen Brutalist Hero */}
      <MainPageHero />
      
      {/* Navigation Spacer */}
      <NavigationSpacer />
      
      {/* Enhanced Sections */}
      <div className='relative z-10 space-y-0'>
        <FeaturedWorksSection />
        <ArtistSection />
        <ExhibitionSection />
      </div>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter 
        variant="zen" 
        showPhaseNavigation={true} 
        enableInteraction={true}
      />
    </main>
  )
}
