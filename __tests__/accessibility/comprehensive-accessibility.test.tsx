import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ArtworkDetailModalClient from '@/components/artwork-detail-modal-client'
import ContactForm from '@/components/contact-form'
import LanguageSwitcher from '@/components/language-switcher'
import Navigation from '@/components/single-page/Navigation'
import ThemeToggle from '@/components/theme-toggle'
import SocialShare from '@/components/social-share'
import { mockArtwork } from '../lib/hooks/artwork.mock'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn()
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams())
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ko'
}))

describe('Comprehensive Accessibility Tests', () => {
  describe('ArtworkDetailModal Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should manage focus correctly in modal', async () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      // Modal should be in the document
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      
      // First focusable element should have focus (close button)
      const closeButton = screen.getByLabelText('Close')
      expect(closeButton).toHaveFocus()
    })

    it('should trap focus within modal', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const modal = screen.getByRole('dialog')
      const focusableElements = within(modal).getAllByRole('button')
      
      // Tab through all focusable elements
      for (let i = 0; i < focusableElements.length * 2; i++) {
        await user.tab()
      }
      
      // Focus should still be within modal
      expect(modal.contains(document.activeElement)).toBe(true)
    })

    it('should provide proper ARIA labels for image navigation', () => {
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const prevButton = screen.getByLabelText('Previous image')
      const nextButton = screen.getByLabelText('Next image')
      
      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })

    it('should announce image changes to screen readers', async () => {
      const user = userEvent.setup()
      render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const nextButton = screen.getByLabelText('Next image')
      await user.click(nextButton)
      
      // Check for live region announcement
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
      expect(liveRegion).toHaveTextContent(/2.*2/i) // "2 of 2" or similar
    })

    it('should have proper heading hierarchy', () => {
      const { container } = render(<ArtworkDetailModalClient artwork={mockArtwork} />)
      
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)))
      
      // Verify no heading levels are skipped
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i-1]).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('ContactForm Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ContactForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper form labels', () => {
      render(<ContactForm />)
      
      // All form inputs should have associated labels
      const inputs = ['Name', 'Email', 'Phone', 'Subject', 'Message']
      inputs.forEach(label => {
        const input = screen.getByLabelText(new RegExp(label, 'i'))
        expect(input).toBeInTheDocument()
      })
    })

    it('should indicate required fields', () => {
      render(<ContactForm />)
      
      const requiredInputs = ['Name', 'Email', 'Message']
      requiredInputs.forEach(label => {
        const input = screen.getByLabelText(new RegExp(label, 'i'))
        expect(input).toHaveAttribute('required')
        expect(input).toHaveAttribute('aria-required', 'true')
      })
    })

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      // Submit empty form to trigger errors
      const submitButton = screen.getByRole('button', { name: /send/i })
      await user.click(submitButton)
      
      // Check that inputs have aria-describedby pointing to error messages
      const nameInput = screen.getByLabelText(/name/i)
      const errorId = nameInput.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      
      const errorMessage = document.getElementById(errorId!)
      expect(errorMessage).toHaveTextContent(/required/i)
    })

    it('should announce form submission status', async () => {
      const user = userEvent.setup()
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<ContactForm />)
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send/i }))
      
      // Check for status announcement
      const status = await screen.findByRole('status')
      expect(status).toHaveTextContent(/success/i)
    })

    it('should support keyboard navigation through form', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      // Tab through form fields
      await user.tab() // Name
      expect(screen.getByLabelText(/name/i)).toHaveFocus()
      
      await user.tab() // Email
      expect(screen.getByLabelText(/email/i)).toHaveFocus()
      
      await user.tab() // Phone
      expect(screen.getByLabelText(/phone/i)).toHaveFocus()
      
      await user.tab() // Subject
      expect(screen.getByLabelText(/subject/i)).toHaveFocus()
      
      await user.tab() // Message
      expect(screen.getByLabelText(/message/i)).toHaveFocus()
      
      await user.tab() // Submit button
      expect(screen.getByRole('button', { name: /send/i })).toHaveFocus()
    })
  })

  describe('Navigation Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Navigation />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should use semantic navigation element', () => {
      render(<Navigation />)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should have accessible menu structure', () => {
      render(<Navigation />)
      
      // Check for menu list
      const menuList = screen.getByRole('list')
      expect(menuList).toBeInTheDocument()
      
      // Check for menu items
      const menuItems = screen.getAllByRole('listitem')
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Get all navigation links
      const links = screen.getAllByRole('link')
      
      // Tab through links
      for (const link of links) {
        await user.tab()
        expect(link).toHaveFocus()
      }
    })

    it('should indicate current page', () => {
      render(<Navigation />)
      
      // Look for aria-current attribute on active link
      const links = screen.getAllByRole('link')
      const currentLink = links.find(link => 
        link.getAttribute('aria-current') === 'page'
      )
      
      expect(currentLink).toBeDefined()
    })
  })

  describe('LanguageSwitcher Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<LanguageSwitcher />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have accessible dropdown', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)
      
      const button = screen.getByRole('button', { name: /language/i })
      expect(button).toBeInTheDocument()
      
      // Open dropdown
      await user.click(button)
      
      // Check for menu
      const menu = screen.getByRole('menu')
      expect(menu).toBeInTheDocument()
      
      // Check for menu items
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation in dropdown', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)
      
      const button = screen.getByRole('button', { name: /language/i })
      await user.click(button)
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}')
      const firstMenuItem = screen.getAllByRole('menuitem')[0]
      expect(firstMenuItem).toHaveFocus()
      
      await user.keyboard('{ArrowDown}')
      const secondMenuItem = screen.getAllByRole('menuitem')[1]
      expect(secondMenuItem).toHaveFocus()
    })

    it('should announce language changes', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)
      
      const button = screen.getByRole('button', { name: /language/i })
      await user.click(button)
      
      const englishOption = screen.getByRole('menuitem', { name: /english/i })
      await user.click(englishOption)
      
      // Check for announcement
      const announcement = screen.getByRole('status')
      expect(announcement).toBeInTheDocument()
    })
  })

  describe('ThemeToggle Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ThemeToggle />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have accessible button with proper label', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button', { name: /theme/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAccessibleName()
    })

    it('should announce theme changes', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button', { name: /theme/i })
      await user.click(button)
      
      // Check for live region announcement
      const announcement = screen.getByRole('status')
      expect(announcement).toBeInTheDocument()
      expect(announcement).toHaveTextContent(/theme/i)
    })

    it('should indicate current theme state', () => {
      render(<ThemeToggle />)
      
      const button = screen.getByRole('button', { name: /theme/i })
      
      // Check for aria-pressed or similar state indicator
      const ariaPressed = button.getAttribute('aria-pressed')
      if (ariaPressed) {
        expect(['true', 'false']).toContain(ariaPressed)
      }
    })
  })

  describe('SocialShare Accessibility', () => {
    const mockShareData = {
      title: 'Test Artwork',
      description: 'Test Description',
      url: 'https://example.com/artwork/test'
    }

    it('should have no accessibility violations', async () => {
      const { container } = render(<SocialShare {...mockShareData} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have accessible share buttons', () => {
      render(<SocialShare {...mockShareData} />)
      
      // Check for share buttons with proper labels
      const facebookButton = screen.getByLabelText(/share.*facebook/i)
      const twitterButton = screen.getByLabelText(/share.*twitter/i)
      const linkedinButton = screen.getByLabelText(/share.*linkedin/i)
      
      expect(facebookButton).toBeInTheDocument()
      expect(twitterButton).toBeInTheDocument()
      expect(linkedinButton).toBeInTheDocument()
    })

    it('should open links in new window with proper attributes', () => {
      render(<SocialShare {...mockShareData} />)
      
      const shareLinks = screen.getAllByRole('link')
      shareLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      })
    })

    it('should support native share API when available', async () => {
      // Mock native share API
      const mockShare = jest.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true
      })
      
      const user = userEvent.setup()
      render(<SocialShare {...mockShareData} />)
      
      const shareButton = screen.getByLabelText(/share/i)
      await user.click(shareButton)
      
      expect(mockShare).toHaveBeenCalledWith({
        title: mockShareData.title,
        text: mockShareData.description,
        url: mockShareData.url
      })
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should use sufficient color contrast for text', () => {
      const { container } = render(
        <div>
          <ContactForm />
          <Navigation />
        </div>
      )
      
      // Check for color contrast classes
      const textElements = container.querySelectorAll('[class*="text-"]')
      textElements.forEach(element => {
        const classes = element.className
        
        // Ensure dark text on light backgrounds and vice versa
        if (classes.includes('bg-white') || classes.includes('bg-gray-50')) {
          expect(classes).toMatch(/text-(gray-[789]00|black)/)
        }
        if (classes.includes('bg-gray-900') || classes.includes('bg-black')) {
          expect(classes).toMatch(/text-(white|gray-[1-3]00)/)
        }
      })
    })

    it('should provide focus indicators', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const firstLink = screen.getAllByRole('link')[0]
      await user.tab()
      
      expect(firstLink).toHaveFocus()
      // Check for focus styling classes
      expect(firstLink.className).toMatch(/focus:|ring-|outline-/)
    })
  })

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile viewports', () => {
      // Mock mobile viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 640px)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
      
      render(<Navigation />)
      
      // Mobile menu button should be present and accessible
      const menuButton = screen.getByRole('button', { name: /menu/i })
      expect(menuButton).toBeInTheDocument()
      expect(menuButton).toHaveAccessibleName()
    })

    it('should have touch-friendly targets', () => {
      const { container } = render(<ContactForm />)
      
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        // Check for minimum size classes (44x44px equivalent)
        const classes = button.className
        expect(classes).toMatch(/p-[2-9]|py-[2-9]|h-1[0-9]|min-h-/)
      })
    })
  })
})