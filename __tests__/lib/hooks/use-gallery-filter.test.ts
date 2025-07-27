import { renderHook, act } from '@testing-library/react'
import { 
  useGalleryFilter, 
  useGalleryPagination, 
  useGalleryStats 
} from '@/lib/hooks/use-gallery-filter'
import { useUIStore } from '@/lib/store/ui-store'
import { mockArtworks, mockArtworkWithoutOptionalFields } from './artwork.mock'

// Mock UI Store
const mockUseGallery = jest.fn()
jest.mock('@/lib/store/ui-store', () => ({
  useGallery: () => mockUseGallery(),
}))

describe('useGalleryFilter', () => {
  const defaultGalleryFilter = {
    sortBy: 'year' as const,
    sortOrder: 'desc' as const,
  }

  beforeEach(() => {
    mockUseGallery.mockReturnValue({
      galleryFilter: defaultGalleryFilter,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('기본 필터링', () => {
    it('필터가 없을 때 모든 작품을 반환해야 한다', () => {
      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      expect(result.current.filteredArtworks).toHaveLength(mockArtworks.length)
      expect(result.current.totalCount).toBe(mockArtworks.length)
      expect(result.current.hasResults).toBe(true)
      expect(result.current.isFiltered).toBe(false)
    })

    it('빈 배열이 전달되어도 정상 작동해야 한다', () => {
      const { result } = renderHook(() => useGalleryFilter([]))
      
      expect(result.current.filteredArtworks).toHaveLength(0)
      expect(result.current.totalCount).toBe(0)
      expect(result.current.hasResults).toBe(false)
      expect(result.current.isFiltered).toBe(false)
    })
  })

  describe('연도 필터링', () => {
    it('특정 연도로 필터링할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          year: '2024',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.every(artwork => artwork.year?.toString() === '2024')).toBe(true)
      expect(result.current.isFiltered).toBe(true)
    })

    it('존재하지 않는 연도로 필터링 시 빈 결과를 반환해야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          year: '1999',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      expect(result.current.filteredArtworks).toHaveLength(0)
      expect(result.current.hasResults).toBe(false)
      expect(result.current.isFiltered).toBe(true)
    })

    it('연도가 없는 작품을 적절히 처리해야 한다', () => {
      const artworksWithMissingYear = [
        ...mockArtworks,
        { ...mockArtworkWithoutOptionalFields, year: 0 }, // year는 number 타입이므로 0 사용
      ]

      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          year: '2024',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(artworksWithMissingYear))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.every(artwork => artwork.year?.toString() === '2024')).toBe(true)
    })
  })

  describe('재료 필터링', () => {
    it('재료로 필터링할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          medium: '먹',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.every(artwork => 
        artwork.medium?.toLowerCase().includes('먹')
      )).toBe(true)
      expect(result.current.isFiltered).toBe(true)
    })

    it('대소문자를 구분하지 않고 재료를 필터링해야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          medium: '한지',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.every(artwork => 
        artwork.medium?.toLowerCase().includes('한지')
      )).toBe(true)
    })

    it('재료가 없는 작품을 적절히 처리해야 한다', () => {
      const artworksWithMissingMedium = [
        ...mockArtworks,
        { ...mockArtworkWithoutOptionalFields, medium: '기타' },
      ]

      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          medium: '먹',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(artworksWithMissingMedium))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.every(artwork => 
        artwork.medium?.toLowerCase().includes('먹')
      )).toBe(true)
    })
  })

  describe('검색 쿼리 필터링', () => {
    it('제목으로 검색할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          searchQuery: '길',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.some(artwork => artwork.title.includes('길'))).toBe(true)
      expect(result.current.isFiltered).toBe(true)
    })

    it('설명으로 검색할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          searchQuery: '테스트',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.some(artwork => 
        artwork.description?.includes('테스트')
      )).toBe(true)
    })

    it('작가 노트로 검색할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          searchQuery: '작가',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.some(artwork => 
        artwork.artistNote?.includes('작가')
      )).toBe(true)
    })

    it('여러 필드에서 검색이 가능해야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          ...defaultGalleryFilter,
          searchQuery: '2024',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      expect(filteredResults.length).toBeGreaterThan(0)
      expect(result.current.isFiltered).toBe(true)
    })
  })

  describe('정렬 기능', () => {
    it('연도순으로 정렬할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          sortBy: 'year',
          sortOrder: 'asc',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const sortedResults = result.current.filteredArtworks
      for (let i = 1; i < sortedResults.length; i++) {
        const prevYear = sortedResults[i - 1].year || 0
        const currentYear = sortedResults[i].year || 0
        expect(prevYear).toBeLessThanOrEqual(currentYear)
      }
    })

    it('제목순으로 정렬할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          sortBy: 'title',
          sortOrder: 'asc',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const sortedResults = result.current.filteredArtworks
      for (let i = 1; i < sortedResults.length; i++) {
        const prevTitle = sortedResults[i - 1].title || ''
        const currentTitle = sortedResults[i].title || ''
        expect(prevTitle.localeCompare(currentTitle, 'ko-KR')).toBeLessThanOrEqual(0)
      }
    })

    it('재료순으로 정렬할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          sortBy: 'medium',
          sortOrder: 'asc',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const sortedResults = result.current.filteredArtworks
      for (let i = 1; i < sortedResults.length; i++) {
        const prevMedium = sortedResults[i - 1].medium || ''
        const currentMedium = sortedResults[i].medium || ''
        expect(prevMedium.localeCompare(currentMedium, 'ko-KR')).toBeLessThanOrEqual(0)
      }
    })

    it('내림차순으로 정렬할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          sortBy: 'year',
          sortOrder: 'desc',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const sortedResults = result.current.filteredArtworks
      for (let i = 1; i < sortedResults.length; i++) {
        const prevYear = sortedResults[i - 1].year || 0
        const currentYear = sortedResults[i].year || 0
        expect(prevYear).toBeGreaterThanOrEqual(currentYear)
      }
    })
  })

  describe('사용 가능한 옵션', () => {
    it('사용 가능한 연도 목록을 반환해야 한다', () => {
      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const availableYears = result.current.availableYears
      expect(availableYears).toContain('2024')
      expect(availableYears).toContain('2023')
      expect(availableYears).toContain('2025')
      
      // 내림차순으로 정렬되어야 함
      for (let i = 1; i < availableYears.length; i++) {
        expect(parseInt(availableYears[i - 1])).toBeGreaterThan(parseInt(availableYears[i]))
      }
    })

    it('사용 가능한 재료 목록을 반환해야 한다', () => {
      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const availableMediums = result.current.availableMediums
      expect(availableMediums.length).toBeGreaterThan(0)
      
      // 중복이 없어야 함
      const uniqueMediums = [...new Set(availableMediums)]
      expect(availableMediums).toEqual(uniqueMediums)
      
      // 한국어 정렬되어야 함
      const sortedMediums = [...availableMediums].sort((a, b) => a.localeCompare(b, 'ko-KR'))
      expect(availableMediums).toEqual(sortedMediums)
    })

    it('빈 값들을 필터링해야 한다', () => {
      const artworksWithEmptyValues = [
        ...mockArtworks,
        { ...mockArtworkWithoutOptionalFields, year: 0, medium: '' },
      ]

      const { result } = renderHook(() => useGalleryFilter(artworksWithEmptyValues))
      
      expect(result.current.availableYears.every(year => year)).toBe(true)
      expect(result.current.availableMediums.every(medium => medium)).toBe(true)
    })
  })

  describe('복합 필터링', () => {
    it('여러 필터를 동시에 적용할 수 있어야 한다', () => {
      mockUseGallery.mockReturnValue({
        galleryFilter: {
          year: '2024',
          medium: '먹',
          searchQuery: '작품',
          sortBy: 'title',
          sortOrder: 'asc',
        },
      })

      const { result } = renderHook(() => useGalleryFilter(mockArtworks))
      
      const filteredResults = result.current.filteredArtworks
      
      // 모든 필터 조건을 만족해야 함
      expect(filteredResults.every(artwork => 
        artwork.year?.toString() === '2024' &&
        artwork.medium?.toLowerCase().includes('먹') &&
        (
          artwork.title.includes('작품') ||
          artwork.description?.includes('작품') ||
          artwork.artistNote?.includes('작품')
        )
      )).toBe(true)
      
      expect(result.current.isFiltered).toBe(true)
    })
  })
})

