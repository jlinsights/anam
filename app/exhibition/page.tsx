import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
// import KakaoMap from "@/components/kakao-map";
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Mail, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'

const exhibitionInfo = {
  title: '먹, 그리고...',
  titleEn: 'Ink, and...',
  subtitle: '아남 배옥영 개인전',
  subtitleChinese: '芽南 裵玉永',
  period: '2026년 4월 15일(화) ~ 4월 20일(일)',
  venue: '예술의전당 서울서예박물관 제1전시실',
  address: '〶06757 서울시 서초구 남부순환로 2406',
  hours: '10:00 - 18:00',
  closed: '전시 기간 중 무휴',
  admission: '무료',
  artist: {
    name: '아남 배옥영',
    title: '사단법인 동양서예협회 초대작가',
    phone: '010-5405-6071',
    email: 'anam8488@hanmail.net',
  },
}

const programs = [
  {
    title: '작가와의 만남',
    schedule: '4월 18일(금) 14:00',
    duration: '60분',
    capacity: '30명',
    description: '아남 배옥영 작가와 함께하는 특별한 대화 시간',
  },
  {
    title: '서예 시연',
    schedule: '매일 15:00',
    duration: '30분',
    capacity: '제한없음',
    description: '작가의 실제 서예 창작 과정을 지켜보는 특별한 시간',
  },
  {
    title: '갤러리 토크',
    schedule: '4월 19일(토) 16:00',
    duration: '45분',
    capacity: '20명',
    description: '작품에 담긴 철학과 의미에 대한 깊이 있는 해설',
  },
]

