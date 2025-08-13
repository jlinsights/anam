import { POST } from '@/app/api/contact/route'
import type { ContactFormData } from '@/lib/types'

// Nodemailer 모킹
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 Message queued',
    }),
  }),
}))

// 환경 변수 모킹
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_USER: 'test@example.com',
    SMTP_PASS: 'test-password',
    CONTACT_EMAIL: 'contact@anam-gallery.com',
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('/api/contact API Route', () => {
  const validContactData: ContactFormData = {
    name: '홍길동',
    email: 'test@example.com',
    subject: '작품 문의',
    message: '안녕하세요. 작품에 대해 문의드립니다.',
    phone: '010-1234-5678',
  }

  describe('POST /api/contact', () => {
    it('유효한 연락처 폼 데이터를 성공적으로 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.message).toContain('successfully')
      expect(data.timestamp).toBeDefined()
    })

    it('이메일이 성공적으로 전송되어야 한다', async () => {
      const mockSendMail = require('nodemailer').createTransport().sendMail

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      await POST(request)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          to: process.env.CONTACT_EMAIL,
          subject: expect.stringContaining(validContactData.subject),
          html: expect.stringContaining(validContactData.name),
        })
      )
    })

    it('HTML 이메일 템플릿이 올바르게 생성되어야 한다', async () => {
      const mockSendMail = require('nodemailer').createTransport().sendMail

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      await POST(request)

      const emailCall = mockSendMail.mock.calls[0][0]
      const htmlContent = emailCall.html

      expect(htmlContent).toContain(validContactData.name)
      expect(htmlContent).toContain(validContactData.email)
      expect(htmlContent).toContain(validContactData.message)
      if (validContactData.phone) {
        expect(htmlContent).toContain(validContactData.phone)
      }
    })
  })

  describe('유효성 검사', () => {
    it('필수 필드가 누락되면 400 에러를 반환해야 한다', async () => {
      const invalidData = {
        name: '홍길동',
        // email 누락
        subject: '문의',
        message: '메시지',
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toContain('required')
    })

    it('잘못된 이메일 형식을 거부해야 한다', async () => {
      const invalidEmailData = {
        ...validContactData,
        email: 'invalid-email',
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidEmailData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toContain('email')
    })

    it('너무 긴 메시지를 거부해야 한다', async () => {
      const longMessageData = {
        ...validContactData,
        message: 'a'.repeat(10001), // 10,000자 초과
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(longMessageData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('too long')
    })

    it('빈 문자열 필드를 거부해야 한다', async () => {
      const emptyFieldData = {
        ...validContactData,
        name: '',
        message: '   ', // 공백만 포함
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emptyFieldData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('선택적 전화번호 필드를 올바르게 처리해야 한다', async () => {
      const noPhoneData = {
        name: '홍길동',
        email: 'test@example.com',
        subject: '문의',
        message: '메시지',
        // phone 필드 누락
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noPhoneData),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('보안', () => {
    it('XSS 공격을 방어해야 한다', async () => {
      const xssData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        subject: '<img src=x onerror=alert("xss")>',
        message: 'javascript:alert("xss")',
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(xssData),
      })

      const response = await POST(request)

      if (response.status === 200) {
        const mockSendMail = require('nodemailer').createTransport().sendMail
        const emailCall = mockSendMail.mock.calls[mockSendMail.mock.calls.length - 1][0]
        const htmlContent = emailCall.html

        // XSS 페이로드가 이스케이프되거나 제거되어야 함
        expect(htmlContent).not.toContain('<script>')
        expect(htmlContent).not.toContain('javascript:')
        expect(htmlContent).not.toContain('onerror=')
      }
    })

    it('이메일 헤더 인젝션을 방어해야 한다', async () => {
      const headerInjectionData = {
        name: 'Test\r\nBcc: attacker@evil.com',
        email: 'test@example.com',
        subject: 'Test\nCc: attacker@evil.com',
        message: '정상적인 메시지',
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerInjectionData),
      })

      const response = await POST(request)

      if (response.status === 200) {
        const mockSendMail = require('nodemailer').createTransport().sendMail
        const emailCall = mockSendMail.mock.calls[mockSendMail.mock.calls.length - 1][0]

        // 이메일 헤더에 인젝션된 내용이 포함되지 않아야 함
        expect(emailCall.subject).not.toContain('\n')
        expect(emailCall.subject).not.toContain('\r')
      }
    })

    it('스팸 방지를 위한 기본적인 체크를 해야 한다', async () => {
      // 의심스러운 키워드가 포함된 메시지
      const spamData = {
        name: 'WINNER',
        email: 'spam@example.com',
        subject: 'CONGRATULATIONS! YOU WON $1,000,000!!!',
        message: 'Click here to claim your prize! viagra cialis cheap discount',
      }

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spamData),
      })

      const response = await POST(request)

      // 스팸으로 판단되면 거부하거나 특별한 처리를 해야 함
      // 구현에 따라 200(정상 처리) 또는 400(거부)를 반환할 수 있음
      expect([200, 400, 429]).toContain(response.status)
    })
  })

  describe('Rate Limiting', () => {
    it('동일한 IP에서 과도한 요청을 제한해야 한다', async () => {
      const requests = Array.from({ length: 10 }, () =>
        new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Forwarded-For': '192.168.1.1', // 동일한 IP
          },
          body: JSON.stringify(validContactData),
        })
      )

      const responses = await Promise.all(
        requests.map(request => POST(request))
      )

      // 일부 요청은 rate limit에 걸려야 함
      const rateLimitedResponses = responses.filter(response => response.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('다른 IP에서의 요청은 독립적으로 처리되어야 한다', async () => {
      const request1 = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1',
        },
        body: JSON.stringify(validContactData),
      })

      const request2 = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.2', // 다른 IP
        },
        body: JSON.stringify(validContactData),
      })

      const response1 = await POST(request1)
      const response2 = await POST(request2)

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    })
  })

  describe('이메일 전송 실패 처리', () => {
    it('SMTP 서버 연결 실패를 처리해야 한다', async () => {
      // SMTP 에러 시뮬레이션
      require('nodemailer').createTransport().sendMail
        .mockRejectedValueOnce(new Error('SMTP connection failed'))

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('EMAIL_SEND_FAILED')
    })

    it('환경 변수 누락을 처리해야 한다', async () => {
      // 환경 변수 임시 제거
      const originalSmtpHost = process.env.SMTP_HOST
      delete process.env.SMTP_HOST

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('configuration')

      // 환경 변수 복원
      process.env.SMTP_HOST = originalSmtpHost
    })
  })

  describe('자동 응답', () => {
    it('발신자에게 자동 응답 이메일을 보내야 한다', async () => {
      const mockSendMail = require('nodemailer').createTransport().sendMail

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      await POST(request)

      // 두 번의 이메일 전송이 있어야 함 (관리자용 + 자동응답용)
      expect(mockSendMail).toHaveBeenCalledTimes(2)

      // 자동 응답 이메일 확인
      const autoReplyCall = mockSendMail.mock.calls[1][0]
      expect(autoReplyCall.to).toBe(validContactData.email)
      expect(autoReplyCall.subject).toContain('문의')
      expect(autoReplyCall.html).toContain(validContactData.name)
    })

    it('자동 응답 이메일이 한국어로 작성되어야 한다', async () => {
      const mockSendMail = require('nodemailer').createTransport().sendMail

      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validContactData),
      })

      await POST(request)

      const autoReplyCall = mockSendMail.mock.calls[1][0]
      const htmlContent = autoReplyCall.html

      expect(htmlContent).toContain('감사합니다')
      expect(htmlContent).toContain('문의')
      expect(htmlContent).toContain('ANAM Gallery')
    })
  })

  describe('Content-Type 처리', () => {
    it('잘못된 Content-Type을 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(validContactData),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Content-Type')
    })

    it('빈 요청 본문을 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_JSON')
    })

    it('잘못된 JSON 형식을 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_JSON')
    })
  })
})