describe('useGalleryPagination', () => {
  const items = mockArtworks

  describe('기본 페이지네이션', () => {
    it('첫 페이지의 아이템들을 반환해야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2 })
      )
      
      expect(result.current.currentPage).toBe(1)
      expect(result.current.paginatedItems).toHaveLength(2)
      expect(result.current.totalPages).toBe(Math.ceil(items.length / 2))
      expect(result.current.hasNextPage).toBe(true)
      expect(result.current.hasPrevPage).toBe(false)
    })

    it('페이지를 이동할 수 있어야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2 })
      )
      
      act(() => {
        result.current.goToPage(2)
      })
      
      expect(result.current.currentPage).toBe(2)
      expect(result.current.hasNextPage).toBe(items.length > 4)
      expect(result.current.hasPrevPage).toBe(true)
    })

    it('다음 페이지로 이동할 수 있어야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2 })
      )
      
      act(() => {
        result.current.nextPage()
      })
      
      expect(result.current.currentPage).toBe(2)
    })

    it('이전 페이지로 이동할 수 있어야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2, initialPage: 2 })
      )
      
      act(() => {
        result.current.prevPage()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('첫 페이지로 이동할 수 있어야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2, initialPage: 3 })
      )
      
      act(() => {
        result.current.goToFirst()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('마지막 페이지로 이동할 수 있어야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2 })
      )
      
      act(() => {
        result.current.goToLast()
      })
      
      expect(result.current.currentPage).toBe(result.current.totalPages)
    })
  })

  describe('경계값 처리', () => {
    it('첫 페이지에서 이전 페이지 시도 시 이동하지 않아야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2 })
      )
      
      act(() => {
        result.current.prevPage()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('마지막 페이지에서 다음 페이지 시도 시 이동하지 않아야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: items.length })
      )
      
      act(() => {
        result.current.nextPage()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('유효하지 않은 페이지 번호를 적절히 처리해야 한다', () => {
      const { result } = renderHook(() => 
        useGalleryPagination(items, { itemsPerPage: 2 })
      )
      
      act(() => {
        result.current.goToPage(999)
      })
      
      expect(result.current.currentPage).toBe(result.current.totalPages)
      
      act(() => {
        result.current.goToPage(-1)
      })
      
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('동적 변경 처리', () => {
    it('아이템 목록이 변경되면 첫 페이지로 이동해야 한다', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useGalleryPagination(items, { itemsPerPage: 2 }),
        { initialProps: { items } }
      )
      
      act(() => {
        result.current.goToPage(2)
      })
      expect(result.current.currentPage).toBe(2)
      
      // 아이템 목록 변경
      const newItems = items.slice(0, 2)
      rerender({ items: newItems })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('현재 페이지가 총 페이지를 초과하면 마지막 페이지로 이동해야 한다', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useGalleryPagination(items, { itemsPerPage: 2 }),
        { initialProps: { items } }
      )
      
      act(() => {
        result.current.goToLast()
      })
      const lastPage = result.current.currentPage
      
      // 아이템 수 감소
      const newItems = items.slice(0, 2)
      rerender({ items: newItems })
      
      expect(result.current.currentPage).toBeLessThanOrEqual(result.current.totalPages)
    })
  })
})

describe('useGalleryStats', () => {
  describe('기본 통계', () => {
    it('총 작품 수를 반환해야 한다', () => {
      const { result } = renderHook(() => useGalleryStats(mockArtworks))
      
      expect(result.current.totalArtworks).toBe(mockArtworks.length)
    })

    it('연도별 작품 수를 계산해야 한다', () => {
      const { result } = renderHook(() => useGalleryStats(mockArtworks))
      
      const artworksByYear = result.current.artworksByYear
      
      // 각 연도별로 올바른 개수가 계산되어야 함
      Object.entries(artworksByYear).forEach(([year, count]) => {
        const expectedCount = mockArtworks.filter(
          artwork => artwork.year?.toString() === year
        ).length
        expect(count).toBe(expectedCount)
      })
    })

    it('재료별 작품 수를 계산해야 한다', () => {
      const { result } = renderHook(() => useGalleryStats(mockArtworks))
      
      const artworksByMedium = result.current.artworksByMedium
      
      // 각 재료별로 올바른 개수가 계산되어야 함
      Object.entries(artworksByMedium).forEach(([medium, count]) => {
        const expectedCount = mockArtworks.filter(
          artwork => artwork.medium === medium
        ).length
        expect(count).toBe(expectedCount)
      })
    })

    it('연도 범위를 계산해야 한다', () => {
      const { result } = renderHook(() => useGalleryStats(mockArtworks))
      
      const yearRange = result.current.yearRange
      const years = mockArtworks
        .map(artwork => artwork.year)
        .filter((year): year is number => typeof year === 'number')
      
      expect(yearRange.earliest).toBe(Math.min(...years))
      expect(yearRange.latest).toBe(Math.max(...years))
    })

    it('연간 평균 작품 수를 계산해야 한다', () => {
      const { result } = renderHook(() => useGalleryStats(mockArtworks))
      
      const { totalArtworks, yearRange, averagePerYear } = result.current
      
      if (yearRange.earliest && yearRange.latest) {
        const yearSpan = yearRange.latest - yearRange.earliest + 1
        const expectedAverage = totalArtworks / yearSpan
        expect(averagePerYear).toBe(expectedAverage)
      }
    })
  })

  describe('빈 데이터 처리', () => {
    it('빈 배열을 적절히 처리해야 한다', () => {
      const { result } = renderHook(() => useGalleryStats([]))
      
      expect(result.current.totalArtworks).toBe(0)
      expect(result.current.artworksByYear).toEqual({})
      expect(result.current.artworksByMedium).toEqual({})
      expect(result.current.yearRange.earliest).toBeNull()
      expect(result.current.yearRange.latest).toBeNull()
      expect(result.current.averagePerYear).toBe(0)
    })

    it('연도나 재료가 없는 작품을 적절히 처리해야 한다', () => {
      const artworksWithMissingData = [
        mockArtworkWithoutOptionalFields,
        { ...mockArtworkWithoutOptionalFields, year: 0, medium: '' },
      ]

      const { result } = renderHook(() => useGalleryStats(artworksWithMissingData))
      
      expect(result.current.totalArtworks).toBe(2)
      
      // undefined 값들은 통계에서 제외되어야 함
      expect(Object.keys(result.current.artworksByYear)).not.toContain('undefined')
      expect(Object.keys(result.current.artworksByMedium)).not.toContain('undefined')
    })
  })
})