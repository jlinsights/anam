'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ArtworkCardSkeleton, ArtworkGrid } from '@/components/artwork-card'
import { ZenBrutalistArtworkCard } from '@/components/zen-brutalist-artwork-card'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { PageHeader } from '@/components/section-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/lib/types'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Tag,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const ARTWORKS_PER_PAGE = 12

// 카테고리 필터 옵션
const categoryOptions = [
  { value: 'all', label: '전체', count: 0 },
  { value: 'treasure', label: '문방사우', count: 0 },
  { value: 'calligraphy', label: '서예', count: 0 },
  { value: 'painting', label: '회화', count: 0 },
  { value: 'mixed', label: '혼합매체', count: 0 },
]

// 정렬 옵션
const sortOptions = [
  { value: 'default', label: '기본 순서' },
  { value: 'title', label: '제목순' },
  { value: 'year', label: '연도순' },
  { value: 'category', label: '카테고리순' },
  { value: 'tags', label: '태그순' },
]

// Zen Brutalist 로딩 컴포넌트
function GalleryLoading() {
  return (
    <div className='min-h-screen bg-paper relative overflow-hidden flex flex-col'>
      {/* Zen Loading Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 zen-breathe-slow opacity-2' />
        <div className='absolute inset-0 ink-flow-ambient opacity-1' />
      </div>

      <ArtNavigation />
      <NavigationSpacer />

      <main className='section-padding relative z-10 flex-1'>
        <div className='zen-brutalist-layout'>
          {/* 헤더 스켈레톤 */}
          <div className='space-y-zen-lg mb-zen-3xl void-contemplative'>
            <div className='h-4 w-24 bg-stone/20 animate-pulse rounded zen-breathe-slow' />
            <div className='h-12 w-64 bg-stone/20 animate-pulse rounded zen-breathe-slow' />
            <div className='h-6 w-96 bg-stone/20 animate-pulse rounded zen-breathe-slow' />
          </div>

          {/* 필터 스켈레톤 */}
          <div className='flex flex-wrap gap-zen-md mb-zen-2xl void-breathing'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-10 w-20 bg-stone/20 animate-pulse rounded-lg zen-breathe-deep'
              />
            ))}
          </div>

          {/* Zen Brutalist 그리드 스켈레톤 */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-zen-lg'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='zen-brutalist-card void-breathing'>
                <div className='aspect-[3/4] bg-stone/10 animate-pulse rounded-xl zen-breathe-slow' />
                <div className='p-zen-md space-y-zen-sm'>
                  <div className='h-6 bg-stone/10 animate-pulse rounded zen-breathe-slow' />
                  <div className='h-4 bg-stone/10 animate-pulse rounded w-3/4 zen-breathe-slow' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function GalleryClient({
  initialArtworks = [],
}: {
  initialArtworks?: Artwork[]
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function loadArtworks() {
      try {
        const { fallbackArtworksData } = await import('@/lib/artworks')
        if (initialArtworks.length > 0) {
          setArtworks(initialArtworks)
          setFilteredArtworks(initialArtworks)
          // Extract featured artworks for hero background
          const featured = initialArtworks.filter(artwork => artwork.featured).slice(0, 6)
          setFeaturedArtworks(featured)
        } else {
          setArtworks(fallbackArtworksData)
          setFilteredArtworks(fallbackArtworksData)
          // Extract featured artworks for hero background
          const featured = fallbackArtworksData.filter(artwork => artwork.featured).slice(0, 6)
          setFeaturedArtworks(featured)
        }

        // 사용 가능한 태그 추출 (초기 데이터 기준)
        const sourceForTags =
          initialArtworks.length > 0 ? initialArtworks : fallbackArtworksData
        const tags = new Set<string>()
        sourceForTags.forEach((artwork) => {
          if (artwork.tags) {
            artwork.tags.forEach((tag) => tags.add(tag))
          }
        })
        setAvailableTags(Array.from(tags).sort())

        setLoading(false)

        try {
          const response = await fetch('/api/artworks')
          const result = await response.json()

          if (result.success && result.data && result.data.length > 0) {
            setArtworks(result.data)
            setFilteredArtworks(result.data)

            // Update featured artworks for hero background
            const featured = result.data.filter((artwork: Artwork) => artwork.featured).slice(0, 6)
            setFeaturedArtworks(featured)

            // Airtable 데이터에서 태그 추출
            const airtableTags = new Set<string>()
            result.data.forEach((artwork: Artwork) => {
              if (artwork.tags) {
                artwork.tags.forEach((tag) => airtableTags.add(tag))
              }
            })
            setAvailableTags(Array.from(airtableTags).sort())

            console.log(
              'Gallery updated with Airtable data:',
              result.data.length,
              'artworks'
            )
            console.log('Available tags:', Array.from(airtableTags))
          }
        } catch (airtableError) {
          console.log('Using fallback data')
        }
      } catch (error) {
        console.error('Failed to load gallery data:', error)
        setError('작품을 불러오는데 실패했습니다.')
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...artworks]

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (artwork) => artwork.category === selectedCategory
      )
    }

    // 태그 필터
    if (selectedTags.length > 0) {
      filtered = filtered.filter((artwork) => {
        if (!artwork.tags || artwork.tags.length === 0) return false
        return selectedTags.every((tag) => artwork.tags!.includes(tag))
      })
    }

    // 정렬
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'year':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case 'category':
        filtered.sort((a, b) =>
          (a.category || '').localeCompare(b.category || '')
        )
        break
      case 'tags':
        filtered.sort((a, b) => {
          const aFirstTag = a.tags?.[0] || ''
          const bFirstTag = b.tags?.[0] || ''
          return aFirstTag.localeCompare(bFirstTag)
        })
        break
      case 'default':
      default:
        // 문방사우 시리즈를 먼저 배치
        const treasureArtworks = filtered
          .filter((artwork) => artwork.category === 'treasure')
          .sort((a, b) => {
            const numA = parseInt(a.slug.match(/treasure-(\d+)/)?.[1] || '0')
            const numB = parseInt(b.slug.match(/treasure-(\d+)/)?.[1] || '0')
            return numA - numB
          })

        const otherArtworks = filtered.filter(
          (artwork) => artwork.category !== 'treasure'
        )
        filtered = [...treasureArtworks, ...otherArtworks]
        break
    }

    setFilteredArtworks(filtered)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
  }, [artworks, selectedCategory, selectedTags, sortBy])

  // 카테고리별 작품 수 계산
  const getCategoryCount = (category: string) => {
    if (category === 'all') return artworks.length
    return artworks.filter((artwork) => artwork.category === category).length
  }

  // 태그별 작품 수 계산
  const getTagCount = (tag: string) => {
    return artworks.filter((artwork) => artwork.tags?.includes(tag)).length
  }

  // 태그 추가/제거
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // 모든 필터 초기화
  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSelectedTags([])
    setSortBy('default')
  }

  if (loading) {
    return <GalleryLoading />
  }

  if (error && artworks.length === 0) {
    return (
      <div className='min-h-screen bg-paper relative overflow-hidden flex flex-col'>
        {/* Error Background Effects */}
        <div className='fixed inset-0 pointer-events-none'>
          <div className='absolute inset-0 zen-breathe-slow opacity-1' />
        </div>

        <ArtNavigation />
        <NavigationSpacer />
        <div className='section-padding flex items-center justify-center relative z-10 flex-1'>
          <div className='zen-brutalist-card glass-layer-1 max-w-md'>
            <div className='p-zen-2xl text-center space-y-zen-lg void-contemplative'>
              <h1 className='zen-typography-hero text-ink stroke-press'>
                오류가 발생했습니다
              </h1>
              <p className='zen-typography-body text-ink-light void-breathing'>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className='btn-art px-zen-xl py-zen-md brutal-shadow'
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredArtworks.length / ARTWORKS_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTWORKS_PER_PAGE
  const endIndex = startIndex + ARTWORKS_PER_PAGE
  const currentArtworks = filteredArtworks.slice(startIndex, endIndex)

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisiblePages - 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <div className='min-h-screen bg-paper relative overflow-hidden flex flex-col'>
      {/* Zen Brutalism Foundation Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 zen-breathe-deep opacity-2' />
        <div className='absolute inset-0 ink-flow-ambient opacity-1' />
      </div>

      <ArtNavigation />
      
      {/* Zen Brutalist Hero for Gallery */}
      <ZenBrutalistHero
        phase="1"
        title={{
          main: "작품 갤러리",
          sub: "ARTWORK GALLERY",
          english: "Korean Calligraphy Collection"
        }}
        description={{
          primary: "아남 배옥영의 서예 작품",
          secondary: "전통 서예의 정신과 현대적 감각이 어우러진 작품들을 감상해보세요"
        }}
        concept="ZEN GALLERY EXPERIENCE"
        navigation={{
          prev: { href: '/', label: '홈' },
          demo: { href: '/zen-demo', label: 'Zen 체험' }
        }}
        variant="zen"
        enableInteraction={true}
        className="min-h-[60vh]"
        backgroundArtworks={featuredArtworks}
        showImageCarousel={featuredArtworks.length > 0}
      />

      <NavigationSpacer />

      <main className='section-padding relative z-10 flex-1'>
        <div className='zen-brutalist-layout'>

          {/* Zen Brutalist 필터 및 정렬 */}
          <div className='mt-zen-lg space-y-zen-md cultural-context'>
            {/* 통계 정보 */}
            <div className='flex items-center justify-between void-breathing'>
              <div className='flex items-center space-x-zen-lg'>
                <p className='zen-typography-body text-ink-light'>
                  총{' '}
                  <span className='zen-typography-body text-ink font-bold stroke-horizontal'>
                    {filteredArtworks.length}
                  </span>
                  개의 작품
                </p>
                {(selectedCategory !== 'all' || selectedTags.length > 0) && (
                  <div className='flex items-center space-x-zen-sm void-minimal'>
                    {selectedCategory !== 'all' && (
                      <Badge variant='secondary' className='text-xs brutal-typography-accent bg-gold/20 text-gold border-gold/30'>
                        {
                          categoryOptions.find(
                            (cat) => cat.value === selectedCategory
                          )?.label
                        }
                      </Badge>
                    )}
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='text-xs flex items-center gap-1 bg-ink/10 text-ink border-ink/20'
                      >
                        <Tag className='w-3 h-3' />
                        {tag}
                      </Badge>
                    ))}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={clearAllFilters}
                      className='text-xs text-ink-light hover:text-ink zen-hover-scale'
                    >
                      <X className='w-3 h-3 mr-1' />
                      초기화
                    </Button>
                  </div>
                )}
              </div>

              {/* Zen Brutalist 뷰 모드 토글 */}
              <div className='flex items-center space-x-zen-sm'>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className={`p-zen-sm ${viewMode === 'grid' ? 'btn-art brutal-shadow' : 'hover:bg-stone/10'}`}
                >
                  <Grid className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className={`p-zen-sm ${viewMode === 'list' ? 'btn-art brutal-shadow' : 'hover:bg-stone/10'}`}
                >
                  <List className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Zen Brutalist 카테고리 필터 */}
            <div className='space-y-zen-sm void-breathing'>
              <div className='flex items-center space-x-zen-sm'>
                <Filter className='h-4 w-4 text-gold' />
                <span className='brutal-typography-accent text-ink uppercase tracking-wider'>카테고리</span>
              </div>
              <div className='flex flex-wrap gap-zen-md'>
                {categoryOptions.map((category) => {
                  const count = getCategoryCount(category.value)
                  if (count === 0 && category.value !== 'all') return null

                  return (
                    <Button
                      key={category.value}
                      variant={
                        selectedCategory === category.value
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => setSelectedCategory(category.value)}
                      className={
                        selectedCategory === category.value
                          ? 'btn-art px-zen-lg py-zen-sm brutal-shadow zen-hover-scale'
                          : 'btn-art-outline px-zen-lg py-zen-sm hover:bg-stone/10 zen-hover-scale'
                      }
                    >
                      {category.label}
                      <Badge variant='secondary' className='ml-zen-sm text-xs bg-stone/20 text-ink-light'>
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Zen Brutalist 태그 필터 */}
            {availableTags.length > 0 && (
              <div className='space-y-zen-sm void-breathing'>
                <div className='flex items-center space-x-zen-sm'>
                  <Tag className='h-4 w-4 text-gold' />
                  <span className='brutal-typography-accent text-ink uppercase tracking-wider'>태그</span>
                  {selectedTags.length > 0 && (
                    <Badge variant='outline' className='text-xs bg-gold/10 text-gold border-gold/30'>
                      {selectedTags.length}개 선택
                    </Badge>
                  )}
                </div>
                <div className='flex flex-wrap gap-zen-sm'>
                  {availableTags.map((tag) => {
                    const count = getTagCount(tag)
                    const isSelected = selectedTags.includes(tag)

                    return (
                      <Button
                        key={tag}
                        variant={isSelected ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => toggleTag(tag)}
                        className={`text-xs ${
                          isSelected ? 'btn-art px-zen-md py-zen-xs brutal-shadow zen-hover-scale' : 'btn-art-outline px-zen-md py-zen-xs hover:bg-stone/10 zen-hover-scale'
                        }`}
                      >
                        <Tag className='w-3 h-3 mr-1' />
                        {tag}
                        <Badge variant='secondary' className='ml-zen-xs text-xs bg-stone/20 text-ink-lighter'>
                          {count}
                        </Badge>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Zen Brutalist 정렬 옵션 */}
            <div className='flex items-center space-x-zen-lg void-breathing'>
              <div className='flex items-center space-x-zen-sm'>
                <Filter className='h-4 w-4 text-gold' />
                <span className='brutal-typography-accent text-ink-light uppercase tracking-wider'>정렬</span>
              </div>
              <div className='flex flex-wrap gap-zen-sm'>
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setSortBy(option.value)}
                    className={`text-xs ${
                      sortBy === option.value ? 'btn-art brutal-shadow zen-hover-scale' : 'hover:bg-stone/10 zen-hover-scale'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Works 스타일 작품 그리드 */}
          <div className='mt-zen-lg temporal-depth'>
            {currentArtworks.length > 0 ? (
              <ArtworkGrid
                artworks={currentArtworks}
                variant='featured'
                columns={viewMode === 'grid' ? 4 : 3}
                showMetadata={true}
                showActions={true}
              />
            ) : (
              <div className='zen-brutalist-card glass-layer-1 max-w-2xl mx-auto'>
                <div className='p-zen-3xl text-center void-contemplative'>
                  <div className='space-y-zen-lg'>
                    <div className='w-16 h-16 bg-stone/10 rounded-full flex items-center justify-center mx-auto'>
                      <Filter className='w-8 h-8 text-ink-lighter' />
                    </div>
                    <h3 className='zen-typography-hero text-ink stroke-press'>
                      작품이 없습니다
                    </h3>
                    <p className='zen-typography-body text-ink-light void-breathing'>
                      선택한 필터에 해당하는 작품이 없습니다.
                    </p>
                    <Button
                      onClick={clearAllFilters}
                      variant='outline'
                      className='btn-art-outline px-zen-xl py-zen-md brutal-shadow zen-hover-scale'
                    >
                      필터 초기화
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zen Brutalist 페이지네이션 */}
          {totalPages > 1 && (
            <div className='mt-zen-lg flex justify-center void-contemplative'>
              <div className='flex items-center space-x-zen-sm glass-layer-1 rounded-2xl p-zen-lg'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className='btn-art-outline px-zen-lg py-zen-sm zen-hover-scale disabled:opacity-50'
                >
                  <ChevronLeft className='h-4 w-4' />
                  이전
                </Button>

                <div className='flex space-x-zen-xs'>
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? 'btn-art px-zen-md py-zen-sm brutal-shadow zen-hover-scale'
                          : 'hover:bg-stone/10 px-zen-md py-zen-sm zen-hover-scale'
                      }
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='btn-art-outline px-zen-lg py-zen-sm zen-hover-scale disabled:opacity-50'
                >
                  다음
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter 
        variant="zen" 
        showPhaseNavigation={true} 
        enableInteraction={true}
      />
    </div>
  )
}
