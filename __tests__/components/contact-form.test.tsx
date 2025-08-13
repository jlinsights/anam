import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ContactForm from '@/components/contact-form'
import { useRouter, useSearchParams } from 'next/navigation'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('ContactForm', () => {
  const mockPush = jest.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      refresh: jest.fn()
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<ContactForm />)
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })

    it('shows artwork inquiry when artwork parameter is present', () => {
      mockSearchParams.set('artwork', 'test-artwork-id')
      ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
      
      render(<ContactForm />)
      
      expect(screen.getByText(/inquiry about artwork/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue(/artwork inquiry: test-artwork-id/i)).toBeInTheDocument()
    })

    it('displays required field indicators', () => {
      render(<ContactForm />)
      
      const requiredFields = ['name', 'email', 'message']
      requiredFields.forEach(field => {
        const label = screen.getByText(new RegExp(field, 'i'))
        expect(label.textContent).toContain('*')
      })
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/message is required/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      })
    })

    it('validates phone number format', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, '123') // Too short
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument()
      })
    })

    it('validates message length', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const messageInput = screen.getByLabelText(/message/i)
      await user.type(messageInput, 'Hi') // Too short
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<ContactForm />)
      
      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '010-1234-5678')
      await user.type(screen.getByLabelText(/subject/i), 'Artwork Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I am interested in purchasing this artwork')
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '010-1234-5678',
            subject: 'Artwork Inquiry',
            message: 'I am interested in purchasing this artwork'
          })
        })
      })
      
      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
      })
    })

    it('handles submission errors', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      render(<ContactForm />)
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'I am interested in purchasing this artwork')
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => { resolvePromise = resolve })
      ;(global.fetch as jest.Mock).mockReturnValueOnce(promise)
      
      render(<ContactForm />)
      
      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'I am interested in purchasing this artwork')
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      // Check loading state
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      // Resolve promise
      resolvePromise!({ ok: true, json: async () => ({ success: true }) })
    })

    it('resets form after successful submission', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<ContactForm />)
      
      // Fill and submit form
      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'I am interested in purchasing this artwork')
      
      await user.click(screen.getByRole('button', { name: /send message/i }))
      
      await waitFor(() => {
        expect(nameInput).toHaveValue('')
      })
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ContactForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper form labels', () => {
      render(<ContactForm />)
      
      const inputs = ['name', 'email', 'phone', 'subject', 'message']
      inputs.forEach(input => {
        const element = screen.getByLabelText(new RegExp(input, 'i'))
        expect(element).toBeInTheDocument()
      })
    })

    it('shows error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      await user.click(screen.getByRole('button', { name: /send message/i }))
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i)
        const errorId = nameInput.getAttribute('aria-describedby')
        expect(errorId).toBeTruthy()
        
        const errorElement = document.getElementById(errorId!)
        expect(errorElement).toHaveTextContent(/name is required/i)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      // Tab through form fields
      await user.tab()
      expect(screen.getByLabelText(/name/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/phone/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/subject/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/message/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /send message/i })).toHaveFocus()
    })

    it('announces form submission status to screen readers', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<ContactForm />)
      
      // Fill and submit
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'I am interested in purchasing this artwork')
      await user.click(screen.getByRole('button', { name: /send message/i }))
      
      await waitFor(() => {
        const status = screen.getByRole('status')
        expect(status).toHaveTextContent(/message sent successfully/i)
      })
    })
  })

  describe('Character Counter', () => {
    it('shows character count for message field', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const messageInput = screen.getByLabelText(/message/i)
      await user.type(messageInput, 'Hello world')
      
      expect(screen.getByText('11 / 1000')).toBeInTheDocument()
    })

    it('warns when approaching character limit', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)
      
      const messageInput = screen.getByLabelText(/message/i)
      const longMessage = 'a'.repeat(950)
      await user.type(messageInput, longMessage)
      
      const counter = screen.getByText(/950 \/ 1000/i)
      expect(counter).toHaveClass('text-warning')
    })
  })

  describe('Privacy Notice', () => {
    it('displays privacy notice', () => {
      render(<ContactForm />)
      
      expect(screen.getByText(/by submitting this form/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
    })

    it('links to privacy policy', () => {
      render(<ContactForm />)
      
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
      expect(privacyLink).toHaveAttribute('href', '/privacy')
      expect(privacyLink).toHaveAttribute('target', '_blank')
      expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})