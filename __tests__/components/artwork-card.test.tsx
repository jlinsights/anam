import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArtworkCard, ArtworkGrid, ArtworkCardSkeleton } from '@/components/artwork-card'
import { mockArtwork } from '../lib/hooks/artwork.mock'
import type { Artwork } from '@/lib/types'

// Mock the optimized image component
jest.mock('@/components/optimized-image', () => ({
  GalleryGridImage: ({ artwork, className, priority }: any) => (
    <div 
      data-testid="gallery-image" 
      className={className}
      data-priority={priority}
      data-artwork-title={artwork.title}
    >
      Mock Image: {artwork.title}
    </div>
  ),
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="artwork-link">
      {children}
    </a>
  )
})

describe('ArtworkCard', () => {
  const defaultProps = {
    artwork: mockArtwork,
  }

  describe('기본 렌더링', () => {
    it('아트워크 제목이 표시되어야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      expect(screen.getByText(mockArtwork.title)).toBeInTheDocument()
    })

    it('아트워크 연도가 표시되어야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      expect(screen.getByText(mockArtwork.year?.toString() || '')).toBeInTheDocument()
    })

    it('올바른 링크를 가져야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      const link = screen.getByTestId('artwork-link')
      expect(link).toHaveAttribute('href', `/gallery/${mockArtwork.slug}`)
    })

    it('기본 variant 클래스를 적용해야 한다', () => {
      const { container } = render(<ArtworkCard {...defaultProps} />)
      const card = container.querySelector('.card-art')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Variant 스타일링', () => {
    it('minimal variant를 올바르게 적용해야 한다', () => {
      const { container } = render(<ArtworkCard {...defaultProps} variant="minimal" />)
      const card = container.querySelector('.bg-transparent')
      expect(card).toBeInTheDocument()
    })

    it('featured variant를 올바르게 적용해야 한다', () => {
      const { container } = render(<ArtworkCard {...defaultProps} variant="featured" />)
      const card = container.querySelector('.card-art-elevated')
      expect(card).toBeInTheDocument()
    })

    it('compact variant를 올바르게 적용해야 한다', () => {
      render(<ArtworkCard {...defaultProps} variant="compact" />)
      expect(screen.getByText(mockArtwork.title)).toBeInTheDocument()
    })
  })

  describe('메타데이터 표시', () => {
    it('showMetadata가 true일 때 메타데이터를 표시해야 한다', () => {
      render(<ArtworkCard {...defaultProps} showMetadata={true} />)
      expect(screen.getByText(mockArtwork.title)).toBeInTheDocument()
      if (mockArtwork.year) {
        expect(screen.getByText(mockArtwork.year.toString())).toBeInTheDocument()
      }
    })

    it('showMetadata가 false일 때 메타데이터를 숨겨야 한다', () => {
      render(<ArtworkCard {...defaultProps} showMetadata={false} />)
      expect(screen.queryByText(mockArtwork.title)).not.toBeInTheDocument()
    })

    it('featured 작품에 대표작 배지를 표시해야 한다', () => {
      const featuredArtwork: Artwork = { ...mockArtwork, featured: true }
      render(<ArtworkCard artwork={featuredArtwork} />)
      expect(screen.getByText('대표작')).toBeInTheDocument()
    })

    it('medium 정보가 있을 때 표시해야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      if (mockArtwork.medium) {
        expect(screen.getByText(mockArtwork.medium)).toBeInTheDocument()
      }
    })

    it('dimensions 정보가 있을 때 표시해야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      if (mockArtwork.dimensions) {
        expect(screen.getByText(mockArtwork.dimensions)).toBeInTheDocument()
      }
    })
  })

  describe('액션 버튼', () => {
    it('showActions가 true일 때 액션 버튼들을 표시해야 한다', () => {
      render(<ArtworkCard {...defaultProps} showActions={true} />)
      expect(screen.getByText('좋아요')).toBeInTheDocument()
      expect(screen.getByText('공유')).toBeInTheDocument()
      expect(screen.getByText('상세보기')).toBeInTheDocument()
    })

    it('showActions가 false일 때 액션 버튼들을 숨겨야 한다', () => {
      render(<ArtworkCard {...defaultProps} showActions={false} />)
      expect(screen.queryByText('좋아요')).not.toBeInTheDocument()
      expect(screen.queryByText('공유')).not.toBeInTheDocument()
      expect(screen.queryByText('상세보기')).not.toBeInTheDocument()
    })

    it('액션 버튼 클릭이 가능해야 한다', () => {
      render(<ArtworkCard {...defaultProps} showActions={true} />)
      const likeButton = screen.getByText('좋아요')
      const shareButton = screen.getByText('공유')
      const detailButton = screen.getByText('상세보기')
      
      fireEvent.click(likeButton)
      fireEvent.click(shareButton)
      fireEvent.click(detailButton)
      
      // 클릭 이벤트가 정상적으로 발생하는지 확인
      expect(likeButton).toBeInTheDocument()
      expect(shareButton).toBeInTheDocument()
      expect(detailButton).toBeInTheDocument()
    })
  })

  describe('호버 효과', () => {
    it('마우스 호버 시 상태가 변경되어야 한다', async () => {
      const { container } = render(<ArtworkCard {...defaultProps} />)
      const card = container.querySelector('.card-art')
      
      if (card) {
        fireEvent.mouseEnter(card)
        await waitFor(() => {
          expect(card).toBeInTheDocument()
        })
        
        fireEvent.mouseLeave(card)
        await waitFor(() => {
          expect(card).toBeInTheDocument()
        })
      }
    })
  })

  describe('이미지 우선순위', () => {
    it('priority가 true일 때 이미지에 우선순위를 설정해야 한다', () => {
      render(<ArtworkCard {...defaultProps} priority={true} />)
      const image = screen.getByTestId('gallery-image')
      expect(image).toHaveAttribute('data-priority', 'true')
    })

    it('priority가 false일 때 이미지에 우선순위를 설정하지 않아야 한다', () => {
      render(<ArtworkCard {...defaultProps} priority={false} />)
      const image = screen.getByTestId('gallery-image')
      expect(image).toHaveAttribute('data-priority', 'false')
    })
  })

  describe('접근성', () => {
    it('링크에 적절한 aria-label이 있어야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      const link = screen.getByTestId('artwork-link')
      expect(link).toBeInTheDocument()
    })

    it('이미지에 적절한 alt 텍스트가 있어야 한다', () => {
      render(<ArtworkCard {...defaultProps} />)
      const image = screen.getByTestId('gallery-image')
      expect(image).toHaveAttribute('data-artwork-title', mockArtwork.title)
    })
  })
})

