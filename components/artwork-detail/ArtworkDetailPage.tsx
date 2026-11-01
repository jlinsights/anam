import Image from 'next/image'
import Link from 'next/link'
import type { Artwork, Artist } from '@/lib/types'
import { ArtworkImage } from '@/components/common/ProgressiveImage'
import { ArtworkErrorBoundary } from '@/components/error-boundary/ArtworkErrorBoundary'
import { ArtworkKeyNav } from '@/components/artwork-detail/ArtworkKeyNav'
import {
  fullImageFor,
  previewImageFor,
  sortByNumber,
} from '@/lib/artwork-full-image'

interface ArtworkDetailPageProps {
  artwork: Artwork
  allArtworks: Artwork[]
  artist?: Artist
}

const RELATED_COUNT = 6

// 표구한 족자처럼: 잘리지 않은 작품을 한지 여백과 먹선 2px 틀 안에 앉힌다 (DESIGN.md)
export function ArtworkDetailPage({
  artwork,
  allArtworks,
  artist,
}: ArtworkDetailPageProps) {
  const ordered = sortByNumber(allArtworks)
  const index = ordered.findIndex((work) => work.id === artwork.id)
  const previous = index > 0 ? ordered[index - 1] : null
  const next =
    index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null
  const others = pickOthers(ordered, index)
  const image = fullImageFor(artwork)

  const facts = [
    { label: '제작 연도', value: artwork.year ? `${artwork.year}년` : '' },
    { label: '재료', value: artwork.medium },
    { label: '크기', value: artwork.dimensions },
  ].filter((fact) => fact.value)

  const inquiryHref = `/contact?artwork=${encodeURIComponent(artwork.title)}`
  const hrefFor = (work: Artwork | null) =>
    work ? `/gallery/${work.slug || work.id}` : null
  const neighbourImages = [previous, next]
    .map((work) => (work ? fullImageFor(work)?.src : undefined))
    .filter((src): src is string => Boolean(src))

  return (
    <ArtworkErrorBoundary>
      <div className='min-h-screen bg-paper text-ink'>
        <ArtworkKeyNav
          previousHref={hrefFor(previous)}
          nextHref={hrefFor(next)}
          prefetchImages={neighbourImages}
        />
        <nav aria-label='작품 이동' className='border-b-2 border-ink'>
          <div className='max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-6 font-body text-sm'>
            <Link
              href='/gallery'
              className='inline-flex items-center gap-2 py-2 hover:text-ink-light transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
            >
              <span aria-hidden='true'>←</span>
              작품 목록
            </Link>

            <div className='flex items-center gap-1'>
              <StepLink artwork={previous} direction='previous' />
              {index >= 0 && (
                <span className='px-3 tabular-nums text-ink-light'>
                  {index + 1} / {ordered.length}
                </span>
              )}
              <StepLink artwork={next} direction='next' />
            </div>
          </div>
        </nav>

        <div className='max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start'>
            <figure className='lg:col-span-7'>
              <div className='border-2 border-ink bg-paper-warm p-5 md:p-10 flex justify-center'>
                {image ? (
                  <Image
                    src={image.src}
                    width={image.width}
                    height={image.height}
                    alt={`${artwork.title}, ${artist?.name ?? '아남 배옥영'} 작`}
                    priority
                    sizes='(min-width: 1280px) 680px, (min-width: 1024px) 55vw, 92vw'
                    className='h-auto w-auto max-w-full max-h-[78vh] object-contain'
                  />
                ) : (
                  <div className='relative w-full aspect-square'>
                    <ArtworkImage
                      artwork={artwork}
                      size='large'
                      className='absolute inset-0'
                      priority
                    />
                  </div>
                )}
              </div>
              {image && (
                <figcaption className='mt-3 font-body text-xs text-ink-light'>
                  <a
                    href={image.src}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline underline-offset-4 hover:text-ink transition-colors duration-300'
                  >
                    큰 이미지로 보기
                    <span className='sr-only'> (새 창)</span>
                  </a>
                </figcaption>
              )}
            </figure>

            <section
              aria-labelledby='artwork-title'
              className='lg:col-span-5 lg:sticky lg:top-24'
            >
              <h1
                id='artwork-title'
                className='font-display font-bold text-3xl md:text-4xl leading-tight tracking-[-0.02em] text-balance'
              >
                {artwork.title}
              </h1>
              <p className='mt-3 font-display text-ink-light'>
                {artist?.name ?? '아남 배옥영'}
              </p>

              {facts.length > 0 && (
                <dl className='mt-10 border-t-2 border-ink font-body text-sm'>
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className='grid grid-cols-[6rem_1fr] gap-4 py-3 border-b border-stone'
                    >
                      <dt className='text-ink-light'>{fact.label}</dt>
                      <dd className='tabular-nums'>{fact.value}</dd>
                    </div>
                  ))}
                  {artwork.available && (
                    <div className='grid grid-cols-[6rem_1fr] gap-4 py-3 border-b border-stone'>
                      <dt className='text-ink-light'>소장</dt>
                      <dd className='inline-flex items-center gap-2'>
                        <span
                          aria-hidden='true'
                          className='inline-block w-2 h-2 bg-gold'
                        />
                        소장 문의 가능
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {artwork.description && (
                <div className='mt-10'>
                  <h2 className='font-display font-bold text-lg'>작품 해설</h2>
                  <p className='mt-3 font-display leading-[1.85] whitespace-pre-line max-w-[60ch]'>
                    {artwork.description}
                  </p>
                </div>
              )}

              {artwork.artistNote && (
                <blockquote className='mt-10 border-t border-stone pt-6 font-display leading-[1.85] whitespace-pre-line max-w-[60ch]'>
                  {artwork.artistNote}
                  <footer className='mt-3 font-body text-sm text-ink-light'>
                    작가의 말
                  </footer>
                </blockquote>
              )}

              <div className='mt-12 flex flex-col sm:flex-row sm:items-center gap-5'>
                <Link
                  href={inquiryHref}
                  className='inline-flex justify-center items-center px-8 py-4 bg-ink text-paper font-body font-medium border-2 border-ink hover:bg-paper hover:text-ink transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
                >
                  이 작품 문의하기
                </Link>
                <Link
                  href='/artist'
                  className='font-body text-sm underline underline-offset-4 hover:text-ink-light transition-colors duration-300'
                >
                  작가 소개
                </Link>
              </div>
            </section>
          </div>

          {others.length > 0 && (
            <section
              aria-labelledby='other-works'
              className='mt-24 md:mt-32 pt-12 border-t-2 border-ink'
            >
              <div className='flex items-baseline justify-between gap-6'>
                <h2
                  id='other-works'
                  className='font-display font-bold text-2xl'
                >
                  다른 작품
                </h2>
                <Link
                  href='/gallery'
                  className='font-body text-sm underline underline-offset-4 hover:text-ink-light transition-colors duration-300'
                >
                  전체 {ordered.length}점 보기
                </Link>
              </div>
              <ul className='mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10'>
                {others.map((work) => (
                  <li key={work.id}>
                    <OtherWork artwork={work} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </ArtworkErrorBoundary>
  )
}

// 현재 작품 다음부터 번호 순으로 이어지는 작품들 (끝에 닿으면 처음으로 돈다)
function pickOthers(ordered: Artwork[], index: number): Artwork[] {
  if (ordered.length <= 1) return []
  const start = index >= 0 ? index + 1 : 0
  const count = Math.min(RELATED_COUNT, ordered.length - 1)
  return Array.from(
    { length: count },
    (_, offset) => ordered[(start + offset) % ordered.length]
  ).filter((work) => work !== ordered[index])
}

interface StepLinkProps {
  artwork: Artwork | null
  direction: 'previous' | 'next'
}

function StepLink({ artwork, direction }: StepLinkProps) {
  const label = direction === 'previous' ? '이전 작품' : '다음 작품'
  const arrow = direction === 'previous' ? '←' : '→'
  const base =
    'w-11 h-11 inline-flex items-center justify-center border-2 transition-colors duration-300'

  // 처음·끝 작품에서는 흐린 화살표 대신 같은 크기의 빈칸만 둔다(누를 수 없는 글자가 대비 검사에 걸리지 않게)
  if (!artwork) {
    return <span aria-hidden='true' className={`${base} border-transparent`} />
  }

  return (
    <Link
      href={`/gallery/${artwork.slug}`}
      aria-label={`${label}: ${artwork.title}`}
      aria-keyshortcuts={direction === 'previous' ? 'ArrowLeft' : 'ArrowRight'}
      title={`${artwork.title} (키보드 ${arrow})`}
      className={`${base} border-transparent hover:border-ink focus-visible:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
    >
      <span aria-hidden='true'>{arrow}</span>
    </Link>
  )
}

function OtherWork({ artwork }: { artwork: Artwork }) {
  // 약 160px 칸이므로 1800px 원본 대신 잘리지 않은 800px medium 을 쓴다
  const image = previewImageFor(artwork)

  return (
    <Link
      href={`/gallery/${artwork.slug}`}
      className='group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
    >
      <div className='aspect-square border-2 border-ink bg-paper-warm p-3 transition-colors duration-300 group-hover:bg-paper-cream'>
        {/* 세로로 긴 족자도 칸을 늘리지 않도록 정사각형 안에 채워 맞춘다 */}
        <div className='relative w-full h-full'>
          {image ? (
            <Image
              src={image.src}
              fill
              alt=''
              sizes='(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw'
              className='object-contain'
            />
          ) : (
            <ArtworkImage
              artwork={artwork}
              size='thumb'
              alt=''
              className='absolute inset-0'
            />
          )}
        </div>
      </div>
      <p className='mt-3 font-display text-sm leading-snug group-hover:underline underline-offset-4'>
        {artwork.title}
      </p>
      {artwork.year ? (
        <p className='mt-1 font-body text-xs text-ink-light tabular-nums'>
          {artwork.year}
        </p>
      ) : null}
    </Link>
  )
}
