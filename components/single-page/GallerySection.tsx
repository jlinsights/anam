'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Artwork } from '@/lib/types'
import {
  useGalleryStore,
  useArtworks,
  useGalleryFilters,
  filterArtworks,
} from '@/lib/stores/gallery-store-safe'
import { ArtworkTile } from '@/components/gallery/ArtworkTile'
import { useThrottledSearch } from '@/lib/hooks/use-throttled-handlers'

interface GallerySectionProps {
  artworks: Artwork[]
  onArtworkSelect: (artwork: Artwork) => void
}

// 모바일 2열 기준 한 번에 12줄. 61점을 한 번에 내리면 10,000px 가 넘었다
const PAGE_SIZE = 24

const CHIP =
  'inline-flex min-h-[40px] shrink-0 items-center border px-3 font-body text-sm tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

// 61점을 한 화면에 빽빽하지만 잘리지 않게. 예전에는 9:16 세로 틀에 정사각형으로 잘린 그림을 넣고
// 칸마다 스크롤 등장 효과를 줘 데스크톱 8,300px·모바일 14,800px 를 내려야 했다
export function GallerySection({ artworks }: GallerySectionProps) {
  const storeFilteredArtworks = useArtworks()
  const isStoreSynced = useGalleryStore((state) => state.artworks === artworks)
  const { searchTerm, selectedYear, selectedMedium } = useGalleryFilters()
  // 동기화 effect가 돌기 전 첫 렌더는 스토어가 비어 있으므로 props를 같은 필터로 거른다
  const filteredArtworks = useMemo(
    () =>
      isStoreSynced
        ? storeFilteredArtworks
        : filterArtworks(artworks, {
            searchTerm,
            selectedYear,
            selectedMedium,
          }),
    [
      isStoreSynced,
      storeFilteredArtworks,
      artworks,
      searchTerm,
      selectedYear,
      selectedMedium,
    ]
  )
  const {
    setArtworks,
    setSearchTerm,
    setSelectedYear,
    setSelectedMedium,
    clearFilters,
  } = useGalleryStore()

  // 그리드는 스토어의 filteredArtworks를 그리므로 props로 받은 작품을 스토어에 넣어야 한다
  useEffect(() => {
    setArtworks(artworks)
  }, [artworks, setArtworks])

  // 입력 칸은 바로 반응하고, 거르기만 늦춘다(예전엔 칸 값도 늦게 따라와 글자가 씹혔다)
  const [query, setQuery] = useState(searchTerm)
  const throttledSearchUpdate = useThrottledSearch(
    (term: string) => setSearchTerm(term),
    300,
    []
  )

  const availableYears = useMemo(() => {
    const years = [...new Set(artworks.map((artwork) => artwork.year))]
    return years.filter(Boolean).sort((a, b) => b - a)
  }, [artworks])

  // 61점이 모두 2024년이면 연도 단추는 쓸모가 없다. 재료(화선지·광목·옻칠종이…)가 실제로 갈라 준다
  const availableMediums = useMemo(() => {
    const counts = new Map<string, number>()
    artworks.forEach((artwork) => {
      if (artwork.medium)
        counts.set(artwork.medium, (counts.get(artwork.medium) ?? 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [artworks])

  const filtered = Boolean(searchTerm || selectedYear || selectedMedium)

  // 거르는 조건이 바뀌면 처음 24점부터 다시
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [searchTerm, selectedYear, selectedMedium])
  // "더 보기" 뒤에는 새로 나온 첫 작품으로 초점을 옮긴다(키보드 사용자가 처음으로 돌아가지 않게)
  useEffect(() => {
    if (focusIndex === null) return
    listRef.current
      ?.querySelectorAll<HTMLAnchorElement>('li a')
      [focusIndex]?.focus()
    setFocusIndex(null)
  }, [focusIndex])
  const visible = filteredArtworks.slice(0, limit)
  const remaining = filteredArtworks.length - visible.length
  const showMore = () => {
    setFocusIndex(visible.length)
    setLimit((current) => current + PAGE_SIZE)
  }
  const resetAll = () => {
    setQuery('')
    clearFilters()
  }

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8'>
      <header className='flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-10 pb-6 md:pt-14'>
        <div>
          <h1 className='font-display text-3xl font-bold text-ink md:text-4xl'>
            작품
          </h1>
          <div className='mt-3 h-1 w-24 bg-gold' aria-hidden='true' />
        </div>
        <p className='font-body text-sm text-ink-light'>
          아남 배옥영 작품 {artworks.length}점
        </p>
      </header>

      <section
        aria-labelledby='gallery-filters-title'
        className='z-30 -mx-4 border-y border-ink/15 bg-paper px-4 py-3 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:sticky lg:top-16'
      >
        <h2 id='gallery-filters-title' className='sr-only'>
          작품 검색 및 연도별 보기
        </h2>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div>
            <label htmlFor='gallery-search' className='sr-only'>
              작품 제목 검색
            </label>
            <input
              id='gallery-search'
              type='search'
              placeholder='작품 제목 검색'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                throttledSearchUpdate(e.target.value)
              }}
              className='min-h-[40px] w-full border-2 border-ink bg-paper px-3 font-body text-[15px] text-ink placeholder:text-ink-light focus:border-gold focus:bg-paper-warm focus:outline-none focus:ring-4 focus:ring-gold/20 lg:w-60'
            />
          </div>

          {availableMediums.length > 1 && (
            <div
              role='group'
              aria-label='재료'
              className='-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:flex-1'
            >
              <button
                type='button'
                aria-pressed={!selectedMedium}
                onClick={() => setSelectedMedium(null)}
                className={`${CHIP} ${
                  !selectedMedium
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/25 text-ink hover:border-ink'
                }`}
              >
                전체
              </button>
              {availableMediums.map(([medium, count]) => {
                const active = selectedMedium === medium
                return (
                  <button
                    key={medium}
                    type='button'
                    aria-pressed={active}
                    onClick={() => setSelectedMedium(active ? null : medium)}
                    className={`${CHIP} gap-1.5 ${
                      active
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/25 text-ink hover:border-ink'
                    }`}
                  >
                    {medium}
                    <span className='text-xs opacity-70'>{count}</span>
                  </button>
                )
              })}
            </div>
          )}

          {availableYears.length > 1 && (
            <div
              role='group'
              aria-label='제작 연도'
              className='-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:flex-1'
            >
              <button
                type='button'
                aria-pressed={!selectedYear}
                onClick={() => setSelectedYear(null)}
                className={`${CHIP} ${
                  !selectedYear
                    ? 'border-ink bg-ink text-paper'
                    : 'border-ink/25 text-ink hover:border-ink'
                }`}
              >
                전체
              </button>
              {availableYears.map((year) => {
                const active = selectedYear === year
                return (
                  <button
                    key={year}
                    type='button'
                    aria-pressed={active}
                    onClick={() => setSelectedYear(active ? null : year)}
                    className={`${CHIP} ${
                      active
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/25 text-ink hover:border-ink'
                    }`}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          )}

          <p
            className='shrink-0 font-body text-sm text-ink-light tabular-nums'
            role='status'
            aria-live='polite'
          >
            {filteredArtworks.length}점 {filtered ? '찾음' : '전체'}
          </p>
        </div>
      </section>

      {filteredArtworks.length > 0 ? (
        <section aria-labelledby='gallery-results-title' className='pt-8 pb-20'>
          <h2 id='gallery-results-title' className='sr-only'>
            작품 목록
          </h2>
          <ul
            ref={listRef}
            aria-label={`작품 목록 - ${filteredArtworks.length}점`}
            className='grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5'
          >
            {visible.map((artwork, index) => (
              <li key={artwork.id}>
                <ArtworkTile artwork={artwork} eager={index < 10} />
              </li>
            ))}
          </ul>
          {remaining > 0 && (
            <div className='mt-12 flex justify-center'>
              <button
                type='button'
                onClick={showMore}
                className='inline-flex min-h-[48px] items-center border-2 border-ink px-8 font-body text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
              >
                더 보기 · {remaining}점 남음
              </button>
            </div>
          )}
        </section>
      ) : (
        <section
          aria-labelledby='no-results-title'
          className='py-24 text-center'
        >
          <h2 id='no-results-title' className='font-display text-lg text-ink'>
            찾는 작품이 없습니다
          </h2>
          <p className='mt-2 font-body text-sm text-ink-light'>
            다른 제목으로 찾거나 연도를 바꿔 보세요.
          </p>
          <button
            type='button'
            onClick={resetAll}
            className='mt-6 min-h-[44px] border-2 border-ink bg-ink px-6 font-body text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
          >
            전체 작품 보기
          </button>
        </section>
      )}
    </div>
  )
}
