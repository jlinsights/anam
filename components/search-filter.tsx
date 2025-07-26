'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, Calendar, Palette, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Artwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AccessibleModal } from '@/components/accessibility'

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
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-light' />
        <Input
          type='text'
          placeholder='작품명이나 설명으로 검색...'
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
          className='pl-10 pr-4'
          aria-label='작품 검색'
        />
      </div>

      {/* 필터 버튼 및 결과 요약 */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsFilterOpen(true)}
            className='relative'
          >
            <Filter className='h-4 w-4 mr-2' />
            필터
            {activeFiltersCount > 0 && (
              <span className='absolute -top-2 -right-2 bg-ink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={resetFilters}
              className='text-ink-light hover:text-ink'
            >
              <X className='h-4 w-4 mr-1' />
              초기화
            </Button>
          )}
        </div>

        <div className='text-sm text-ink-light'>
          {filteredArtworks.length}개 작품
        </div>
      </div>

      {/* 활성 필터 태그 */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {filters.searchTerm && (
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-ink/10 text-ink'>
              검색: {filters.searchTerm}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchTerm: '' }))
                }
                className='ml-1 hover:text-ink/70'
                aria-label='검색어 제거'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          )}

          {filters.selectedMediums.map((medium) => (
            <span
              key={medium}
              className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-ink/10 text-ink'
            >
              {medium}
              <button
                onClick={() => toggleMedium(medium)}
                className='ml-1 hover:text-ink/70'
                aria-label={`${medium} 필터 제거`}
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          ))}

          {(filters.yearRange[0] !== availableYears[0] ||
            filters.yearRange[1] !== availableYears[1]) && (
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-ink/10 text-ink'>
              {filters.yearRange[0]}-{filters.yearRange[1]}년
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    yearRange: availableYears as [number, number],
                  }))
                }
                className='ml-1 hover:text-ink/70'
                aria-label='연도 필터 제거'
              >
                <X className='h-3 w-3' />
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
        <div className='space-y-6'>
          {/* 정렬 옵션 */}
          <div className='space-y-3'>
            <h3 className='font-medium flex items-center gap-2'>
              <Palette className='h-4 w-4' />
              정렬
            </h3>
            <div className='flex gap-2'>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as FilterState['sortBy'],
                  }))
                }
                className='flex-1 px-3 py-2 border border-border rounded-md bg-background'
              >
                <option value='year'>제작년도</option>
                <option value='title'>작품명</option>
                <option value='medium'>재료</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target.value as FilterState['sortOrder'],
                  }))
                }
                className='px-3 py-2 border border-border rounded-md bg-background'
              >
                <option value='desc'>내림차순</option>
                <option value='asc'>오름차순</option>
              </select>
            </div>
          </div>

          {/* 연도 범위 */}
          <div className='space-y-3'>
            <h3 className='font-medium flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              제작년도
            </h3>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                min={availableYears[0]}
                max={availableYears[1]}
                value={filters.yearRange[0]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    yearRange: [parseInt(e.target.value), prev.yearRange[1]],
                  }))
                }
                className='w-20'
              />
              <span className='text-ink-light'>-</span>
              <Input
                type='number'
                min={availableYears[0]}
                max={availableYears[1]}
                value={filters.yearRange[1]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    yearRange: [prev.yearRange[0], parseInt(e.target.value)],
                  }))
                }
                className='w-20'
              />
            </div>
          </div>

          {/* 재료 선택 */}
          <div className='space-y-3'>
            <h3 className='font-medium flex items-center gap-2'>
              <Ruler className='h-4 w-4' />
              재료
            </h3>
            <div className='flex flex-wrap gap-2'>
              {availableMediums.map((medium) => (
                <button
                  key={medium}
                  onClick={() => toggleMedium(medium)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm border transition-colors',
                    filters.selectedMediums.includes(medium)
                      ? 'bg-ink text-white border-ink'
                      : 'bg-background border-border hover:border-ink'
                  )}
                >
                  {medium}
                </button>
              ))}
            </div>
          </div>

          {/* 모달 액션 버튼 */}
          <div className='flex justify-end gap-2 pt-4 border-t border-border'>
            <Button variant='outline' onClick={resetFilters}>
              초기화
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>적용</Button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  )
}
