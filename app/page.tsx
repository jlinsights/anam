'use client'

import type { Artwork } from '@/lib/types'
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from 'react'
import { useArtworks, useArtist } from '@/hooks/use-artwork-api'
import Link from 'next/link'
import { ExhibitionHistory } from '@/components/exhibition/ExhibitionHistory'
import { ArtworkTile } from '@/components/gallery/ArtworkTile'
import { exhibitionHistory } from '@/lib/exhibition-history'
import { previewImageFor } from '@/lib/artwork-full-image'

const HeroSection = lazy(() =>
  import('@/components/sections/HeroSection').then((mod) => ({
    default: mod.HeroSection,
  }))
)

const PAGE_SIZE = 8
const PRELOAD_TIMEOUT_MS = 2500
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'

// 다음 작품들의 그림을 먼저 받아 둔다. 다 받거나 시간이 지나면 넘어간다(빈 칸이 번쩍이지 않게)
function preloadImages(srcs: string[]): Promise<void> {
  const loads = srcs.map(
    (src) =>
      new Promise<void>((resolve) => {
        const img = new window.Image()
        img.src = src
        if (typeof img.decode !== 'function') return resolve()
        img.decode().then(
          () => resolve(),
          () => resolve()
        )
      })
  )
  const timeout = new Promise<void>((resolve) =>
    setTimeout(resolve, PRELOAD_TIMEOUT_MS)
  )
  return Promise.race([Promise.all(loads).then(() => undefined), timeout])
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => 0.5 - Math.random())
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<Artwork[]>([])
  const [start, setStart] = useState(0)
  const [advancing, setAdvancing] = useState(false)

  const {
    data: artworks,
    loading: artworksLoading,
    error: artworksError,
    retry: retryArtworks,
  } = useArtworks()
  const { data: artist, loading: artistLoading } = useArtist()
  const loading = artworksLoading || artistLoading

  // 하이드레이션 뒤에만 본문을 그린다. 작품은 /api/artworks(useArtworks)에서만 받는다
  useEffect(() => {
    setMounted(true)
  }, [])

  // 방문마다 순서를 한 번 섞는다. 첫 작품은 대표작 자리, 나머지를 여덟 점씩 보여 준다
  useEffect(() => {
    if (artworks && artworks.length > 0) {
      setOrder(shuffle(artworks))
      setStart(0)
    }
  }, [artworks])

  const featured = order[0]
  // 대표작은 위 첫 화면에 있으니 아래 칸에서는 뺀다(작품이 한 점뿐이면 그대로 둔다)
  const pool = useMemo(
    () => (order.length > 1 ? order.slice(1) : order),
    [order]
  )
  const shown = pool.slice(start, start + PAGE_SIZE)

  // 2026-11-01: 8칸이 4초마다 한꺼번에 바뀌며 빈 칸이 번쩍였다. 저절로 넘기지 않고, 누르면 다음 여덟 점의
  // 그림을 받아 둔 뒤 바꾼다
  const showNext = useCallback(async () => {
    if (pool.length <= PAGE_SIZE || advancing) return
    const nextStart = start + PAGE_SIZE >= pool.length ? 0 : start + PAGE_SIZE
    setAdvancing(true)
    await preloadImages(
      pool
        .slice(nextStart, nextStart + PAGE_SIZE)
        .map((work) => previewImageFor(work)?.src ?? work.imageUrl)
        .filter((src): src is string => Boolean(src))
    )
    setStart(nextStart)
    setAdvancing(false)
  }, [pool, start, advancing])

  const showLoadingScreen = !mounted || (loading && order.length === 0)

  // /exhibition → /#exhibition: 전시 이력은 로딩 화면이 걷힌 뒤에야 그려지므로 그때 한 번 더 맞춘다
  const exhibitionRendered =
    !showLoadingScreen && exhibitionHistory(artist?.exhibitions).length > 0
  useEffect(() => {
    if (!exhibitionRendered || window.location.hash !== '#exhibition') return
    document.getElementById('exhibition')?.scrollIntoView()
  }, [exhibitionRendered])

  if (showLoadingScreen) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center bg-paper'>
        <p className='font-body text-ink-light' role='status'>
          작품을 불러오는 중입니다.
        </p>
      </div>
    )
  }

  const featuredPreview = featured ? previewImageFor(featured) : null
  const total = artworks?.length ?? 0
  return (
    <div className='bg-paper text-ink'>
      <Suspense fallback={<div className='min-h-[60vh]' />}>
        <HeroSection
          title='아남 배옥영'
          subtitle='전통과 현대가 만나는 서예의 새로운 지평'
          description='깊이 있는 전통 서예 기법과 현대적 감각이 조화를 이루는 독창적인 작품 세계를 만나보세요.'
          featuredArtwork={
            featured
              ? {
                  id: featured.id,
                  title: featured.title,
                  imageUrl: featuredPreview?.src ?? featured.imageUrl ?? '',
                  width: featuredPreview?.width,
                  height: featuredPreview?.height,
                  href: `/gallery/${featured.slug || featured.id}`,
                  year: featured.year?.toString() || '',
                  medium: featured.medium || '',
                }
              : undefined
          }
        />
      </Suspense>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8'>
        <section
          id='gallery'
          aria-labelledby='home-gallery-title'
          className='border-t-2 border-ink pt-12 pb-20'
        >
          <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
            <div>
              <h2
                id='home-gallery-title'
                className='font-display text-2xl font-bold md:text-3xl'
              >
                작품
              </h2>
              <p className='mt-2 font-body text-ink-light'>
                {total > 0 ? `전체 ${total}점 가운데 여덟 점` : ''}
              </p>
            </div>
            <Link
              href='/gallery'
              className={`inline-flex min-h-[44px] items-center border-b-2 border-ink font-body text-ink hover:border-gold ${FOCUS}`}
            >
              전체 {total}점 보기
            </Link>
          </div>

          {shown.length > 0 ? (
            <>
              <ul
                className='mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 lg:grid-cols-4'
                aria-busy={advancing}
              >
                {shown.map((artwork, index) => (
                  <li key={artwork.id}>
                    <ArtworkTile artwork={artwork} eager={index < 4} />
                  </li>
                ))}
              </ul>
              {pool.length > PAGE_SIZE && (
                <div className='mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3'>
                  <button
                    type='button'
                    onClick={showNext}
                    disabled={advancing}
                    className={`inline-flex min-h-[48px] items-center border-2 border-ink px-8 font-body text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60 ${FOCUS}`}
                  >
                    {advancing ? '불러오는 중…' : '다른 작품 보기'}
                  </button>
                </div>
              )}
            </>
          ) : artworksError ? (
            <div className='py-12 text-center' role='alert'>
              <p className='font-body text-ink-light'>
                작품을 불러오지 못했습니다.
              </p>
              <button
                type='button'
                onClick={() => retryArtworks()}
                className={`mt-4 border-2 border-ink px-5 py-2 text-ink transition-colors duration-300 hover:bg-ink hover:text-paper ${FOCUS}`}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <p className='py-12 text-center font-body text-ink-light'>
              표시할 작품이 없습니다.
            </p>
          )}
        </section>

        {artist && (
          <section
            id='artist'
            aria-labelledby='home-artist-title'
            className='grid gap-6 border-t-2 border-ink pt-12 pb-20 lg:grid-cols-12'
          >
            <h2
              id='home-artist-title'
              className='font-display text-2xl font-bold md:text-3xl lg:col-span-4'
            >
              작가 소개
            </h2>
            <div className='lg:col-span-8'>
              <p className='font-display text-xl'>{artist.name}</p>
              {artist.bio && (
                <p className='mt-4 max-w-[65ch] font-body leading-relaxed text-ink'>
                  {artist.bio}
                </p>
              )}
              <div className='mt-8 flex flex-wrap gap-x-8 gap-y-3'>
                <Link
                  href='/artist'
                  className={`inline-flex min-h-[44px] items-center border-b-2 border-ink font-body hover:border-gold ${FOCUS}`}
                >
                  작가 이야기 더 보기
                </Link>
                <Link
                  href='/contact'
                  className={`inline-flex min-h-[44px] items-center border-b-2 border-ink font-body hover:border-gold ${FOCUS}`}
                >
                  작품 문의하기
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 전시 이력: Supabase 작가 데이터의 실제 기록(원본은 Airtable "전시이력") */}
      <ExhibitionHistory exhibitions={artist?.exhibitions} />
    </div>
  )
}
