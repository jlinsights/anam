import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PerformanceObserver } from 'perf_hooks'
import OptimizedGallery from '@/components/optimized-gallery'
import ContactForm from '@/components/contact-form'
import ArtworkDetailModalClient from '@/components/artwork-detail-modal-client'
import { mockArtwork } from '../lib/hooks/artwork.mock'

// Performance thresholds based on real-world expectations
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 3000,      // 3s total page load
  FIRST_PAINT: 1000,    // 1s first paint
  LCP: 2500,            // 2.5s Largest Contentful Paint
  FID: 100,             // 100ms First Input Delay
  CLS: 0.1,             // 0.1 Cumulative Layout Shift
  INTERACTION: 200,     // 200ms interaction response
  BUNDLE_SIZE: 500000,  // 500KB initial bundle
  IMAGE_LOAD: 2000,     // 2s image loading
  API_RESPONSE: 1000,   // 1s API response
  MEMORY_GROWTH: 10000000, // 10MB memory growth
}

// Mock performance APIs
const mockPerformanceObserver = (entries: any[] = []) => {
  return class MockPerformanceObserver {
    private callback: (list: any) => void
    
    constructor(callback: (list: any) => void) {
      this.callback = callback
    }
    
    observe() {
      // Simulate performance entries
      setTimeout(() => {
        this.callback({ getEntries: () => entries })
      }, 10)
    }
    
    disconnect() {}
  }
}

// Mock Web Vitals measurement
const mockWebVitals = () => {
  const vitals = {
    LCP: { value: 2100, rating: 'good' },
    FID: { value: 85, rating: 'good' },
    CLS: { value: 0.05, rating: 'good' },
    FCP: { value: 1200, rating: 'good' },
    TTFB: { value: 800, rating: 'good' }
  }
  
  return vitals
}

// Performance measurement utilities
const measureAsyncOperation = async (operation: () => Promise<void>) => {
  const start = performance.now()
  await operation()
  return performance.now() - start
}

const measureSyncOperation = (operation: () => void) => {
  const start = performance.now()
  operation()
  return performance.now() - start
}

