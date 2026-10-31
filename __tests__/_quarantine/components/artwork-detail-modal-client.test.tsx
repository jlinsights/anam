import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ArtworkDetailModalClient from '@/components/artwork-detail-modal-client'
import { useRouter } from 'next/navigation'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock data
const mockArtwork = {
  id: 'test-artwork-1',
  artist: 'Test Artist',
  title: 'Test Artwork',
  medium: 'Oil on Canvas',
  size: '100x100cm',
  year: '2024',
  price: '₩1,000,000',
  description: 'Test artwork description',
  images: [
    { url: '/test-image-1.jpg', width: 800, height: 600 },
    { url: '/test-image-2.jpg', width: 800, height: 600 }
  ],
  available: true,
  category: 'painting',
  tags: ['contemporary', 'abstract']
}

// Mock router
jest.mock('next/navigation')
const mockPush = jest.fn()
const mockBack = jest.fn()

beforeEach(() => {
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    back: mockBack,
    prefetch: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  })
})

describe('ArtworkDetailModalClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders artwork details correctly', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      expect(screen.getByText(mockArtwork.title)).toBeInTheDocument()
      expect(screen.getByText(mockArtwork.artist)).toBeInTheDocument()
      expect(screen.getByText(mockArtwork.medium)).toBeInTheDocument()
      expect(screen.getByText(mockArtwork.size)).toBeInTheDocument()
      expect(screen.getByText(mockArtwork.year)).toBeInTheDocument()
      expect(screen.getByText(mockArtwork.price)).toBeInTheDocument()
      expect(screen.getByText(mockArtwork.description)).toBeInTheDocument()
    })

    it('renders multiple images with navigation controls', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(mockArtwork.images.length)
      
      // Check for navigation buttons when multiple images
      expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
      expect(screen.getByLabelText('Next image')).toBeInTheDocument()
    })

    it('renders availability status correctly', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      expect(screen.getByText('Available')).toBeInTheDocument()

      const unavailableArtwork = { ...mockArtwork, available: false }
      render(<ArtworkDetailModalClient artwork={unavailableArtwork} />)
      expect(screen.getByText('Sold')).toBeInTheDocument()
    })

    it('renders tags correctly', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      mockArtwork.tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })
  })

  describe('Interactions', () => {
    it('navigates between images', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const nextButton = screen.getByLabelText('Next image')
      const prevButton = screen.getByLabelText('Previous image')
      
      // Navigate to next image
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument()
      })
      
      // Navigate to previous image
      await user.click(prevButton)
      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument()
      })
    })

    it('closes modal on close button click', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const closeButton = screen.getByLabelText('Close')
      await user.click(closeButton)
      
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('closes modal on escape key press', async () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('closes modal on backdrop click', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const backdrop = screen.getByTestId('modal-backdrop')
      await user.click(backdrop)
      
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('handles contact button click', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const contactButton = screen.getByText('Contact for Purchase')
      await user.click(contactButton)
      
      expect(mockPush).toHaveBeenCalledWith('/contact?artwork=' + mockArtwork.id)
    })

    it('handles social share buttons', async () => {
      const user = userEvent.setup()
      global.open = jest.fn()
      
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const shareButton = screen.getByLabelText('Share on Facebook')
      await user.click(shareButton)
      
      expect(global.open).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      // Tab through interactive elements
      await user.tab()
      expect(screen.getByLabelText('Close')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText('Previous image')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText('Next image')).toHaveFocus()
    })

    it('has proper ARIA labels and roles', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Artwork details')
      expect(screen.getByRole('img')).toHaveAttribute('alt', expect.stringContaining(mockArtwork.title))
    })

    it('manages focus correctly', async () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      // Focus should be trapped within modal
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      
      // First focusable element should receive focus
      await waitFor(() => {
        expect(screen.getByLabelText('Close')).toHaveFocus()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing images gracefully', () => {
      const artworkWithoutImages = { ...mockArtwork, images: [] }
      render(<ArtworkDetailModalClient artwork={artworkWithoutImages} />)
      
      expect(screen.getByText('No image available')).toBeInTheDocument()
    })

    it('handles image loading errors', async () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const image = screen.getAllByRole('img')[0]
      fireEvent.error(image)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument()
      })
    })

    it('handles missing artwork data gracefully', () => {
      const incompleteArtwork = {
        id: 'test-1',
        title: 'Test',
        artist: 'Artist',
        images: []
      }
      
      render(<ArtworkDetailModalClient artwork={incompleteArtwork as any} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.getByText('Artist')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('lazy loads images', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy')
      })
    })

    it('preloads next image in sequence', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      // Click next to trigger preload
      const nextButton = screen.getByLabelText('Next image')
      await user.click(nextButton)
      
      // Check if preload link is created
      const preloadLinks = document.querySelectorAll('link[rel="preload"]')
      expect(preloadLinks.length).toBeGreaterThan(0)
    })
  })
})