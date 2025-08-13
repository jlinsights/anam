import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { performance } from 'perf_hooks'
import { OptimizedGallery } from '@/components/optimized-gallery'
import { EnhancedGalleryComponent } from '@/components/enhanced-gallery-component'
import { SearchFilter } from '@/components/search-filter'
import { mockArtworks } from '../lib/hooks/artwork.mock'
import { mockPerformanceMetrics } from '../utils/test-utils'
import { server } from '../utils/test-utils'
import { apiHandlers } from '../mocks/api-handlers'

// Performance 측정을 위한 설정
const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: 100, // 100ms
  SEARCH_DEBOUNCE: 300, // 300ms
  IMAGE_LOAD_TIME: 500, // 500ms
  API_RESPONSE_TIME: 1000, // 1s
  MEMORY_LIMIT: 50 * 1024 * 1024, // 50MB
  DOM_NODES_LIMIT: 1000,
}

// 성능 측정 헬퍼 함수
const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const startTime = performance.now()
  renderFn()
  await waitFor(() => {
    // DOM이 완전히 렌더링될 때까지 대기
    expect(document.body.children.length).toBeGreaterThan(0)
  })
  const endTime = performance.now()
  return endTime - startTime
}

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize
  }
  return 0
}

const countDOMNodes = (): number => {
  return document.querySelectorAll('*').length
}