export default function ExhibitionPage() {
  return (
    <div className='min-h-screen bg-paper relative overflow-hidden flex flex-col'>
      {/* Zen Brutalism Foundation Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 zen-breathe-deep opacity-20' />
        <div className='absolute inset-0 ink-flow-ambient opacity-10' />
      </div>

      <ArtNavigation />
      
      {/* Zen Brutalist Hero for Exhibition Page */}
      <ZenBrutalistHero
        phase="2"
        title={{
          main: exhibitionInfo.title,
          sub: exhibitionInfo.titleEn,
          english: exhibitionInfo.subtitle
        }}
        description={{
          primary: "먹을 먹고, 그리고... 인생의 매 순간이 하나의 여정이며",
          secondary: "붓을 들고 종이 위에 획을 그어나가는 것 또한 그 과정을 만들어가는 것입니다"
        }}
        concept="EXHIBITION 2026"
        navigation={{
          prev: { href: '/artist', label: '작가 소개' },
          demo: { href: '/zen-demo', label: 'Zen 체험' }
        }}
        variant="fusion"
        enableInteraction={true}
        className="min-h-[60vh]"
      />

      <NavigationSpacer />

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8 relative z-10 flex-1'>
        <div className='max-w-7xl mx-auto'>

          {/* Exhibition Details */}
          <section className='mb-16 temporal-depth'>
            <div className='grid md:grid-cols-2 gap-12'>
              {/* Date & Venue */}
              <div className='space-y-8 void-contemplative'>
                <div className='space-y-6'>
                  <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                    <div className='flex items-start space-x-4'>
                      <div className='w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0'>
                        <Calendar className='h-6 w-6 text-yellow-600' />
                      </div>
                      <div className='space-y-2'>
                        <h3 className='zen-typography-section text-ink stroke-horizontal'>
                          전시 기간
                        </h3>
                        <div className='flex items-center space-x-zen-sm'>
                          <span className='zen-typography-body text-ink-light'>
                            {exhibitionInfo.period}
                          </span>
                        </div>
                        <p className='zen-typography-body text-ink-light text-sm void-minimal'>
                          {exhibitionInfo.closed}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                    <div className='flex items-start space-x-zen-lg'>
                      <div className='w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0'>
                        <MapPin className='h-6 w-6 text-gold' />
                      </div>
                      <div className='space-y-zen-sm'>
                        <h3 className='zen-typography-section text-ink stroke-horizontal'>
                          전시 장소
                        </h3>
                        <div className='space-y-zen-xs'>
                          <p className='zen-typography-body text-ink-light'>
                            {exhibitionInfo.venue}
                          </p>
                          <p className='zen-typography-body text-ink-light text-sm void-minimal'>
                            {exhibitionInfo.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours & Contact */}
              <div className='space-y-zen-xl void-contemplative'>
                <div className='space-y-zen-lg'>
                  <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                    <div className='flex items-start space-x-zen-lg'>
                      <div className='w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0'>
                        <Clock className='h-6 w-6 text-gold' />
                      </div>
                      <div className='space-y-zen-sm'>
                        <h3 className='zen-typography-section text-ink stroke-horizontal'>
                          관람 시간
                        </h3>
                        <div className='flex items-center space-x-zen-sm'>
                          <span className='zen-typography-body text-ink-light'>
                            {exhibitionInfo.hours}
                          </span>
                        </div>
                        <p className='zen-typography-body text-ink-light text-sm void-minimal'>
                          입장료: {exhibitionInfo.admission}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                    <div className='flex items-start space-x-zen-lg'>
                      <div className='w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0'>
                        <User className='h-6 w-6 text-gold' />
                      </div>
                      <div className='space-y-zen-sm'>
                        <h3 className='zen-typography-section text-ink stroke-horizontal'>
                          작가 정보
                        </h3>
                        <div className='space-y-zen-sm'>
                          <p className='zen-typography-body text-ink'>
                            {exhibitionInfo.artist.name}
                          </p>
                          <p className='zen-typography-body text-ink-light text-sm void-minimal'>
                            {exhibitionInfo.artist.title}
                          </p>
                          <div className='flex items-center space-x-zen-sm'>
                            <Phone className='h-4 w-4 text-gold' />
                            <span className='zen-typography-body text-ink-light text-sm'>
                              {exhibitionInfo.artist.phone}
                            </span>
                          </div>
                          <div className='flex items-center space-x-zen-sm'>
                            <Mail className='h-4 w-4 text-gold' />
                            <span className='zen-typography-body text-ink-light text-sm'>
                              {exhibitionInfo.artist.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Programs */}
          <section className='mb-zen-3xl cultural-context'>
            <h2 className='zen-typography-display text-ink text-center mb-zen-3xl stroke-press'>
              특별 프로그램
            </h2>

            <div className='grid md:grid-cols-3 gap-zen-xl temporal-depth'>
              {programs.map((program, index) => (
                <div
                  key={index}
                  className='zen-brutalist-card glass-layer-2 zen-hover-scale void-breathing'
                >
                  <h3 className='zen-typography-section text-ink stroke-horizontal mb-zen-lg'>
                    {program.title}
                  </h3>
                  <div className='space-y-zen-md'>
                    <div className='flex items-center space-x-zen-sm'>
                      <div className='p-zen-xs bg-gold/10 rounded-lg'>
                        <Calendar className='h-4 w-4 text-gold' />
                      </div>
                      <span className='zen-typography-body text-ink-light'>{program.schedule}</span>
                    </div>
                    <div className='flex items-center space-x-zen-sm'>
                      <div className='p-zen-xs bg-gold/10 rounded-lg'>
                        <Clock className='h-4 w-4 text-gold' />
                      </div>
                      <span className='zen-typography-body text-ink-light'>{program.duration}</span>
                    </div>
                    <div className='flex items-center space-x-zen-sm'>
                      <div className='p-zen-xs bg-gold/10 rounded-lg'>
                        <User className='h-4 w-4 text-gold' />
                      </div>
                      <span className='zen-typography-body text-ink-light'>
                        정원: {program.capacity}
                      </span>
                    </div>
                  </div>
                  <p className='zen-typography-body text-ink-light mt-zen-lg leading-relaxed void-minimal'>
                    {program.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Map */}
          <section className='mb-zen-3xl cultural-context'>
            <h2 className='zen-typography-display text-ink text-center mb-zen-3xl stroke-press'>
              오시는 길
            </h2>
            <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
              {/* <KakaoMap
                latitude={37.5735}
                longitude={126.9854}
                placeName="서예박물관"
                address="서울특별시 종로구 계동길 84"
              /> */}
              <div className='text-center temporal-depth'>
                <p className='zen-typography-body text-ink-light mb-zen-sm'>{exhibitionInfo.address}</p>
                <p className='zen-typography-body text-ink-light text-sm void-minimal'>
                  지하철 2호선 서초역 5번 출구에서 도보 10분<br />
                  지하철 3호선 남부터미널역 5번 출구에서 도보 15분
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className='text-center void-contemplative'>
            <div className='zen-brutalist-card glass-layer-2 zen-hover-scale cultural-context'>
              <h3 className='zen-typography-hero text-ink stroke-press mb-zen-lg'>
                전시 관람 예약
              </h3>
              <p className='zen-typography-body text-ink-light mb-zen-2xl void-breathing'>
                더 나은 관람 경험을 위해 사전 예약을 권장합니다.
              </p>
              <div className='flex flex-col sm:flex-row gap-zen-lg justify-center'>
                <Button asChild className='btn-art px-zen-xl py-zen-lg brutal-shadow zen-hover-scale'>
                  <Link href='/contact'>관람 예약하기</Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='btn-art-outline px-zen-xl py-zen-lg zen-hover-scale'
                >
                  <Link href='/gallery'>작품 미리보기</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter 
        variant="fusion" 
        showPhaseNavigation={true} 
        enableInteraction={true}
      />
    </div>
  )
}