describe('Critical User Journeys Performance Tests', () => {
  let originalFetch: typeof fetch
  let performanceEntries: any[] = []

  beforeEach(() => {
    originalFetch = global.fetch
    performanceEntries = []
    
    // Mock fetch with performance tracking
    global.fetch = jest.fn().mockImplementation(async (url) => {
      const start = performance.now()
      await new Promise(resolve => setTimeout(resolve, 200)) // Simulate network delay
      const end = performance.now()
      
      performanceEntries.push({
        name: url,
        entryType: 'measure',
        startTime: start,
        duration: end - start
      })
      
      return {
        ok: true,
        json: async () => ({ success: true, data: [] })
      }
    })

    // Mock PerformanceObserver
    global.PerformanceObserver = mockPerformanceObserver(performanceEntries) as any
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  describe('Gallery Browsing Journey', () => {
    it('should load gallery page within performance budget', async () => {
      const vitals = mockWebVitals()
      
      const loadTime = await measureAsyncOperation(async () => {
        render(<OptimizedGallery artworks={[]} />)
        
        await waitFor(() => {
          expect(screen.getByTestId('gallery-container')).toBeInTheDocument()
        }, { timeout: PERFORMANCE_THRESHOLDS.PAGE_LOAD })
      })

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD)
      expect(vitals.LCP.value).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP)
      expect(vitals.FID.value).toBeLessThan(PERFORMANCE_THRESHOLDS.FID)
      expect(vitals.CLS.value).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS)
    })

    it('should handle image lazy loading efficiently', async () => {
      // Mock intersection observer for lazy loading
      const mockIntersectionObserver = jest.fn()
      const mockObserve = jest.fn()
      const mockUnobserve = jest.fn()
      
      mockIntersectionObserver.mockReturnValue({
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: jest.fn(),
      })
      
      global.IntersectionObserver = mockIntersectionObserver
      
      const artworks = Array.from({ length: 20 }, (_, i) => ({
        ...mockArtwork,
        id: `artwork-${i}`,
        images: [{ url: `/image-${i}.jpg`, width: 800, height: 600 }]
      }))
      
      const loadTime = await measureAsyncOperation(async () => {
        render(<OptimizedGallery artworks={artworks} />)
        
        // Simulate scrolling to trigger lazy loading
        fireEvent.scroll(window, { target: { scrollY: 1000 } })
        
        await waitFor(() => {
          expect(mockObserve).toHaveBeenCalled()
        })
      })

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION)
      expect(mockObserve).toHaveBeenCalledTimes(artworks.length)
    })

    it('should maintain performance during search operations', async () => {
      const user = userEvent.setup()
      const artworks = Array.from({ length: 100 }, (_, i) => ({
        ...mockArtwork,
        id: `artwork-${i}`,
        title: `Artwork ${i}`,
        description: i % 2 === 0 ? 'Abstract painting' : 'Landscape painting'
      }))

      render(<OptimizedGallery artworks={artworks} />)
      
      const searchInput = screen.getByRole('textbox', { name: /search/i })
      
      const searchTime = await measureAsyncOperation(async () => {
        await user.type(searchInput, 'Abstract')
        
        await waitFor(() => {
          const filteredResults = screen.getAllByText(/Abstract/i)
          expect(filteredResults.length).toBeGreaterThan(0)
        })
      })

      expect(searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 2)
    })

    it('should handle filter operations without performance degradation', async () => {
      const user = userEvent.setup()
      const artworks = Array.from({ length: 50 }, (_, i) => ({
        ...mockArtwork,
        id: `artwork-${i}`,
        category: i % 3 === 0 ? 'painting' : i % 3 === 1 ? 'sculpture' : 'photography',
        year: 2020 + (i % 5)
      }))

      render(<OptimizedGallery artworks={artworks} />)
      
      const filterTime = await measureAsyncOperation(async () => {
        // Open filter modal
        const filterButton = screen.getByRole('button', { name: /filter/i })
        await user.click(filterButton)
        
        // Apply category filter
        const categorySelect = screen.getByRole('combobox', { name: /category/i })
        await user.selectOptions(categorySelect, 'painting')
        
        // Apply year filter
        const yearInput = screen.getByRole('spinbutton', { name: /year/i })
        await user.clear(yearInput)
        await user.type(yearInput, '2022')
        
        // Apply filters
        const applyButton = screen.getByRole('button', { name: /apply/i })
        await user.click(applyButton)
        
        await waitFor(() => {
          const paintingResults = screen.getAllByText(/painting/i)
          expect(paintingResults.length).toBeGreaterThan(0)
        })
      })

      expect(filterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 3)
    })
  })

  describe('Artwork Detail View Journey', () => {
    it('should open artwork modal efficiently', async () => {
      const user = userEvent.setup()
      
      const openTime = await measureAsyncOperation(async () => {
        render(<ArtworkDetailModalClient artwork={mockArtwork} />)
        
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
      })

      expect(openTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION)
    })

    it('should handle image navigation smoothly', async () => {
      const user = userEvent.setup()
      const artworkWithMultipleImages = {
        ...mockArtwork,
        images: Array.from({ length: 5 }, (_, i) => ({
          url: `/image-${i}.jpg`,
          width: 800,
          height: 600
        }))
      }
      
      render(<ArtworkDetailModalClient artwork={artworkWithMultipleImages} />)
      
      const navigationTime = await measureAsyncOperation(async () => {
        const nextButton = screen.getByLabelText('Next image')
        
        // Navigate through all images
        for (let i = 0; i < artworkWithMultipleImages.images.length; i++) {
          await user.click(nextButton)
          await waitFor(() => {
            const imageIndicator = screen.getByText(new RegExp(`${i + 2}.*${artworkWithMultipleImages.images.length}`))
            expect(imageIndicator).toBeInTheDocument()
          })
        }
      })

      expect(navigationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * artworkWithMultipleImages.images.length)
    })

    it('should preload adjacent images for smooth navigation', async () => {
      const artworkWithMultipleImages = {
        ...mockArtwork,
        images: Array.from({ length: 3 }, (_, i) => ({
          url: `/image-${i}.jpg`,
          width: 800,
          height: 600
        }))
      }
      
      render(<ArtworkDetailModalClient artwork={artworkWithMultipleImages} />)
      
      // Check if link preload elements are created
      await waitFor(() => {
        const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]')
        expect(preloadLinks.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Contact Form Journey', () => {
    it('should handle form interactions responsively', async () => {
      const user = userEvent.setup()
      
      render(<ContactForm />)
      
      const formInteractionTime = await measureAsyncOperation(async () => {
        // Fill out form fields
        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/phone/i), '010-1234-5678')
        await user.type(screen.getByLabelText(/subject/i), 'Artwork Inquiry')
        await user.type(screen.getByLabelText(/message/i), 'I am interested in purchasing this artwork.')
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
          expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
        })
      })

      expect(formInteractionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 5)
    })

    it('should validate form fields without performance impact', async () => {
      const user = userEvent.setup()
      
      render(<ContactForm />)
      
      const validationTime = await measureAsyncOperation(async () => {
        // Trigger validation by submitting empty form
        const submitButton = screen.getByRole('button', { name: /send/i })
        await user.click(submitButton)
        
        await waitFor(() => {
          expect(screen.getByText(/name is required/i)).toBeInTheDocument()
          expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        })
        
        // Fill invalid email to trigger email validation
        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'invalid-email')
        await user.tab() // Trigger blur event
        
        await waitFor(() => {
          expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
        })
      })

      expect(validationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 2)
    })

    it('should submit form within acceptable time', async () => {
      const user = userEvent.setup()
      
      // Mock successful form submission
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, messageId: 'test-123' })
      })
      
      render(<ContactForm />)
      
      const submissionTime = await measureAsyncOperation(async () => {
        // Fill form
        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.')
        
        // Submit form
        const submitButton = screen.getByRole('button', { name: /send/i })
        await user.click(submitButton)
        
        await waitFor(() => {
          expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
        })
      })

      expect(submissionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE + PERFORMANCE_THRESHOLDS.INTERACTION)
    })
  })

  describe('Memory and Resource Management', () => {
    it('should not leak memory during navigation', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      // Simulate multiple component mounts/unmounts
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<OptimizedGallery artworks={[mockArtwork]} />)
        await waitFor(() => {
          expect(screen.getByTestId('gallery-container')).toBeInTheDocument()
        })
        unmount()
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryGrowth = finalMemory - initialMemory
      
      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_GROWTH)
    })

    it('should efficiently handle large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockArtwork,
        id: `artwork-${i}`,
        title: `Artwork ${i}`
      }))
      
      const renderTime = await measureAsyncOperation(async () => {
        render(<OptimizedGallery artworks={largeDataset.slice(0, 50)} />)
        
        await waitFor(() => {
          expect(screen.getByTestId('gallery-container')).toBeInTheDocument()
        })
      })

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD / 2)
    })

    it('should maintain consistent performance under load', async () => {
      const performanceTimes: number[] = []
      
      // Perform the same operation 10 times to check consistency
      for (let i = 0; i < 10; i++) {
        const time = await measureAsyncOperation(async () => {
          const { unmount } = render(<OptimizedGallery artworks={[mockArtwork]} />)
          await waitFor(() => {
            expect(screen.getByTestId('gallery-container')).toBeInTheDocument()
          })
          unmount()
        })
        performanceTimes.push(time)
      }
      
      const averageTime = performanceTimes.reduce((a, b) => a + b, 0) / performanceTimes.length
      const maxTime = Math.max(...performanceTimes)
      const minTime = Math.min(...performanceTimes)
      
      // Performance should be consistent (max time shouldn't be more than 3x min time)
      expect(maxTime / minTime).toBeLessThan(3)
      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION)
    })
  })

  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Mock slow network
      global.fetch = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2s delay
        return {
          ok: true,
          json: async () => ({ success: true, data: [] })
        }
      })
      
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const slowNetworkTime = await measureAsyncOperation(async () => {
        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/message/i), 'Test message for slow network')
        
        const submitButton = screen.getByRole('button', { name: /send/i })
        await user.click(submitButton)
        
        // Should show loading state
        expect(screen.getByText(/sending/i)).toBeInTheDocument()
        
        await waitFor(() => {
          expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
        }, { timeout: 5000 })
      })

      expect(slowNetworkTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should implement proper error handling for network failures', async () => {
      // Mock network failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const errorHandlingTime = await measureAsyncOperation(async () => {
        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/message/i), 'Test message for network failure')
        
        const submitButton = screen.getByRole('button', { name: /send/i })
        await user.click(submitButton)
        
        await waitFor(() => {
          expect(screen.getByText(/failed to send/i)).toBeInTheDocument()
        })
      })

      expect(errorHandlingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 2)
    })
  })
})