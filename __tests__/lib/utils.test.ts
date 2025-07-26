import { cn } from '@/lib/utils'
import { validateEmail, validateSlug, sanitizeInput } from '@/lib/security'
import {
  generateImageUrl,
  getImageSizes,
  generateAltText,
} from '@/lib/image-utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('클래스네임들을 올바르게 병합한다', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('중복된 클래스를 올바르게 처리한다', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('조건부 클래스를 올바르게 처리한다', () => {
      expect(cn('base', true && 'active', false && 'inactive')).toBe(
        'base active'
      )
    })
  })
})

describe('Security Utils', () => {
  describe('validateEmail', () => {
    it('유효한 이메일을 올바르게 검증한다', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.kr')).toBe(true)
    })

    it('유효하지 않은 이메일을 거부한다', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('너무 긴 이메일을 거부한다', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(validateEmail(longEmail)).toBe(false)
    })
  })

  describe('validateSlug', () => {
    it('유효한 슬러그를 올바르게 검증한다', () => {
      expect(validateSlug('valid-slug')).toBe(true)
      expect(validateSlug('slug123')).toBe(true)
      expect(validateSlug('simple')).toBe(true)
    })

    it('유효하지 않은 슬러그를 거부한다', () => {
      expect(validateSlug('Invalid Slug')).toBe(false) // 공백
      expect(validateSlug('invalid_slug')).toBe(false) // 언더스코어
      expect(validateSlug('UPPERCASE')).toBe(false) // 대문자
      expect(validateSlug('한글슬러그')).toBe(false) // 한글
    })
  })

  describe('sanitizeInput', () => {
    it('위험한 HTML 태그를 제거한다', () => {
      expect(sanitizeInput('<script>alert("hack")</script>')).toBe(
        'alert("hack")'
      )
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello World')
    })

    it('앞뒤 공백을 제거한다', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world')
    })

    it('너무 긴 입력을 제한한다', () => {
      const longInput = 'a'.repeat(1500)
      const result = sanitizeInput(longInput)
      expect(result.length).toBe(1000)
    })
  })
})

describe('Image Utils', () => {
  describe('generateImageUrl', () => {
    it('외부 URL은 그대로 반환한다', () => {
      const externalUrl = 'https://example.com/image.jpg'
      expect(generateImageUrl(externalUrl)).toBe(externalUrl)
    })

    it('개발 환경에서 placeholder는 그대로 반환한다', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const placeholderUrl = '/placeholder.svg?width=100'
      expect(generateImageUrl(placeholderUrl)).toBe(placeholderUrl)

      process.env.NODE_ENV = originalEnv
    })

    it('이미지 최적화 파라미터를 올바르게 추가한다', () => {
      const result = generateImageUrl('/image.jpg', 800, 600, 80)
      expect(result).toContain('w=800')
      expect(result).toContain('h=600')
      expect(result).toContain('q=80')
    })
  })

  describe('getImageSizes', () => {
    it('작품 이미지 사이즈를 올바르게 반환한다', () => {
      const sizes = getImageSizes('artwork')
      expect(sizes).toBe(
        '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      )
    })

    it('프로필 이미지 사이즈를 올바르게 반환한다', () => {
      const sizes = getImageSizes('profile')
      expect(sizes).toBe('(max-width: 768px) 100vw, 300px')
    })
  })

  describe('generateAltText', () => {
    it('작품 alt 텍스트를 올바르게 생성한다', () => {
      const altText = generateAltText('고요한 메아리', 'artwork')
      expect(altText).toBe('서예 작품: 고요한 메아리')
    })

    it('프로필 alt 텍스트를 올바르게 생성한다', () => {
      const altText = generateAltText('작가명', 'profile')
      expect(altText).toBe('작가 프로필 사진: 작가명')
    })
  })
})