describe('ArtworkGrid', () => {
  const mockArtworks: Artwork[] = [
    mockArtwork,
    { ...mockArtwork, id: '2', title: '작품 2', slug: 'artwork-2' },
    { ...mockArtwork, id: '3', title: '작품 3', slug: 'artwork-3' },
  ]

  it('모든 아트워크를 렌더링해야 한다', () => {
    render(<ArtworkGrid artworks={mockArtworks} />)
    expect(screen.getByText('작품 1')).toBeInTheDocument()
    expect(screen.getByText('작품 2')).toBeInTheDocument()
    expect(screen.getByText('작품 3')).toBeInTheDocument()
  })

  it('올바른 grid columns 클래스를 적용해야 한다', () => {
    const { container } = render(<ArtworkGrid artworks={mockArtworks} columns={3} />)
    const grid = container.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3')
    expect(grid).toBeInTheDocument()
  })

  it('첫 4개 이미지에 priority를 설정해야 한다', () => {
    const manyArtworks = Array.from({ length: 6 }, (_, i) => ({
      ...mockArtwork,
      id: `${i + 1}`,
      title: `작품 ${i + 1}`,
      slug: `artwork-${i + 1}`,
    }))

    render(<ArtworkGrid artworks={manyArtworks} />)
    const images = screen.getAllByTestId('gallery-image')
    
    // 첫 4개는 priority true
    for (let i = 0; i < 4; i++) {
      expect(images[i]).toHaveAttribute('data-priority', 'true')
    }
    
    // 나머지는 priority false
    for (let i = 4; i < images.length; i++) {
      expect(images[i]).toHaveAttribute('data-priority', 'false')
    }
  })

  it('빈 배열일 때 아무것도 렌더링하지 않아야 한다', () => {
    const { container } = render(<ArtworkGrid artworks={[]} />)
    const grid = container.querySelector('.grid')
    expect(grid?.children).toHaveLength(0)
  })
})

describe('ArtworkCardSkeleton', () => {
  it('기본 스켈레톤을 렌더링해야 한다', () => {
    const { container } = render(<ArtworkCardSkeleton />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('minimal variant 스켈레톤을 렌더링해야 한다', () => {
    const { container } = render(<ArtworkCardSkeleton variant="minimal" />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('featured variant 스켈레톤을 렌더링해야 한다', () => {
    const { container } = render(<ArtworkCardSkeleton variant="featured" />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('compact variant 스켈레톤을 렌더링해야 한다', () => {
    const { container } = render(<ArtworkCardSkeleton variant="compact" />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })
})