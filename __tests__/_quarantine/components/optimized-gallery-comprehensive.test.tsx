import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import OptimizedGallery from '@/components/optimized-gallery'
import { useGalleryFilter } from '@/lib/hooks/use-gallery-filter'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'
import type { Artwork } from '@/lib/types'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock hooks
jest.mock('@/lib/hooks/use-gallery-filter')
jest.mock('@/lib/hooks/use-infinite-scroll')
jest.mock('@/lib/airtable', () => ({
  fetchArtworks: jest.fn()
}))

// Mock components
jest.mock('@/components/search-filter', () => ({
  __esModule: true,
  default: ({ onFilterChange }: any) => (
    <div data-testid="search-filter">
      <input
        data-testid="search-input"
        placeholder="Search artworks"
        onChange={(e) => onFilterChange({ query: e.target.value })}
      />
      <select
        data-testid="category-filter"
        onChange={(e) => onFilterChange({ category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="painting">Painting</option>
        <option value="sculpture">Sculpture</option>
      </select>
    </div>
  )
}))

// Mock data
const mockArtworks: Artwork[] = [
  {
    id: '1',
    slug: 'artwork-1',
    title: 'Test Artwork 1',
    artist: 'Test Artist 1',
    year: 2024,
    medium: 'Oil on Canvas',
    dimensions: '100x100cm',
    price: '₩1,000,000',
    description: 'Test description 1',
    images: [{ url: '/test1.jpg', width: 800, height: 600 }],
    available: true,
    category: 'painting',
    featured: true
  },
  {
    id: '2',
    slug: 'artwork-2',
    title: 'Test Artwork 2',
    artist: 'Test Artist 2',
    year: 2023,
    medium: 'Bronze',
    dimensions: '50x50x50cm',
    price: '₩2,000,000',
    description: 'Test description 2',
    images: [{ url: '/test2.jpg', width: 800, height: 600 }],
    available: true,
    category: 'sculpture',
    featured: false
  }
]

describe('OptimizedGallery', () => {
  const mockUseGalleryFilter = useGalleryFilter as jest.MockedFunction<typeof useGalleryFilter>
  const mockUseInfiniteScroll = useInfiniteScroll as jest.MockedFunction<typeof useInfiniteScroll>

  beforeEach(() => {
    // Setup default mocks
    mockUseGalleryFilter.mockReturnValue({
      filteredItems: mockArtworks,
      setFilter: jest.fn(),
      filter: { query: '', category: '', artist: '', year: '', available: null },
      isLoading: false,
      error: null
    })

    mockUseInfiniteScroll.mockReturnValue({
      displayItems: mockArtworks,
      hasMore: true,
      loadingMore: false,
      loadMore: jest.fn(),
      containerRef: { current: null },
      reset: jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders gallery with artworks', () => {
      render(<OptimizedGallery artworks={mockArtworks} />)
      
      expect(screen.getByText('Test Artwork 1')).toBeInTheDocument()
      expect(screen.getByText('Test Artwork 2')).toBeInTheDocument()
    })

    it('renders search filter', () => {
      render(<OptimizedGallery artworks={mockArtworks} />)
      
      expect(screen.getByTestId('search-filter')).toBeInTheDocument()
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByTestId('category-filter')).toBeInTheDocument()
    })

    it('shows loading state', () => {
      mockUseGalleryFilter.mockReturnValue({
        filteredItems: [],
        setFilter: jest.fn(),
        filter: { query: '', category: '', artist: '', year: '', available: null },
        isLoading: true,
        error: null
      })

      render(<OptimizedGallery artworks={[]} />)
      expect(screen.getByText('Loading artworks...')).toBeInTheDocument()
    })

    it('shows error state', () => {
      mockUseGalleryFilter.mockReturnValue({
        filteredItems: [],
        setFilter: jest.fn(),
        filter: { query: '', category: '', artist: '', year: '', available: null },
        isLoading: false,
        error: new Error('Failed to load artworks')
      })

      render(<OptimizedGallery artworks={[]} />)
      expect(screen.getByText('Failed to load artworks')).toBeInTheDocument()
    })

    it('shows empty state when no artworks', () => {
      mockUseGalleryFilter.mockReturnValue({
        filteredItems: [],
        setFilter: jest.fn(),
        filter: { query: '', category: '', artist: '', year: '', available: null },
        isLoading: false,
        error: null
      })

      mockUseInfiniteScroll.mockReturnValue({
        displayItems: [],
        hasMore: false,
        loadingMore: false,
        loadMore: jest.fn(),
        containerRef: { current: null },
        reset: jest.fn()
      })

      render(<OptimizedGallery artworks={[]} />)
      expect(screen.getByText('No artworks found')).toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    it('filters artworks by search query', async () => {
      const user = userEvent.setup()
      const setFilter = jest.fn()
      
      mockUseGalleryFilter.mockReturnValue({
        filteredItems: mockArtworks,
        setFilter,
        filter: { query: '', category: '', artist: '', year: '', available: null },
        isLoading: false,
        error: null
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Test')
      
      expect(setFilter).toHaveBeenCalledWith({ query: 'Test' })
    })

    it('filters artworks by category', async () => {
      const user = userEvent.setup()
      const setFilter = jest.fn()
      
      mockUseGalleryFilter.mockReturnValue({
        filteredItems: mockArtworks.filter(a => a.category === 'painting'),
        setFilter,
        filter: { query: '', category: 'painting', artist: '', year: '', available: null },
        isLoading: false,
        error: null
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      const categorySelect = screen.getByTestId('category-filter')
      await user.selectOptions(categorySelect, 'painting')
      
      expect(setFilter).toHaveBeenCalledWith({ category: 'painting' })
    })

    it('resets infinite scroll when filter changes', async () => {
      const user = userEvent.setup()
      const reset = jest.fn()
      
      mockUseInfiniteScroll.mockReturnValue({
        displayItems: mockArtworks,
        hasMore: true,
        loadingMore: false,
        loadMore: jest.fn(),
        containerRef: { current: null },
        reset
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Test')
      
      expect(reset).toHaveBeenCalled()
    })
  })

  describe('Infinite Scroll', () => {
    it('shows load more button when hasMore is true', () => {
      mockUseInfiniteScroll.mockReturnValue({
        displayItems: mockArtworks,
        hasMore: true,
        loadingMore: false,
        loadMore: jest.fn(),
        containerRef: { current: null },
        reset: jest.fn()
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      expect(screen.getByText('Load More')).toBeInTheDocument()
    })

    it('hides load more button when hasMore is false', () => {
      mockUseInfiniteScroll.mockReturnValue({
        displayItems: mockArtworks,
        hasMore: false,
        loadingMore: false,
        loadMore: jest.fn(),
        containerRef: { current: null },
        reset: jest.fn()
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      expect(screen.queryByText('Load More')).not.toBeInTheDocument()
    })

    it('shows loading state when loading more', () => {
      mockUseInfiniteScroll.mockReturnValue({
        displayItems: mockArtworks,
        hasMore: true,
        loadingMore: true,
        loadMore: jest.fn(),
        containerRef: { current: null },
        reset: jest.fn()
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      expect(screen.getByText('Loading more...')).toBeInTheDocument()
    })

    it('calls loadMore when load more button clicked', async () => {
      const user = userEvent.setup()
      const loadMore = jest.fn()
      
      mockUseInfiniteScroll.mockReturnValue({
        displayItems: mockArtworks,
        hasMore: true,
        loadingMore: false,
        loadMore,
        containerRef: { current: null },
        reset: jest.fn()
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      const loadMoreButton = screen.getByText('Load More')
      await user.click(loadMoreButton)
      
      expect(loadMore).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<OptimizedGallery artworks={mockArtworks} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('provides proper ARIA labels', () => {
      render(<OptimizedGallery artworks={mockArtworks} />)
      
      expect(screen.getByRole('search')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<OptimizedGallery artworks={mockArtworks} />)
      
      // Tab through interactive elements
      await user.tab()
      expect(screen.getByTestId('search-input')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('category-filter')).toHaveFocus()
    })

    it('announces filter changes to screen readers', async () => {
      const user = userEvent.setup()
      render(<OptimizedGallery artworks={mockArtworks} />)
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Test')
      
      // Check for live region announcement
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('uses virtualization for large datasets', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockArtworks[0],
        id: `${i}`,
        slug: `artwork-${i}`,
        title: `Artwork ${i}`
      }))

      mockUseInfiniteScroll.mockReturnValue({
        displayItems: largeDataset.slice(0, 20), // Only show first 20
        hasMore: true,
        loadingMore: false,
        loadMore: jest.fn(),
        containerRef: { current: null },
        reset: jest.fn()
      })

      render(<OptimizedGallery artworks={largeDataset} />)
      
      // Should only render visible items
      const artworkElements = screen.getAllByRole('article')
      expect(artworkElements.length).toBeLessThan(largeDataset.length)
    })

    it('debounces search input', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ delay: null })
      const setFilter = jest.fn()
      
      mockUseGalleryFilter.mockReturnValue({
        filteredItems: mockArtworks,
        setFilter,
        filter: { query: '', category: '', artist: '', year: '', available: null },
        isLoading: false,
        error: null
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Test')
      
      // Should not call immediately
      expect(setFilter).not.toHaveBeenCalled()
      
      // Fast forward debounce timer
      jest.advanceTimersByTime(300)
      
      expect(setFilter).toHaveBeenCalledWith({ query: 'Test' })
      
      jest.useRealTimers()
    })
  })

  describe('Responsive Design', () => {
    it('adjusts grid columns based on screen size', () => {
      const { container } = render(<OptimizedGallery artworks={mockArtworks} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4')
    })

    it('shows mobile-optimized filter on small screens', () => {
      // Mock small screen
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 640px)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      // Mobile filter should be present
      expect(screen.getByTestId('search-filter')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    it('catches and displays errors gracefully', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Force an error
      mockUseGalleryFilter.mockImplementation(() => {
        throw new Error('Gallery filter error')
      })

      render(<OptimizedGallery artworks={mockArtworks} />)
      
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })
})