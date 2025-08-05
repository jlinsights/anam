'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { ErrorBoundary } from '@/components/error-boundary'
import { Button } from '@/components/ui/button'
import type { Artwork } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, MapPin, Clock, Users, Award, BookOpen } from 'lucide-react'
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

// 전시 정보
const exhibitionInfo = {
  title: '먹, 그리고...',
  titleEn: 'INK, AND...',
  subtitle: 'Contemporary Calligraphy Solo Exhibition',
  period: '2026년 4월 15일(화) ~ 4월 20일(일)',
  location: '예술의전당 서울서예박물관',
  address: '서울시 서초구 남부순환로 2406',
  closed: '월요일 휴관',
  hours: '10:00 - 18:00',
  admission: '무료',
  artist: '아남 배옥영',
  curator: '서예문화원',
  sponsor: '문화체육관광부',
}

export default function ExhibitionPage() {
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
          'Failed to load featured artworks for exhibition hero:',
          error
        )
        // 안전한 fallback 데이터 사용
        setFeaturedArtworks(safeFallbackArtworks)
      }
    }

    loadFeaturedArtworks()
  }, [])

  return (
    <div className='min-h-screen bg-paper flex flex-col'>
      <ArtNavigation />

      {/* 더 컴팩트한 히어로 섹션 */}
      <ZenBrutalistHero
        phase='2'
        title={{
          main: exhibitionInfo.title,
          sub: exhibitionInfo.titleEn,
          english: exhibitionInfo.subtitle,
        }}
        description={{
          main: '먹을 먹고, 그리고... 인생의 매 순간이 하나의 여정',
          sub: '붓을 들고 종이 위에 획을 그어나가는 과정을 만들어가는 것',
        }}
        concept='EXHIBITION 2026'
        navigation={{
          prev: { href: '/artist', label: '작가 소개' },
          demo: { href: '/zen-demo', label: 'Zen 체험' },
        }}
        variant='fusion'
        enableInteraction={true}
        className='min-h-[30vh]'
        backgroundArtworks={featuredArtworks}
        showImageCarousel={featuredArtworks.length > 0}
      />

      <NavigationSpacer />

      {/* Main Content */}
      <main className='flex-1 py-12'>
        <div className='container mx-auto px-4 max-w-7xl'>
          {/* Exhibition Details - 2x2 그리드로 개편, 다크모드 시인성 개선 */}
          <section className='mb-16'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
              {/* 전시 기간 - 다크모드 대응 */}
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='flex items-start space-x-4'>
                  <div className='w-14 h-14 lg:w-16 lg:h-16 bg-gold/10 dark:bg-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                    <Calendar className='h-7 w-7 lg:h-8 lg:w-8 text-gold' />
                  </div>
                  <div className='space-y-3 min-w-0 flex-1'>
                    <h3 className='text-lg lg:text-xl font-bold text-foreground'>
                      전시 기간
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-base lg:text-lg font-semibold text-foreground'>
                        2026년 4월 15일(화)
                        <br className='sm:hidden' />
                        <span className='sm:ml-1'>~ 4월 20일(일)</span>
                      </p>
                      <p className='text-sm lg:text-base text-muted-foreground'>
                        {exhibitionInfo.closed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 전시 장소 - 다크모드 대응 */}
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='flex items-start space-x-4'>
                  <div className='w-14 h-14 lg:w-16 lg:h-16 bg-gold/10 dark:bg-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                    <MapPin className='h-7 w-7 lg:h-8 lg:w-8 text-gold' />
                  </div>
                  <div className='space-y-3 min-w-0 flex-1'>
                    <h3 className='text-lg lg:text-xl font-bold text-foreground'>
                      전시 장소
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-base lg:text-lg font-semibold text-foreground'>
                        예술의전당
                        <br className='sm:hidden' />
                        <span className='sm:ml-1'>서울서예박물관</span>
                      </p>
                      <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                        서울시 서초구 남부순환로 2406
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 관람 시간 - 다크모드 대응 */}
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='flex items-start space-x-4'>
                  <div className='w-14 h-14 lg:w-16 lg:h-16 bg-gold/10 dark:bg-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                    <Clock className='h-7 w-7 lg:h-8 lg:w-8 text-gold' />
                  </div>
                  <div className='space-y-3 min-w-0 flex-1'>
                    <h3 className='text-lg lg:text-xl font-bold text-foreground'>
                      관람 시간
                    </h3>
                    <div className='space-y-2'>
                      <p className='text-base lg:text-lg font-semibold text-foreground'>
                        오전 10시 - 오후 6시
                      </p>
                      <p className='text-sm lg:text-base text-muted-foreground'>
                        입장료: {exhibitionInfo.admission}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 작가 정보 - 다크모드 대응 */}
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='flex items-start space-x-4'>
                  <div className='w-14 h-14 lg:w-16 lg:h-16 bg-gold/10 dark:bg-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0'>
                    <Users className='h-7 w-7 lg:h-8 lg:w-8 text-gold' />
                  </div>
                  <div className='space-y-3 min-w-0 flex-1'>
                    <h3 className='text-lg lg:text-xl font-bold text-foreground'>
                      작가 정보
                    </h3>
                    <div className='space-y-3'>
                      <p className='text-base lg:text-lg font-semibold text-foreground'>
                        {exhibitionInfo.artist}
                      </p>
                      <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                        {exhibitionInfo.curator}
                      </p>
                      <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                        {exhibitionInfo.sponsor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Programs - 다크모드 지원 및 모바일 최적화 */}
          <section className='mb-20'>
            <div className='text-center mb-12'>
              <div className='inline-flex items-center px-4 py-2 bg-gold/10 dark:bg-gold/20 rounded-full mb-4'>
                <span className='text-gold text-sm font-medium tracking-wide'>
                  Special Programs
                </span>
              </div>
              <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>
                특별 프로그램
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                전시와 함께 즐기는 특별한 경험들
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-6 lg:gap-8'>
              {/* Placeholder for programs */}
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='mb-6'>
                  <h3 className='text-xl lg:text-2xl font-bold text-foreground mb-3'>
                    프로그램 1
                  </h3>
                  <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                    프로그램 1 설명
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Calendar className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        일정
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 1 일정
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Clock className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        소요시간
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 1 소요시간
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Users className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        정원
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 1 정원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='mb-6'>
                  <h3 className='text-xl lg:text-2xl font-bold text-foreground mb-3'>
                    프로그램 2
                  </h3>
                  <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                    프로그램 2 설명
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Calendar className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        일정
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 2 일정
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Clock className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        소요시간
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 2 소요시간
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Users className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        정원
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 2 정원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 dark:bg-card dark:border-border'>
                <div className='mb-6'>
                  <h3 className='text-xl lg:text-2xl font-bold text-foreground mb-3'>
                    프로그램 3
                  </h3>
                  <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                    프로그램 3 설명
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Calendar className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        일정
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 3 일정
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Clock className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        소요시간
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 3 소요시간
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 lg:w-12 lg:h-12 bg-gold/10 dark:bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Users className='h-5 w-5 lg:h-6 lg:w-6 text-gold' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs lg:text-sm text-muted-foreground mb-1'>
                        정원
                      </p>
                      <p className='text-sm lg:text-base font-semibold text-foreground'>
                        프로그램 3 정원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Map - 다크모드 지원 및 모바일 최적화 */}
          <section className='mb-20'>
            <div className='text-center mb-12'>
              <div className='inline-flex items-center px-4 py-2 bg-gold/10 dark:bg-gold/20 rounded-full mb-4'>
                <span className='text-gold text-sm font-medium tracking-wide'>
                  Location
                </span>
              </div>
              <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>
                오시는 길
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                편리한 교통편으로 전시장을 찾아오세요
              </p>
            </div>

            <div className='bg-background border border-border rounded-2xl p-6 lg:p-8 shadow-lg dark:bg-card dark:border-border'>
              <div className='grid md:grid-cols-2 gap-8 lg:gap-12 items-center'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-xl lg:text-2xl font-bold text-foreground mb-4'>
                      주소 및 위치
                    </h3>
                    <p className='text-base lg:text-lg font-semibold text-foreground mb-6 leading-relaxed'>
                      {exhibitionInfo.address}
                    </p>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-start space-x-4'>
                      <div className='w-8 h-8 lg:w-10 lg:h-10 bg-gold/20 dark:bg-gold/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                        <span className='text-gold text-sm lg:text-base font-bold'>
                          2
                        </span>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='font-semibold text-foreground text-sm lg:text-base mb-1'>
                          지하철 2호선
                        </p>
                        <p className='text-muted-foreground text-sm lg:text-base'>
                          서초역 5번 출구에서 도보 10분
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <div className='w-8 h-8 lg:w-10 lg:h-10 bg-gold/20 dark:bg-gold/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                        <span className='text-gold text-sm lg:text-base font-bold'>
                          3
                        </span>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='font-semibold text-foreground text-sm lg:text-base mb-1'>
                          지하철 3호선
                        </p>
                        <p className='text-muted-foreground text-sm lg:text-base'>
                          남부터미널역 5번 출구에서 도보 15분
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 지도 영역 - 다크모드 대응 */}
                <div className='bg-muted/30 dark:bg-muted/20 rounded-xl h-64 lg:h-80 flex items-center justify-center border border-border/50'>
                  <div className='text-center space-y-3'>
                    <div className='w-16 h-16 lg:w-20 lg:h-20 bg-gold/10 dark:bg-gold/20 rounded-full flex items-center justify-center mx-auto'>
                      <MapPin className='h-8 w-8 lg:h-10 lg:w-10 text-gold' />
                    </div>
                    <p className='text-muted-foreground text-sm lg:text-base'>
                      지도는 곧 제공될 예정입니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action - 다크모드 지원 및 모바일 최적화 */}
          <section className='text-center'>
            <div className='bg-gradient-to-r from-foreground to-gold/90 dark:from-foreground dark:to-gold/80 rounded-2xl p-8 lg:p-12 text-background shadow-xl'>
              <div className='space-y-6 lg:space-y-8'>
                <div>
                  <h3 className='text-2xl lg:text-3xl font-bold mb-3 lg:mb-4'>
                    전시 관람 예약
                  </h3>
                  <p className='text-base lg:text-xl mb-6 lg:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed'>
                    더 나은 관람 경험을 위해 사전 예약을 권장합니다.
                    <br className='hidden sm:block' />
                    특별 프로그램 참여를 원하시는 분은 미리 연락해 주세요.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center'>
                  <Button
                    asChild
                    size='lg'
                    className='bg-background text-foreground hover:bg-background/90 dark:bg-background dark:text-foreground dark:hover:bg-background/90 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto'
                  >
                    <Link href='/contact'>관람 예약하기</Link>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    size='lg'
                    className='border-background/30 text-background hover:bg-background/10 dark:border-background/40 dark:text-background dark:hover:bg-background/15 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg transition-all duration-200 w-full sm:w-auto'
                  >
                    <Link href='/gallery'>작품 미리보기</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter
        variant='cultural'
        showPhaseNavigation={true}
        enableInteraction={true}
      />
    </div>
  )
}
