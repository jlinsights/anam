'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ArtworkCardSkeleton, ArtworkGrid } from '@/components/artwork-card'
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

// 로딩 컴포넌트
function GalleryLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <ArtNavigation />
      <NavigationSpacer />

      <main className='section-padding'>
        <div className='container-art'>
          {/* 헤더 스켈레톤 */}
          <div className='space-y-6 mb-12'>
            <div className='h-4 w-24 bg-stone-light animate-pulse rounded' />
            <div className='h-12 w-64 bg-stone-light animate-pulse rounded' />
            <div className='h-6 w-96 bg-stone-light animate-pulse rounded' />
          </div>

          {/* 필터 스켈레톤 */}
          <div className='flex flex-wrap gap-4 mb-8'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-10 w-20 bg-stone-light animate-pulse rounded-lg'
              />
            ))}
          </div>

          {/* 그리드 스켈레톤 */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8'>
            {Array.from({ length: 12 }).map((_, i) => (
              <ArtworkCardSkeleton key={i} />
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
        } else {
          setArtworks(fallbackArtworksData)
          setFilteredArtworks(fallbackArtworksData)
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
      <div className='min-h-screen bg-background'>
        <ArtNavigation />
        <NavigationSpacer />
        <div className='section-padding flex items-center justify-center'>
          <Card className='card-art max-w-md'>
            <CardContent className='p-8 text-center space-y-4'>
              <h1 className='text-2xl font-bold text-ink'>
                오류가 발생했습니다
              </h1>
              <p className='text-ink-light'>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className='btn-art'
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
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
    <div className='min-h-screen bg-background'>
      <ArtNavigation />
      <NavigationSpacer />

      <main className='section-padding'>
        <div className='container-art'>
          {/* 페이지 헤더 */}
          <PageHeader
            breadcrumb={[{ label: '홈', href: '/' }, { label: '갤러리' }]}
            title='작품 갤러리'
            subtitle='아남 배옥영의 서예 작품'
            description='전통 서예의 정신과 현대적 감각이 어우러진 작품들을 감상해보세요.'
            badge='Gallery'
            variant='default'
            size='lg'
          />

          {/* 필터 및 정렬 */}
          <div className='mt-12 space-y-6'>
            {/* 통계 정보 */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <p className='text-sm text-ink-light'>
                  총{' '}
                  <span className='font-medium text-ink'>
                    {filteredArtworks.length}
                  </span>
                  개의 작품
                </p>
                {(selectedCategory !== 'all' || selectedTags.length > 0) && (
                  <div className='flex items-center space-x-2'>
                    {selectedCategory !== 'all' && (
                      <Badge variant='secondary' className='text-xs'>
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
                        className='text-xs flex items-center gap-1'
                      >
                        <Tag className='w-3 h-3' />
                        {tag}
                      </Badge>
                    ))}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={clearAllFilters}
                      className='text-xs text-ink-light hover:text-ink'
                    >
                      <X className='w-3 h-3 mr-1' />
                      초기화
                    </Button>
                  </div>
                )}
              </div>

              {/* 뷰 모드 토글 */}
              <div className='flex items-center space-x-2'>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='p-2'
                >
                  <Grid className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='p-2'
                >
                  <List className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Filter className='h-4 w-4 text-ink-light' />
                <span className='text-sm font-medium text-ink'>카테고리</span>
              </div>
              <div className='flex flex-wrap gap-3'>
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
                          ? 'btn-art'
                          : 'btn-art-outline'
                      }
                    >
                      {category.label}
                      <Badge variant='secondary' className='ml-2 text-xs'>
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* 태그 필터 */}
            {availableTags.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Tag className='h-4 w-4 text-ink-light' />
                  <span className='text-sm font-medium text-ink'>태그</span>
                  {selectedTags.length > 0 && (
                    <Badge variant='outline' className='text-xs'>
                      {selectedTags.length}개 선택
                    </Badge>
                  )}
                </div>
                <div className='flex flex-wrap gap-2'>
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
                          isSelected ? 'btn-art' : 'btn-art-outline'
                        }`}
                      >
                        <Tag className='w-3 h-3 mr-1' />
                        {tag}
                        <Badge variant='secondary' className='ml-2 text-xs'>
                          {count}
                        </Badge>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 정렬 옵션 */}
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <Filter className='h-4 w-4 text-ink-light' />
                <span className='text-sm text-ink-light'>정렬:</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setSortBy(option.value)}
                    className='text-xs'
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 작품 그리드 */}
          <div className='mt-12'>
            {currentArtworks.length > 0 ? (
              <ArtworkGrid
                artworks={currentArtworks}
                variant='default'
                columns={viewMode === 'grid' ? 4 : 3}
                showMetadata={true}
                showActions={true}
              />
            ) : (
              <Card className='card-art'>
                <CardContent className='p-12 text-center'>
                  <div className='space-y-4'>
                    <div className='w-16 h-16 bg-stone-light rounded-full flex items-center justify-center mx-auto'>
                      <Filter className='w-8 h-8 text-ink-lighter' />
                    </div>
                    <h3 className='text-lg font-medium text-ink'>
                      작품이 없습니다
                    </h3>
                    <p className='text-ink-light'>
                      선택한 필터에 해당하는 작품이 없습니다.
                    </p>
                    <Button
                      onClick={clearAllFilters}
                      variant='outline'
                      className='btn-art-outline'
                    >
                      필터 초기화
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className='mt-16 flex justify-center'>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className='btn-art-outline'
                >
                  <ChevronLeft className='h-4 w-4' />
                  이전
                </Button>

                <div className='flex space-x-1'>
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? 'btn-art'
                          : 'hover:bg-paper-warm'
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
                  className='btn-art-outline'
                >
                  다음
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
