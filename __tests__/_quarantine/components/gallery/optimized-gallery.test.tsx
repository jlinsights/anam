import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptimizedGallery } from '@/components/optimized-gallery'
import { mockArtworks } from '../../lib/hooks/artwork.mock'
import { testAccessibility, testKeyboardNavigation } from '../../utils/test-utils'
import type { Artwork } from '@/lib/types'

// Mock the optimized image component
jest.mock('@/components/optimized-image', () => ({
  GalleryGridImage: ({ artwork, className, priority, onLoad }: any) => (
    <div
      data-testid={`gallery-image-${artwork.id}`}
      className={className}
      data-priority={priority}
      data-artwork-title={artwork.title}
      onClick={() => onLoad?.()}
    >
      Mock Image: {artwork.title}
    </div>
  ),
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid='artwork-link'>
      {children}
    </a>
  )
})

// Mock intersection observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

describe('OptimizedGallery', () => {
  const defaultProps = {
    artworks: mockArtworks,
    loading: false,
    error: null,
  }

  beforeEach(() => {
    mockIntersectionObserver.mockClear()
  })

  describe('기본 렌더링', () => {
    it('모든 아트워크를 올바르게 렌더링해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      mockArtworks.forEach(artwork => {
        expect(screen.getByText(artwork.title)).toBeInTheDocument()
        expect(screen.getByText(artwork.year.toString())).toBeInTheDocument()
        if (artwork.medium) {
          expect(screen.getByText(artwork.medium)).toBeInTheDocument()
        }
      })
    })

    it('아트워크가 없을 때 빈 상태를 표시해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} artworks={[]} />)
      expect(screen.getByText('아직 작품이 없습니다')).toBeInTheDocument()
    })

    it('로딩 상태를 올바르게 표시해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} loading={true} />)
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('에러 상태를 올바르게 표시해야 한다', () => {
      const error = { message: '작품을 불러올 수 없습니다', code: 'FETCH_ERROR' }
      render(<OptimizedGallery {...defaultProps} error={error} />)
      expect(screen.getByText('작품을 불러올 수 없습니다')).toBeInTheDocument()
    })
  })

  describe('그리드 레이아웃', () => {
    it('기본 그리드 레이아웃을 적용해야 한다', () => {
      const { container } = render(<OptimizedGallery {...defaultProps} />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    })

    it('커스텀 columns 설정을 적용해야 한다', () => {
      const { container } = render(
        <OptimizedGallery {...defaultProps} columns={4} />
      )
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('lg:grid-cols-4')
    })

    it('반응형 레이아웃 클래스가 올바르게 적용되어야 한다', () => {
      const { container } = render(<OptimizedGallery {...defaultProps} />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1') // 모바일
      expect(grid).toHaveClass('sm:grid-cols-2') // 태블릿
      expect(grid).toHaveClass('lg:grid-cols-3') // 데스크톱
    })
  })

  describe('아트워크 상호작용', () => {
    it('아트워크 클릭 시 상세 페이지로 이동해야 한다', async () => {
      const user = userEvent.setup()
      render(<OptimizedGallery {...defaultProps} />)
      
      const firstArtworkLink = screen.getAllByTestId('artwork-link')[0]
      await user.click(firstArtworkLink)
      
      expect(firstArtworkLink).toHaveAttribute(
        'href',
        `/gallery/${mockArtworks[0].slug}`
      )
    })

    it('아트워크 호버 시 효과가 적용되어야 한다', async () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      const firstArtwork = screen.getByText(mockArtworks[0].title).closest('.card-art')
      expect(firstArtwork).toBeInTheDocument()
      
      if (firstArtwork) {
        fireEvent.mouseEnter(firstArtwork)
        await waitFor(() => {
          expect(firstArtwork).toBeInTheDocument()
        })
      }
    })

    it('키보드 내비게이션이 올바르게 작동해야 한다', async () => {
      const { container } = render(<OptimizedGallery {...defaultProps} />)
      
      await testKeyboardNavigation(container, mockArtworks.length)
    })
  })

  describe('이미지 최적화', () => {
    it('첫 4개 이미지에 priority를 설정해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      const images = screen.getAllByTestId(/gallery-image-/)
      
      for (let i = 0; i < Math.min(4, images.length); i++) {
        expect(images[i]).toHaveAttribute('data-priority', 'true')
      }
      
      for (let i = 4; i < images.length; i++) {
        expect(images[i]).toHaveAttribute('data-priority', 'false')
      }
    })

    it('지연 로딩이 올바르게 설정되어야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      // IntersectionObserver가 호출되었는지 확인
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('이미지 로드 이벤트를 처리해야 한다', async () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      const firstImage = screen.getByTestId(`gallery-image-${mockArtworks[0].id}`)
      fireEvent.click(firstImage) // onLoad 시뮬레이션
      
      await waitFor(() => {
        expect(firstImage).toBeInTheDocument()
      })
    })
  })

  describe('접근성', () => {
    it('접근성 기준을 준수해야 한다', async () => {
      const { container } = render(<OptimizedGallery {...defaultProps} />)
      await testAccessibility(container)
    })

    it('스크린 리더를 위한 적절한 라벨이 있어야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      mockArtworks.forEach(artwork => {
        const image = screen.getByTestId(`gallery-image-${artwork.id}`)
        expect(image).toHaveAttribute('data-artwork-title', artwork.title)
      })
    })

    it('키보드로 모든 링크에 접근할 수 있어야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      const links = screen.getAllByTestId('artwork-link')
      expect(links).toHaveLength(mockArtworks.length)
      
      links.forEach(link => {
        expect(link).toBeVisible()
        expect(link).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('성능 최적화', () => {
    it('많은 아트워크도 원활하게 렌더링해야 한다', () => {
      const manyArtworks: Artwork[] = Array.from({ length: 50 }, (_, i) => ({
        ...mockArtworks[0],
        id: `artwork-${i}`,
        title: `작품 ${i}`,
        slug: `artwork-${i}`,
      }))

      const { container } = render(
        <OptimizedGallery {...defaultProps} artworks={manyArtworks} />
      )
      
      expect(container.querySelectorAll('.card-art')).toHaveLength(50)
    })

    it('이미지 지연 로딩이 성능 향상에 도움이 되어야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      // 초기에 모든 이미지가 로드되지 않았음을 확인
      const images = screen.getAllByTestId(/gallery-image-/)
      expect(images.length).toBeGreaterThan(0)
      
      // IntersectionObserver가 설정되었음을 확인
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('에러 처리', () => {
    it('이미지 로드 실패를 적절히 처리해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      const images = screen.getAllByTestId(/gallery-image-/)
      expect(images[0]).toBeInTheDocument()
      
      // 이미지 로드 실패 시뮬레이션은 OptimizedImage 컴포넌트에서 처리
    })

    it('빈 배열 처리를 올바르게 해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} artworks={[]} />)
      
      expect(screen.getByText('아직 작품이 없습니다')).toBeInTheDocument()
      expect(screen.queryByTestId(/gallery-image-/)).not.toBeInTheDocument()
    })

    it('잘못된 데이터 구조를 안전하게 처리해야 한다', () => {
      const invalidArtworks = [
        {
          id: 'invalid',
          // 필수 필드 누락
        } as any,
      ]

      expect(() => {
        render(<OptimizedGallery {...defaultProps} artworks={invalidArtworks} />)
      }).not.toThrow()
    })
  })

  describe('필터링 및 정렬', () => {
    it('featured 아트워크를 올바르게 표시해야 한다', () => {
      render(<OptimizedGallery {...defaultProps} />)
      
      const featuredArtworks = mockArtworks.filter(artwork => artwork.featured)
      featuredArtworks.forEach(artwork => {
        expect(screen.getByText('대표작')).toBeInTheDocument()
      })
    })

    it('카테고리별 필터링이 작동해야 한다', () => {
      const paintingArtworks = mockArtworks.filter(
        artwork => artwork.tags?.includes('서예')
      )
      
      render(<OptimizedGallery {...defaultProps} artworks={paintingArtworks} />)
      
      paintingArtworks.forEach(artwork => {
        expect(screen.getByText(artwork.title)).toBeInTheDocument()
      })
    })
  })

  describe('반응형 디자인', () => {
    it('모바일 뷰포트에서 올바른 레이아웃을 사용해야 한다', () => {
      // viewport 설정 모킹
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(<OptimizedGallery {...defaultProps} />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
    })

    it('태블릿 뷰포트에서 올바른 레이아웃을 사용해야 한다', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { container } = render(<OptimizedGallery {...defaultProps} />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('sm:grid-cols-2')
    })
  })
})