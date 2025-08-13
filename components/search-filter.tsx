'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, Calendar, Palette, Ruler } from 'lucide-react'
import { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccessibleModal } from '@/components/accessibility'
import { useThrottledSearch } from '@/lib/hooks/use-throttled-handlers'

interface SearchFilterProps {
  artworks: Artwork[]
  onFilteredResults: (filteredArtworks: Artwork[]) => void
  className?: string
}

interface FilterState {
  searchTerm: string
  yearRange: [number, number]
  selectedMediums: string[]
  sortBy: 'title' | 'year' | 'medium'
  sortOrder: 'asc' | 'desc'
}

export function SearchFilter({
  artworks,
  onFilteredResults,
  className,
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    yearRange: [2021, 2025],
    selectedMediums: [],
    sortBy: 'year',
    sortOrder: 'desc',
  })

  // Throttled search handler for better performance
  const throttledSearchUpdate = useThrottledSearch(
    (searchTerm: string) => {
      setFilters(prev => ({ ...prev, searchTerm }))
    },
    300, // 300ms delay for search input
    []
  )

  // 가능한 연도와 재료 추출
  const availableYears = useMemo(() => {
    const years = artworks.map((artwork) => artwork.year)
    return [Math.min(...years), Math.max(...years)]
  }, [artworks])

  const availableMediums = useMemo(() => {
    const mediums = [...new Set(artworks.map((artwork) => artwork.medium))]
    return mediums.sort()
  }, [artworks])

  // 필터링 및 정렬 로직
  const filteredArtworks = useMemo(() => {
    const result = artworks.filter((artwork) => {
      // 검색어 필터
      const matchesSearch =
        filters.searchTerm === '' ||
        artwork.title
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        artwork.description
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())

      // 연도 범위 필터
      const matchesYear =
        artwork.year >= filters.yearRange[0] &&
        artwork.year <= filters.yearRange[1]

      // 재료 필터
      const matchesMedium =
        filters.selectedMediums.length === 0 ||
        filters.selectedMediums.includes(artwork.medium)

      return matchesSearch && matchesYear && matchesMedium
    })

    // 정렬
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ko')
          break
        case 'year':
          comparison = a.year - b.year
          break
        case 'medium':
          comparison = a.medium.localeCompare(b.medium, 'ko')
          break
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [artworks, filters])

  // 필터 결과를 부모 컴포넌트로 전달
  useEffect(() => {
    onFilteredResults(filteredArtworks)
  }, [filteredArtworks, onFilteredResults])

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      yearRange: availableYears as [number, number],
      selectedMediums: [],
      sortBy: 'year',
      sortOrder: 'desc',
    })
  }

  // 재료 선택 토글
  const toggleMedium = (medium: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedMediums: prev.selectedMediums.includes(medium)
        ? prev.selectedMediums.filter((m) => m !== medium)
        : [...prev.selectedMediums, medium],
    }))
  }

  // 활성 필터 개수
  const activeFiltersCount =
    (filters.searchTerm ? 1 : 0) +
    (filters.selectedMediums.length > 0 ? 1 : 0) +
    (filters.yearRange[0] !== availableYears[0] ||
    filters.yearRange[1] !== availableYears[1]
      ? 1
      : 0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* 검색 바 */}
      <div className='relative space-y-4'>
        {/* 검색 입력 필드 */}
        <div className='relative flex-1'>
          <label htmlFor='artwork-search' className='sr-only'>
            작품 검색
          </label>
          <Search 
            className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-neutral-400' 
            aria-hidden='true'
          />
          <Input
            id='artwork-search'
            type='text'
            placeholder='작품 제목이나 설명으로 검색...'
            value={filters.searchTerm}
            onChange={(e) => throttledSearchUpdate(e.target.value)}
            className='pl-10 dark:text-neutral-100 dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder:text-neutral-500'
            aria-describedby='search-help'
          />
          <div id='search-help' className='sr-only'>
            작품 제목이나 설명에서 키워드를 검색할 수 있습니다
          </div>
        </div>

        <div className='flex items-center justify-between gap-4'>
          {/* 필터 버튼 */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='flex items-center gap-2 dark:text-neutral-200 dark:bg-neutral-800 dark:border-neutral-600 dark:hover:bg-neutral-700'
            aria-expanded={isFilterOpen}
            aria-controls='filter-modal'
            aria-label={`필터 설정 ${isFilterOpen ? '닫기' : '열기'}${filters.selectedMediums.length > 0 ? `, ${filters.selectedMediums.length}개 필터 적용됨` : ''}`}
          >
            <Filter className='h-4 w-4' aria-hidden='true' />
            필터
            {filters.selectedMediums.length > 0 && (
              <span 
                className='ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground dark:bg-neutral-700 dark:text-neutral-200'
                aria-label={`${filters.selectedMediums.length}개 필터 적용됨`}
              >
                {filters.selectedMediums.length}
              </span>
            )}
          </Button>

          {/* 필터 초기화 및 결과 요약 */}
          <div className='flex items-center gap-2'>
            {activeFiltersCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={resetFilters}
                className='text-ink-light hover:text-ink'
                aria-label='모든 필터 초기화'
              >
                <X className='h-4 w-4 mr-1' aria-hidden='true' />
                초기화
              </Button>
            )}
          </div>

          {/* 검색 결과 요약 */}
          <div 
            className='text-sm text-ink-light'
            role='status'
            aria-live='polite'
            aria-label={`검색 결과: ${filteredArtworks.length}개 작품`}
          >
            {filteredArtworks.length}개 작품
          </div>
        </div>

        {/* 활성 필터 태그 */}
        {activeFiltersCount > 0 && (
          <div 
            className='flex flex-wrap gap-2'
            role='list'
            aria-label='적용된 필터 목록'
          >
            {filters.searchTerm && (
              <span 
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-ink/10 text-ink'
                role='listitem'
              >
                검색: {filters.searchTerm}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, searchTerm: '' }))
                  }
                  className='ml-1 hover:text-ink/70 focus:outline-none focus:ring-1 focus:ring-gold rounded'
                  aria-label={`검색어 "${filters.searchTerm}" 제거`}
                >
                  <X className='h-3 w-3' aria-hidden='true' />
                </button>
              </span>
            )}

            {filters.selectedMediums.map((medium) => (
              <span
                key={medium}
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-ink/10 text-ink'
                role='listitem'
              >
                {medium}
                <button
                  onClick={() => toggleMedium(medium)}
                  className='ml-1 hover:text-ink/70 focus:outline-none focus:ring-1 focus:ring-gold rounded'
                  aria-label={`${medium} 재료 필터 제거`}
                >
                  <X className='h-3 w-3' aria-hidden='true' />
                </button>
              </span>
            ))}

            {(filters.yearRange[0] !== availableYears[0] ||
              filters.yearRange[1] !== availableYears[1]) && (
              <span 
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-ink/10 text-ink'
                role='listitem'
              >
                {filters.yearRange[0]}-{filters.yearRange[1]}년
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      yearRange: availableYears as [number, number],
                    }))
                  }
                  className='ml-1 hover:text-ink/70 focus:outline-none focus:ring-1 focus:ring-gold rounded'
                  aria-label={`${filters.yearRange[0]}-${filters.yearRange[1]}년 연도 필터 제거`}
                >
                  <X className='h-3 w-3' aria-hidden='true' />
                </button>
              </span>
            )}
          </div>
        )}

        {/* 필터 모달 */}
        <AccessibleModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title='작품 필터'
          description='원하는 조건으로 작품을 필터링하세요'
          className='max-w-lg'
        >
          <div className='space-y-6' id='filter-modal'>
            {/* 정렬 옵션 */}
            <fieldset className='space-y-3'>
              <legend className='font-medium flex items-center gap-2'>
                <Palette className='h-4 w-4' aria-hidden='true' />
                정렬
              </legend>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <label htmlFor='sort-by' className='sr-only'>정렬 기준 선택</label>
                  <select
                    id='sort-by'
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as FilterState['sortBy'],
                      }))
                    }
                    className='w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold'
                    aria-describedby='sort-by-help'
                  >
                    <option value='year'>제작년도</option>
                    <option value='title'>작품명</option>
                    <option value='medium'>재료</option>
                  </select>
                  <div id='sort-by-help' className='sr-only'>정렬할 기준을 선택하세요</div>
                </div>
                <div>
                  <label htmlFor='sort-order' className='sr-only'>정렬 순서 선택</label>
                  <select
                    id='sort-order'
                    value={filters.sortOrder}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortOrder: e.target.value as FilterState['sortOrder'],
                      }))
                    }
                    className='px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold'
                    aria-describedby='sort-order-help'
                  >
                    <option value='desc'>내림차순</option>
                    <option value='asc'>오름차순</option>
                  </select>
                  <div id='sort-order-help' className='sr-only'>정렬 순서를 선택하세요</div>
                </div>
              </div>
            </fieldset>

            {/* 연도 범위 */}
            <fieldset className='space-y-3'>
              <legend className='font-medium flex items-center gap-2'>
                <Calendar className='h-4 w-4' aria-hidden='true' />
                제작년도
              </legend>
              <div className='flex items-center gap-2'>
                <div>
                  <label htmlFor='year-from' className='sr-only'>시작 년도</label>
                  <Input
                    id='year-from'
                    type='number'
                    min={availableYears[0]}
                    max={availableYears[1]}
                    value={filters.yearRange[0]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        yearRange: [parseInt(e.target.value) || availableYears[0], prev.yearRange[1]],
                      }))
                    }
                    className='w-20 focus:ring-2 focus:ring-gold'
                    aria-describedby='year-range-help'
                  />
                </div>
                <span className='text-ink-light' aria-hidden='true'>-</span>
                <div>
                  <label htmlFor='year-to' className='sr-only'>종료 년도</label>
                  <Input
                    id='year-to'
                    type='number'
                    min={availableYears[0]}
                    max={availableYears[1]}
                    value={filters.yearRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        yearRange: [prev.yearRange[0], parseInt(e.target.value) || availableYears[1]],
                      }))
                    }
                    className='w-20 focus:ring-2 focus:ring-gold'
                    aria-describedby='year-range-help'
                  />
                </div>
              </div>
              <div id='year-range-help' className='sr-only'>
                {availableYears[0]}년부터 {availableYears[1]}년까지 범위에서 선택할 수 있습니다
              </div>
            </fieldset>

            {/* 재료 선택 */}
            <fieldset className='space-y-3'>
              <legend className='font-medium flex items-center gap-2'>
                <Ruler className='h-4 w-4' aria-hidden='true' />
                재료
              </legend>
              <div 
                className='flex flex-wrap gap-2'
                role='group'
                aria-label='재료 필터 선택'
                aria-describedby='medium-help'
              >
                {availableMediums.map((medium) => (
                  <button
                    key={medium}
                    onClick={() => toggleMedium(medium)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2',
                      filters.selectedMediums.includes(medium)
                        ? 'bg-ink text-white border-ink'
                        : 'bg-background border-border hover:border-ink'
                    )}
                    aria-pressed={filters.selectedMediums.includes(medium)}
                    aria-label={`${medium} 재료 ${filters.selectedMediums.includes(medium) ? '선택됨' : '선택 안됨'}`}
                  >
                    {medium}
                  </button>
                ))}
              </div>
              <div id='medium-help' className='sr-only'>
                여러 재료를 선택할 수 있습니다. 선택된 재료로 작품을 필터링합니다.
              </div>
            </fieldset>

            {/* 모달 액션 버튼 */}
            <div className='flex justify-end gap-2 pt-4 border-t border-border'>
              <Button 
                variant='outline' 
                onClick={resetFilters}
                aria-label='모든 필터 설정 초기화'
              >
                초기화
              </Button>
              <Button 
                onClick={() => setIsFilterOpen(false)}
                aria-label='필터 설정 적용하고 닫기'
              >
                적용
              </Button>
            </div>
          </div>
        </AccessibleModal>
      </div>
    </div>
  )
}

