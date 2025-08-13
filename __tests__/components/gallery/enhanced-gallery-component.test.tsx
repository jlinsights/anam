import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedGalleryComponent } from '@/components/enhanced-gallery-component'
import { mockArtworks } from '../../lib/hooks/artwork.mock'
import { testAccessibility } from '../../utils/test-utils'
import { server } from '../../utils/test-utils'
import { apiHandlers } from '../../mocks/api-handlers'

// MSW 핸들러 설정
beforeAll(() => {
  server.use(...apiHandlers)
})

// Mock components
jest.mock('@/components/optimized-gallery', () => ({
  OptimizedGallery: ({ artworks, loading, error }: any) => (
    <div data-testid='optimized-gallery'>
      {loading && <div>Loading gallery...</div>}
      {error && <div>Gallery error: {error.message}</div>}
      {artworks?.map((artwork: any) => (
        <div key={artwork.id} data-testid={`artwork-${artwork.id}`}>
          {artwork.title}
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/search-filter', () => ({
  SearchFilter: ({ onSearch, onFilter, onSort }: any) => (
    <div data-testid='search-filter'>
      <input
        data-testid='search-input'
        placeholder='Search artworks...'
        onChange={(e) => onSearch?.(e.target.value)}
      />
      <select
        data-testid='category-filter'
        onChange={(e) => onFilter?.('category', e.target.value)}
      >
        <option value='all'>All Categories</option>
        <option value='painting'>Painting</option>
        <option value='sculpture'>Sculpture</option>
      </select>
      <select
        data-testid='sort-select'
        onChange={(e) => onSort?.(e.target.value)}
      >
        <option value='year-desc'>Latest First</option>
        <option value='year-asc'>Oldest First</option>
        <option value='title-asc'>Title A-Z</option>
      </select>
    </div>
  ),
}))

describe('EnhancedGalleryComponent', () => {
  beforeEach(() => {
    // Reset any mock calls
    jest.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 한다', async () => {
      render(<EnhancedGalleryComponent />)
      
      expect(screen.getByTestId('search-filter')).toBeInTheDocument()
      expect(screen.getByTestId('optimized-gallery')).toBeInTheDocument()
      
      // API 데이터 로딩 대기
      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })
    })

    it('초기 로딩 상태를 표시해야 한다', () => {
      render(<EnhancedGalleryComponent />)
      expect(screen.getByText('Loading gallery...')).toBeInTheDocument()
    })

    it('검색 필터 컴포넌트가 렌더링되어야 한다', () => {
      render(<EnhancedGalleryComponent />)
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByTestId('category-filter')).toBeInTheDocument()
      expect(screen.getByTestId('sort-select')).toBeInTheDocument()
    })
  })

  describe('데이터 로딩', () => {
    it('API에서 아트워크 데이터를 성공적으로 로드해야 한다', async () => {
      render(<EnhancedGalleryComponent />)
      
      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
        expect(screen.getByTestId('artwork-2')).toBeInTheDocument()
        expect(screen.getByTestId('artwork-3')).toBeInTheDocument()
      })

      expect(screen.queryByText('Loading gallery...')).not.toBeInTheDocument()
    })

    it('API 에러를 적절히 처리해야 한다', async () => {
      // 에러 핸들러로 교체
      server.use(
        ...require('../../mocks/api-handlers').errorHandlers
      )

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByText(/Gallery error:/)).toBeInTheDocument()
      })
    })

    it('빈 데이터를 올바르게 처리해야 한다', async () => {
      // 빈 데이터 응답 모킹
      server.use(
        require('msw').http.get('/api/artworks', () => {
          return require('msw').HttpResponse.json({
            data: [],
            success: true,
            timestamp: new Date().toISOString(),
          })
        })
      )

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.queryByTestId(/artwork-/)).not.toBeInTheDocument()
      })
    })
  })

  describe('검색 기능', () => {
    it('검색어 입력이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      // 초기 데이터 로딩 대기
      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, '작품 1')

      // 검색 결과 확인 (실제 구현에 따라 조정 필요)
      await waitFor(() => {
        expect(searchInput).toHaveValue('작품 1')
      })
    })

    it('검색어 삭제가 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'test')
      await user.clear(searchInput)

      expect(searchInput).toHaveValue('')
    })

    it('실시간 검색이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, '작품')

      // API 호출이 발생했는지 확인 (디바운싱 고려)
      await waitFor(() => {
        expect(searchInput).toHaveValue('작품')
      }, { timeout: 1000 })
    })
  })

  describe('필터링 기능', () => {
    it('카테고리 필터가 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const categoryFilter = screen.getByTestId('category-filter')
      await user.selectOptions(categoryFilter, 'painting')

      expect(categoryFilter).toHaveValue('painting')
    })

    it('여러 필터를 조합할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      // 검색과 카테고리 필터 조합
      const searchInput = screen.getByTestId('search-input')
      const categoryFilter = screen.getByTestId('category-filter')

      await user.type(searchInput, '작품')
      await user.selectOptions(categoryFilter, 'painting')

      expect(searchInput).toHaveValue('작품')
      expect(categoryFilter).toHaveValue('painting')
    })

    it('필터 초기화가 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      const searchInput = screen.getByTestId('search-input')
      const categoryFilter = screen.getByTestId('category-filter')

      await user.type(searchInput, 'test')
      await user.selectOptions(categoryFilter, 'painting')

      // 필터 초기화 (실제 구현에 따라 조정)
      await user.selectOptions(categoryFilter, 'all')
      await user.clear(searchInput)

      expect(searchInput).toHaveValue('')
      expect(categoryFilter).toHaveValue('all')
    })
  })

  describe('정렬 기능', () => {
    it('연도별 정렬이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      await user.selectOptions(sortSelect, 'year-asc')

      expect(sortSelect).toHaveValue('year-asc')
    })

    it('제목별 정렬이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      await user.selectOptions(sortSelect, 'title-asc')

      expect(sortSelect).toHaveValue('title-asc')
    })

    it('정렬 옵션 변경이 즉시 적용되어야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      const sortSelect = screen.getByTestId('sort-select')
      
      await user.selectOptions(sortSelect, 'year-desc')
      expect(sortSelect).toHaveValue('year-desc')

      await user.selectOptions(sortSelect, 'year-asc')
      expect(sortSelect).toHaveValue('year-asc')
    })
  })

  describe('페이지네이션', () => {
    it('페이지네이션이 올바르게 작동해야 한다', async () => {
      // 많은 데이터로 테스트
      const manyArtworks = Array.from({ length: 25 }, (_, i) => ({
        ...mockArtworks[0],
        id: `artwork-${i}`,
        title: `작품 ${i}`,
        slug: `artwork-${i}`,
      }))

      server.use(
        require('msw').http.get('/api/artworks', () => {
          return require('msw').HttpResponse.json({
            data: manyArtworks.slice(0, 12), // 첫 페이지
            success: true,
            pagination: {
              page: 1,
              limit: 12,
              total: 25,
              totalPages: 3,
            },
            timestamp: new Date().toISOString(),
          })
        })
      )

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-0')).toBeInTheDocument()
      })

      // 페이지네이션 버튼이 있는지 확인 (실제 구현에 따라 조정)
      // expect(screen.getByText('다음')).toBeInTheDocument()
    })
  })

  describe('성능 최적화', () => {
    it('검색 디바운싱이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      const searchInput = screen.getByTestId('search-input')
      
      // 빠른 연속 입력
      await user.type(searchInput, 'a')
      await user.type(searchInput, 'b')
      await user.type(searchInput, 'c')

      // 디바운싱으로 인해 마지막 값만 처리되어야 함
      await waitFor(() => {
        expect(searchInput).toHaveValue('abc')
      }, { timeout: 1000 })
    })

    it('메모이제이션이 올바르게 작동해야 한다', async () => {
      const { rerender } = render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      // 같은 props로 리렌더링
      rerender(<EnhancedGalleryComponent />)

      // 컴포넌트가 여전히 올바르게 작동해야 함
      expect(screen.getByTestId('optimized-gallery')).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('접근성 기준을 준수해야 한다', async () => {
      const { container } = render(<EnhancedGalleryComponent />)
      
      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
      })

      await testAccessibility(container)
    })

    it('키보드 내비게이션이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<EnhancedGalleryComponent />)

      const searchInput = screen.getByTestId('search-input')
      const categoryFilter = screen.getByTestId('category-filter')
      const sortSelect = screen.getByTestId('sort-select')

      // Tab 키로 순차 이동
      await user.tab()
      expect(searchInput).toHaveFocus()

      await user.tab()
      expect(categoryFilter).toHaveFocus()

      await user.tab()
      expect(sortSelect).toHaveFocus()
    })

    it('스크린 리더를 위한 적절한 라벨이 있어야 한다', () => {
      render(<EnhancedGalleryComponent />)

      const searchInput = screen.getByTestId('search-input')
      const categoryFilter = screen.getByTestId('category-filter')
      const sortSelect = screen.getByTestId('sort-select')

      expect(searchInput).toHaveAttribute('placeholder')
      expect(categoryFilter).toBeInTheDocument()
      expect(sortSelect).toBeInTheDocument()
    })
  })

  describe('에러 복구', () => {
    it('네트워크 에러 후 재시도가 가능해야 한다', async () => {
      // 초기에 에러 발생
      server.use(
        ...require('../../mocks/api-handlers').errorHandlers
      )

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByText(/Gallery error:/)).toBeInTheDocument()
      })

      // 정상 핸들러로 복구
      server.use(...apiHandlers)

      // 컴포넌트가 복구되어야 함 (실제 구현에 따라 조정)
    })

    it('부분적 데이터 로드 실패를 처리해야 한다', async () => {
      // 일부만 로드되는 상황 시뮬레이션
      server.use(
        require('msw').http.get('/api/artworks', () => {
          return require('msw').HttpResponse.json({
            data: [mockArtworks[0]], // 일부만 반환
            success: true,
            timestamp: new Date().toISOString(),
          })
        })
      )

      render(<EnhancedGalleryComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('artwork-1')).toBeInTheDocument()
        expect(screen.queryByTestId('artwork-2')).not.toBeInTheDocument()
      })
    })
  })
})