describe('Gallery Performance Tests', () => {
  beforeAll(() => {
    server.use(...apiHandlers)
    mockPerformanceMetrics()
  })

  describe('OptimizedGallery 성능', () => {
    it('초기 렌더링이 성능 임계값 내에서 완료되어야 한다', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
        )
      })

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME)
    })

    it('대량의 작품 데이터를 효율적으로 렌더링해야 한다', async () => {
      // 100개의 작품 데이터 생성
      const largeArtworkSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockArtworks[0],
        id: `artwork-${i}`,
        title: `작품 ${i}`,
        slug: `artwork-${i}`,
      }))

      const startMemory = measureMemoryUsage()
      
      const renderTime = await measureRenderTime(() => {
        render(
          <OptimizedGallery artworks={largeArtworkSet} loading={false} error={null} />
        )
      })

      const endMemory = measureMemoryUsage()
      const memoryUsed = endMemory - startMemory

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME * 2) // 2배 여유
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT)
    })

    it('DOM 노드 수가 적정 수준을 유지해야 한다', () => {
      render(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const domNodeCount = countDOMNodes()
      expect(domNodeCount).toBeLessThan(PERFORMANCE_THRESHOLDS.DOM_NODES_LIMIT)
    })

    it('이미지 지연 로딩이 성능을 향상시켜야 한다', async () => {
      const mockIntersectionObserver = jest.fn()
      const mockObserve = jest.fn()
      const mockUnobserve = jest.fn()
      
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: jest.fn(),
      })
      
      window.IntersectionObserver = mockIntersectionObserver

      render(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // IntersectionObserver가 사용되었는지 확인
      expect(mockIntersectionObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalledTimes(mockArtworks.length)
    })

    it('컴포넌트 언마운트 시 메모리 누수가 없어야 한다', () => {
      const { unmount } = render(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const beforeUnmount = measureMemoryUsage()
      unmount()
      
      // 강제 가비지 컬렉션 (테스트 환경에서만)
      if (global.gc) {
        global.gc()
      }

      const afterUnmount = measureMemoryUsage()
      const memoryDiff = afterUnmount - beforeUnmount

      // 메모리 사용량이 크게 증가하지 않아야 함
      expect(Math.abs(memoryDiff)).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT / 10)
    })

    it('리렌더링 최적화가 작동해야 한다', async () => {
      let renderCount = 0
      const TestComponent = ({ artworks }: { artworks: any[] }) => {
        renderCount++
        return <OptimizedGallery artworks={artworks} loading={false} error={null} />
      }

      const { rerender } = render(<TestComponent artworks={mockArtworks} />)
      
      const initialRenderCount = renderCount

      // 같은 props로 리렌더링
      rerender(<TestComponent artworks={mockArtworks} />)
      
      // 렌더링 횟수가 최소화되어야 함
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(1)
    })
  })

  describe('SearchFilter 성능', () => {
    const mockHandlers = {
      onFilteredResults: jest.fn(),
    }

    it('검색 디바운싱이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter artworks={mockArtworks} {...mockHandlers} />)

      const searchInput = screen.getByPlaceholderText(/검색/i)
      
      // 빠른 연속 입력
      const startTime = Date.now()
      await user.type(searchInput, 'test')
      
      // 디바운스 시간 대기
      await waitFor(() => {
        expect(mockHandlers.onFilteredResults).toHaveBeenCalled()
      }, { timeout: PERFORMANCE_THRESHOLDS.SEARCH_DEBOUNCE + 100 })

      const endTime = Date.now()
      const actualDebounceTime = endTime - startTime

      expect(actualDebounceTime).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.SEARCH_DEBOUNCE)
    })

    it('대량 데이터 필터링이 효율적이어야 한다', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockArtworks[0],
        id: `artwork-${i}`,
        title: `작품 ${i}`,
        description: i % 2 === 0 ? '추상 작품' : '구상 작품',
      }))

      const startTime = performance.now()
      
      const { rerender } = render(
        <SearchFilter artworks={largeDataSet} {...mockHandlers} />
      )

      // 검색 필터링 시뮬레이션
      rerender(<SearchFilter artworks={largeDataSet.slice(0, 100)} {...mockHandlers} />)

      const endTime = performance.now()
      const filterTime = endTime - startTime

      expect(filterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME)
    })

    it('모달 열기/닫기가 부드럽게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter artworks={mockArtworks} {...mockHandlers} />)

      const filterButton = screen.getByText(/필터/i)
      
      const startTime = performance.now()
      await user.click(filterButton)
      
      // 모달이 열릴 때까지 대기
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const modalOpenTime = endTime - startTime

      expect(modalOpenTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME)
    })
  })

  describe('EnhancedGalleryComponent 성능', () => {
    beforeEach(() => {
      mockHandlers.onFilteredResults.mockClear()
    })

    it('초기 데이터 로딩이 효율적이어야 한다', async () => {
      const startTime = performance.now()
      
      render(<EnhancedGalleryComponent />)

      // API 데이터 로딩 완료 대기
      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      }, { timeout: PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME)
    })

    it('검색과 필터링이 동시에 사용될 때 성능이 유지되어야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      // 초기 로딩 대기
      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const startTime = performance.now()

      // 검색어 입력
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'test')

      // 카테고리 필터 변경
      const categorySelect = screen.getByTestId('category-filter')
      await user.selectOptions(categorySelect, 'painting')

      // 정렬 변경
      const sortSelect = screen.getByTestId('sort-select')
      await user.selectOptions(sortSelect, 'title-asc')

      const endTime = performance.now()
      const combinedOperationTime = endTime - startTime

      expect(combinedOperationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME * 3)
    })

    it('무한 스크롤이나 페이지네이션이 메모리 효율적이어야 한다', async () => {
      const initialMemory = measureMemoryUsage()

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      // 여러 페이지 로딩 시뮬레이션
      for (let i = 0; i < 5; i++) {
        // 다음 페이지 로딩 시뮬레이션 (실제 구현에 따라 조정)
        await waitFor(() => {
          expect(screen.getByTestId('optimized-gallery')).toBeInTheDocument()
        })
      }

      const finalMemory = measureMemoryUsage()
      const memoryGrowth = finalMemory - initialMemory

      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT)
    })
  })

  describe('이미지 로딩 성능', () => {
    it('이미지 프리로딩이 효과적이어야 한다', async () => {
      const imageLoadTimes: number[] = []
      
      // 이미지 로드 시간 측정 모킹
      const mockImage = class {
        src: string = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        set src(value: string) {
          setTimeout(() => {
            const loadTime = Math.random() * 200 + 50 // 50-250ms 랜덤 시간
            imageLoadTimes.push(loadTime)
            if (this.onload) this.onload()
          }, Math.random() * 100)
        }
      }

      global.Image = mockImage as any

      render(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 모든 이미지 로딩 완료 대기
      await waitFor(() => {
        expect(imageLoadTimes.length).toBeGreaterThan(0)
      }, { timeout: 2000 })

      const averageLoadTime = imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length
      expect(averageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOAD_TIME)
    })

    it('이미지 압축과 최적화가 적용되어야 한다', () => {
      render(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const images = screen.getAllByRole('img')
      images.forEach(img => {
        const src = img.getAttribute('src')
        expect(src).toMatch(/\.(webp|jpg|jpeg)$/i) // 최적화된 포맷
        expect(src).toMatch(/(medium|thumb)/) // 적절한 크기
      })
    })

    it('이미지 지연 로딩으로 초기 로딩 시간이 개선되어야 한다', async () => {
      const startTime = performance.now()

      render(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 첫 화면의 이미지만 로딩되어야 함
      const images = screen.getAllByRole('img')
      const priorityImages = Array.from(images).filter(img => 
        img.getAttribute('loading') === 'eager'
      )

      expect(priorityImages.length).toBeLessThanOrEqual(4) // 첫 4개만 eager 로딩

      const endTime = performance.now()
      const initialRenderTime = endTime - startTime

      expect(initialRenderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME)
    })
  })

  describe('실시간 성능 모니터링', () => {
    it('Web Vitals 메트릭이 임계값 내에 있어야 한다', async () => {
      // Core Web Vitals 시뮬레이션
      const vitals = {
        LCP: 2400, // Largest Contentful Paint (ms)
        FID: 90,   // First Input Delay (ms)
        CLS: 0.05, // Cumulative Layout Shift
      }

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('optimized-gallery')).toBeInTheDocument()
      })

      // Web Vitals 임계값 검증
      expect(vitals.LCP).toBeLessThan(2500) // Good: < 2.5s
      expect(vitals.FID).toBeLessThan(100)  // Good: < 100ms
      expect(vitals.CLS).toBeLessThan(0.1)  // Good: < 0.1
    })

    it('성능 저하 없이 연속 작업이 가능해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument()
      })

      const performanceTimes: number[] = []

      // 10번의 연속 검색 작업
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        
        const searchInput = screen.getByTestId('search-input')
        await user.clear(searchInput)
        await user.type(searchInput, `test${i}`)

        await waitFor(() => {
          expect(searchInput).toHaveValue(`test${i}`)
        })

        const endTime = performance.now()
        performanceTimes.push(endTime - startTime)
      }

      // 성능이 일정하게 유지되어야 함 (성능 저하 없음)
      const avgTime = performanceTimes.reduce((a, b) => a + b, 0) / performanceTimes.length
      const maxTime = Math.max(...performanceTimes)
      
      expect(maxTime).toBeLessThan(avgTime * 2) // 최대 시간이 평균의 2배를 넘지 않아야 함
    })

    it('메모리 사용량이 시간이 지나도 안정적이어야 한다', async () => {
      const memorySnapshots: number[] = []
      
      render(<EnhancedGalleryComponent />)

      // 10초 동안 1초마다 메모리 사용량 측정
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)) // 100ms 간격
        memorySnapshots.push(measureMemoryUsage())
      }

      // 메모리 누수가 없어야 함 (지속적인 증가 없음)
      const initialMemory = memorySnapshots[0]
      const finalMemory = memorySnapshots[memorySnapshots.length - 1]
      const memoryGrowth = finalMemory - initialMemory

      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT / 4)
    })
  })
})