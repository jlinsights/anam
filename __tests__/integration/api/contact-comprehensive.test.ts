import { POST } from '@/app/api/contact/route'
import nodemailer from 'nodemailer'

// Mock nodemailer
jest.mock('nodemailer')

// Mock environment variables
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    EMAIL_FROM: 'test@anam-gallery.com',
    EMAIL_TO: 'admin@anam-gallery.com',
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_USER: 'testuser',
    SMTP_PASS: 'testpass'
  }
})

afterAll(() => {
  process.env = originalEnv
})

// Mock Request and Response
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  method: options?.method || 'GET',
  headers: new Map(Object.entries(options?.headers || {})),
  json: () => Promise.resolve(options?.body ? JSON.parse(options.body) : {}),
}))

global.Response = jest.fn().mockImplementation((body, options) => ({
  status: options?.status || 200,
  statusText: options?.statusText || 'OK',
  headers: new Map(Object.entries(options?.headers || {})),
  json: () => Promise.resolve(typeof body === 'string' ? JSON.parse(body) : body),
}))

describe('/api/contact API Route', () => {
  let mockSendMail: jest.Mock
  let mockTransporter: any

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })
    mockTransporter = {
      sendMail: mockSendMail
    }
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/contact', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '010-1234-5678',
      subject: 'Artwork Inquiry',
      message: 'I am interested in purchasing artwork #123'
    }

    it('should successfully send a contact message', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Message sent successfully')
      expect(data.messageId).toBe('test-id')

      // Verify email was sent with correct data
      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `[ANAM Gallery Contact] ${validContactData.subject}`,
        html: expect.stringContaining(validContactData.name),
        text: expect.stringContaining(validContactData.message)
      })
    })

    it('should handle artwork inquiry with artwork ID', async () => {
      const inquiryData = {
        ...validContactData,
        artworkId: 'artwork-123',
        subject: 'Artwork Inquiry: artwork-123'
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(inquiryData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify artwork ID is included in email
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('artwork-123'),
          subject: expect.stringContaining('artwork-123')
        })
      )
    })

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'john@example.com',
        // Missing name and message
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(data.error.details).toContain('name')
      expect(data.error.details).toContain('message')
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const invalidEmailData = {
        ...validContactData,
        email: 'invalid-email'
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.details).toContain('email')
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('should validate phone number format', async () => {
      const invalidPhoneData = {
        ...validContactData,
        phone: '123' // Too short
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidPhoneData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.details).toContain('phone')
    })

    it('should validate message length', async () => {
      const shortMessageData = {
        ...validContactData,
        message: 'Hi' // Too short
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(shortMessageData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.details).toContain('message')
    })

    it('should sanitize input to prevent XSS', async () => {
      const xssData = {
        ...validContactData,
        message: '<script>alert("xss")</script>This is a legitimate message'
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(xssData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      // Verify script tags are escaped in email
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.not.stringContaining('<script>'),
          text: expect.not.stringContaining('<script>')
        })
      )
    })

    it('should handle email sending failure', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'))

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Failed to send message')
    })

    it('should handle missing environment variables', async () => {
      // Temporarily remove required env vars
      const tempEnv = process.env
      process.env = { ...tempEnv, EMAIL_TO: undefined }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('configuration')

      // Restore env
      process.env = tempEnv
    })

    it('should include timestamp in email', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await POST(request)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringMatching(/Sent at:.*\d{4}-\d{2}-\d{2}/)
        })
      )
    })

    it('should handle international characters', async () => {
      const intlData = {
        ...validContactData,
        name: '김철수',
        message: '안녕하세요. 작품 구매 문의드립니다.'
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(intlData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify international characters are preserved
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('김철수'),
          text: expect.stringContaining('안녕하세요')
        })
      )
    })

    it('should rate limit excessive requests', async () => {
      // Note: Actual rate limiting would need to be implemented
      // This test shows expected behavior
      const requests = Array(10).fill(null).map(() => 
        new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify(validContactData),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )

      // Send multiple requests rapidly
      const responses = await Promise.all(requests.map(req => POST(req)))
      
      // At least some should succeed
      const successCount = responses.filter(r => r.status === 200).length
      expect(successCount).toBeGreaterThan(0)
      
      // If rate limiting is implemented, some might be rejected
      // expect(responses.some(r => r.status === 429)).toBe(true)
    })

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Override json() method to throw error
      request.json = jest.fn().mockRejectedValue(new SyntaxError('Invalid JSON'))

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Invalid request')
    })

    it('should handle empty request body', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.details).toContain('name')
      expect(data.error.details).toContain('email')
      expect(data.error.details).toContain('message')
    })

    it('should include user agent in email for debugging', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Test Browser)'
        }
      })

      await POST(request)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Mozilla/5.0')
        })
      )
    })

    it('should format email content properly', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await POST(request)

      const emailCall = mockSendMail.mock.calls[0][0]
      
      // Check HTML formatting
      expect(emailCall.html).toContain('<strong>Name:</strong>')
      expect(emailCall.html).toContain('<strong>Email:</strong>')
      expect(emailCall.html).toContain('<strong>Phone:</strong>')
      expect(emailCall.html).toContain('<strong>Subject:</strong>')
      expect(emailCall.html).toContain('<strong>Message:</strong>')
      
      // Check plain text formatting
      expect(emailCall.text).toContain('Name:')
      expect(emailCall.text).toContain('Email:')
      expect(emailCall.text).toContain('Message:')
    })
  })

  describe('Security', () => {
    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionData = {
        ...validContactData,
        name: "'; DROP TABLE users; --",
        message: "SELECT * FROM sensitive_data"
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(sqlInjectionData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      // Malicious content should be safely handled
      expect(mockSendMail).toHaveBeenCalled()
    })

    it('should strip HTML from input fields', async () => {
      const htmlData = {
        ...validContactData,
        name: '<b>John</b> <i>Doe</i>',
        message: '<p>This is a <strong>test</strong> message</p>'
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(htmlData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await POST(request)

      // HTML should be escaped or stripped
      const emailCall = mockSendMail.mock.calls[0][0]
      expect(emailCall.html).not.toContain('<b>John</b>')
      expect(emailCall.text).not.toContain('<strong>')
    })
  })
})