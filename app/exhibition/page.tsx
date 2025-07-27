import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
// import KakaoMap from "@/components/kakao-map";
import { PageHeader } from '@/components/section-header'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Mail, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'

const exhibitionInfo = {
  title: '길',
  titleEn: 'Way',
      subtitle: '아남 배옥영 개인전',
  subtitleChinese: '芽南 裵玉永',
  period: '2025.06.18 - 06.24',
  venue: '인사동 한국미술관 2층',
  address: '서울특별시 종로구 인사동길 41-1',
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
    schedule: '6월 21일(토) 14:00',
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
    schedule: '6월 22일(일) 16:00',
    duration: '45분',
    capacity: '20명',
    description: '작품에 담긴 철학과 의미에 대한 깊이 있는 해설',
  },
]

export default function ExhibitionPage() {
  return (
    <div className='min-h-screen bg-background'>
      <ArtNavigation />
      <NavigationSpacer />

      {/* Main Content */}
      <main className='section-padding'>
        <div className='container-art'>
          {/* Page Header */}
          <PageHeader
            breadcrumb={[{ label: '홈', href: '/' }, { label: '전시 정보' }]}
            title={`${exhibitionInfo.title} (${exhibitionInfo.titleEn})`}
            subtitle={exhibitionInfo.subtitle}
            description='인생의 매 순간이 하나의 길이며, 붓을 들고 종이 위에 획을 그어나가는 것 또한 길을 만들어가는 과정입니다.'
            badge='Exhibition'
            variant='default'
            size='lg'
          />

          {/* Exhibition Hero */}
          <section
            className='relative overflow-hidden rounded-lg mb-16'
            style={{
              backgroundImage: `url('/Images/Artworks/2025/heelang-way-2025-large.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '400px',
            }}
          >
            <div className='absolute inset-0 bg-black/40 dark:bg-black/60'></div>
            <div className='relative z-10 h-full flex items-center justify-center'>
              <div className='text-center space-y-4'>
                <h2 className='font-display text-4xl lg:text-5xl text-white drop-shadow-lg'>
                  {exhibitionInfo.title}
                </h2>
                <p className='font-english text-xl text-white/90 drop-shadow-md'>
                  {exhibitionInfo.titleEn}
                </p>
                <p className='font-korean text-lg text-white/80 drop-shadow-md'>
                  {exhibitionInfo.subtitleChinese}
                </p>
              </div>
            </div>
          </section>

          {/* Exhibition Details */}
          <section className='mb-16'>
            <div className='grid md:grid-cols-2 gap-12'>
              {/* Date & Venue */}
              <div className='space-y-8'>
                <div className='space-y-6'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-ink/10 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Calendar className='h-6 w-6 text-ink-light' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='font-display text-xl text-ink'>
                        전시 기간
                      </h3>
                      <div className='flex items-center space-x-3 text-lg'>
                        <span className='font-body text-ink-light'>
                          {exhibitionInfo.period}
                        </span>
                      </div>
                      <p className='font-body text-sm text-ink-light'>
                        {exhibitionInfo.closed}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-ink/10 rounded-full flex items-center justify-center flex-shrink-0'>
                      <MapPin className='h-6 w-6 text-ink-light' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='font-display text-xl text-ink'>
                        전시 장소
                      </h3>
                      <div className='space-y-1'>
                        <p className='font-body text-ink-light'>
                          {exhibitionInfo.venue}
                        </p>
                        <p className='font-body text-sm text-ink-light'>
                          {exhibitionInfo.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours & Contact */}
              <div className='space-y-8'>
                <div className='space-y-6'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-ink/10 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Clock className='h-6 w-6 text-ink-light' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='font-display text-xl text-ink'>
                        관람 시간
                      </h3>
                      <div className='flex items-center space-x-3'>
                        <span className='font-body text-ink-light'>
                          {exhibitionInfo.hours}
                        </span>
                      </div>
                      <p className='font-body text-sm text-ink-light'>
                        입장료: {exhibitionInfo.admission}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-ink/10 rounded-full flex items-center justify-center flex-shrink-0'>
                      <User className='h-6 w-6 text-ink-light' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='font-display text-xl text-ink'>
                        작가 정보
                      </h3>
                      <div className='space-y-2'>
                        <p className='font-body text-ink'>
                          {exhibitionInfo.artist.name}
                        </p>
                        <p className='font-body text-sm text-ink-light'>
                          {exhibitionInfo.artist.title}
                        </p>
                        <div className='flex items-center space-x-3'>
                          <Phone className='h-4 w-4 text-ink-light' />
                          <span className='font-body text-ink-light'>
                            {exhibitionInfo.artist.phone}
                          </span>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Mail className='h-4 w-4 text-ink-light' />
                          <span className='font-body text-ink-light'>
                            {exhibitionInfo.artist.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Programs */}
          <section className='mb-16'>
            <h2 className='font-display text-3xl text-ink text-center mb-12'>
              특별 프로그램
            </h2>

            <div className='grid md:grid-cols-3 gap-8'>
              {programs.map((program, index) => (
                <div
                  key={index}
                  className='bg-paper/50 rounded-lg p-6 border border-border/30 hover:shadow-lg transition-shadow'
                >
                  <h3 className='font-display text-xl text-ink mb-4'>
                    {program.title}
                  </h3>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='h-4 w-4 text-ink-light' />
                      <span className='text-ink-light'>{program.schedule}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Clock className='h-4 w-4 text-ink-light' />
                      <span className='text-ink-light'>{program.duration}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <User className='h-4 w-4 text-ink-light' />
                      <span className='text-ink-light'>
                        정원: {program.capacity}
                      </span>
                    </div>
                  </div>
                  <p className='text-ink-light mt-4 text-sm leading-relaxed'>
                    {program.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Map */}
          <section className='mb-16'>
            <h2 className='font-display text-3xl text-ink text-center mb-12'>
              오시는 길
            </h2>
            <div className='bg-paper/50 rounded-lg p-6 border border-border/30'>
              {/* <KakaoMap
                latitude={37.5735}
                longitude={126.9854}
                placeName="인사동 한국미술관"
                address="서울특별시 종로구 인사동길 41-1"
              /> */}
              <div className='mt-6 text-center'>
                <p className='text-ink-light mb-2'>{exhibitionInfo.address}</p>
                <p className='text-sm text-ink-light'>
                  지하철 3호선 안국역 6번 출구에서 도보 5분
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className='text-center'>
            <div className='bg-ink/5 rounded-lg p-8 border border-border/30'>
              <h3 className='font-display text-2xl text-ink mb-4'>
                전시 관람 예약
              </h3>
              <p className='text-ink-light mb-6'>
                더 나은 관람 경험을 위해 사전 예약을 권장합니다.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button asChild className='btn-art'>
                  <Link href='/contact'>관람 예약하기</Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='border-ink/20 text-ink hover:bg-ink/5'
                >
                  <Link href='/gallery'>작품 미리보기</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
