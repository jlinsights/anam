import Link from 'next/link'

interface HeroArtwork {
  id: string
  title: string
  imageUrl: string
  year: string
  medium: string
  /** 상세로 가는 주소 */
  href?: string
  width?: number
  height?: number
}

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  featuredArtwork?: HeroArtwork
}

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'

// 홈 첫 화면. 예전에는 스크롤 시차·마우스 따라 도는 배경·맥박 뛰는 점·떠다니는 카드가 겹쳤고
// 대표작은 정사각형으로 잘린 그림을 둥근 4:5 틀에 다시 잘라 넣었다. 이제 움직임 없이 잘리지 않은 작품을 보인다
export function HeroSection({
  title = '아남 배옥영',
  subtitle = '전통과 현대가 만나는 서예의 새로운 지평',
  description = '깊이 있는 전통 서예 기법과 현대적 감각이 조화를 이루는 독창적인 작품 세계를 만나보세요.',
  featuredArtwork,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby='hero-title'
      className='mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:px-8 lg:grid-cols-12 lg:gap-16 lg:pt-20 lg:pb-24'
    >
      <div className='lg:col-span-6'>
        <h1
          id='hero-title'
          className='font-display text-5xl leading-tight tracking-[-0.02em] text-ink sm:text-6xl lg:text-7xl'
        >
          {title}
        </h1>
        <p className='mt-4 font-display text-xl text-ink-light sm:text-2xl'>
          {subtitle}
        </p>
        <p className='mt-8 max-w-[34rem] font-body text-lg leading-relaxed text-ink'>
          {description}
        </p>
        <div className='mt-10 flex flex-wrap items-center gap-x-8 gap-y-4'>
          <Link
            href='/gallery'
            className={`inline-flex min-h-[52px] items-center border-2 border-ink bg-ink px-8 font-body text-base text-paper transition-colors hover:bg-paper hover:text-ink ${FOCUS}`}
          >
            갤러리 둘러보기
          </Link>
          <Link
            href='/artist'
            className={`inline-flex min-h-[44px] items-center border-b-2 border-ink font-body text-base text-ink transition-colors hover:border-gold ${FOCUS}`}
          >
            작가 소개
          </Link>
          <Link
            href='/contact'
            className={`inline-flex min-h-[44px] items-center border-b-2 border-ink/30 font-body text-base text-ink-light transition-colors hover:border-ink hover:text-ink ${FOCUS}`}
          >
            작품 문의
          </Link>
        </div>
      </div>

      {featuredArtwork?.imageUrl && (
        <figure className='lg:col-span-6'>
          <Link
            href={featuredArtwork.href ?? '/gallery'}
            className={`group block ${FOCUS}`}
          >
            <div className='flex aspect-[5/4] items-center justify-center border-2 border-ink bg-paper-warm p-6 sm:p-10'>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 파일을 그대로 준다(images.unoptimized) */}
              <img
                src={featuredArtwork.imageUrl}
                width={featuredArtwork.width}
                height={featuredArtwork.height}
                alt={featuredArtwork.title}
                loading='eager'
                fetchPriority='high'
                decoding='async'
                className='h-auto max-h-full w-auto max-w-full object-contain'
              />
            </div>
            <figcaption className='mt-3 flex items-baseline justify-between gap-4 font-body text-sm'>
              <span className='font-display text-base font-bold text-ink group-hover:underline group-hover:underline-offset-4'>
                {featuredArtwork.title}
              </span>
              <span className='shrink-0 text-ink-light tabular-nums'>
                {[featuredArtwork.year, featuredArtwork.medium]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </figcaption>
          </Link>
        </figure>
      )}
    </section>
  )
}
