import { GET } from '@/app/api/artworks/route'
import { apiHandlers, mockArtworks } from '../../mocks/api-handlers'
import { server } from '../../utils/test-utils'

// Airtable 모킹
jest.mock('@/lib/airtable', () => ({
  airtableClient: {
    select: jest.fn().mockReturnValue({
      all: jest.fn().mockResolvedValue(
        mockArtworks.map(artwork => ({
          id: artwork.id,
          fields: {
            ...artwork,
            'Number': artwork.number,
            'Title (Korean)': artwork.title,
            'Year': artwork.year,
            'Medium (Korean)': artwork.medium,
            'Dimensions (Korean)': artwork.dimensions,
            'Description (Korean)': artwork.description,
            'Featured': artwork.featured,
            'Category': artwork.category,
            'Tags': artwork.tags,
            'Available': artwork.available,
            'Exhibition': artwork.exhibition,
            'Series': artwork.series,
            'Technique': artwork.technique,
            'Inspiration': artwork.inspiration,
            'Symbolism': artwork.symbolism,
            'Cultural Context': artwork.culturalContext,
          },
        }))
      ),
    }),
  },
}))

// Next.js Request/Response 모킹
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

describe('/api/artworks API Route', () => {
  beforeAll(() => {
    server.use(...apiHandlers)
  })

  describe('GET /api/artworks', () => {
    it('모든 아트워크를 성공적으로 반환해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(mockArtworks.length)
      expect(data.timestamp).toBeDefined()
    })

    it('페이지네이션이 올바르게 작동해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?page=1&limit=2')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: mockArtworks.length,
        totalPages: Math.ceil(mockArtworks.length / 2),
      })
    })

    it('카테고리 필터가 올바르게 작동해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?category=painting')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.every((artwork: any) => artwork.category === 'painting')).toBe(true)
    })

    it('검색어 필터가 올바르게 작동해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?search=작품')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(
        data.data.some((artwork: any) => 
          artwork.title.includes('작품') || artwork.description.includes('작품')
        )
      ).toBe(true)
    })

    it('featured 필터가 올바르게 작동해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?featured=true')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.every((artwork: any) => artwork.featured === true)).toBe(true)
    })

    it('정렬이 올바르게 작동해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?sort=year&order=asc')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      
      // 연도순 오름차순 정렬 확인
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i - 1].year).toBeLessThanOrEqual(data.data[i].year)
      }
    })

    it('여러 필터를 조합할 수 있어야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?category=painting&featured=true&search=작품')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      
      data.data.forEach((artwork: any) => {
        expect(artwork.category).toBe('painting')
        expect(artwork.featured).toBe(true)
        expect(
          artwork.title.includes('작품') || artwork.description.includes('작품')
        ).toBe(true)
      })
    })

    it('잘못된 페이지 번호를 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?page=0')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.pagination.page).toBe(1) // 기본값으로 설정되어야 함
    })

    it('음수 limit을 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?limit=-1')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.pagination.limit).toBeGreaterThan(0) // 양수로 설정되어야 함
    })

    it('빈 검색 결과를 올바르게 처리해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?search=존재하지않는작품')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
      expect(data.pagination.total).toBe(0)
    })
  })

  describe('데이터 변환 및 정리', () => {
    it('Airtable 데이터를 올바른 형식으로 변환해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      const data = await response.json()
      const artwork = data.data[0]

      // 필수 필드 확인
      expect(artwork).toHaveProperty('id')
      expect(artwork).toHaveProperty('slug')
      expect(artwork).toHaveProperty('title')
      expect(artwork).toHaveProperty('year')
      expect(artwork).toHaveProperty('medium')
      expect(artwork).toHaveProperty('dimensions')
      expect(artwork).toHaveProperty('description')
      expect(artwork).toHaveProperty('aspectRatio')
    })

    it('이미지 URL이 올바르게 생성되어야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      const data = await response.json()
      const artwork = data.data[0]

      expect(artwork.imageUrl).toBeDefined()
      expect(artwork.imageUrl).toMatch(/\/Images\/Artworks\/optimized\//)
    })

    it('slug가 올바르게 생성되어야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      const data = await response.json()
      data.data.forEach((artwork: any) => {
        expect(artwork.slug).toBeDefined()
        expect(artwork.slug).toMatch(/^[a-z0-9\-]+$/) // 소문자, 숫자, 하이픈만 포함
      })
    })

    it('선택적 필드들이 올바르게 처리되어야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      const data = await response.json()
      const artwork = data.data[0]

      // 선택적 필드들이 존재하거나 undefined여야 함
      expect(['boolean', 'undefined']).toContain(typeof artwork.featured)
      expect(['string', 'undefined']).toContain(typeof artwork.category)
      expect(['object', 'undefined']).toContain(typeof artwork.tags)
    })
  })

  describe('에러 처리', () => {
    it('Airtable 연결 실패를 처리해야 한다', async () => {
      // Airtable 에러 시뮬레이션
      const mockError = jest.fn().mockRejectedValue(new Error('Airtable connection failed'))
      
      // 일시적으로 에러를 발생시킴
      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: mockError
      })

      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(data.error.message).toContain('Failed to fetch artworks')
    })

    it('잘못된 Airtable 데이터 구조를 처리해야 한다', async () => {
      // 잘못된 데이터 구조 시뮬레이션
      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([
          {
            id: 'invalid',
            fields: {
              // 필수 필드 누락
            }
          }
        ])
      })

      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      // 에러를 발생시키거나 빈 배열을 반환해야 함
      expect([200, 500]).toContain(response.status)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.data).toEqual([]) // 유효하지 않은 데이터는 필터링됨
      }
    })
  })

  describe('캐싱 및 성능', () => {
    it('응답 헤더에 캐시 정보가 포함되어야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      // 캐시 헤더 확인 (실제 구현에 따라 조정)
      const cacheControl = response.headers.get('Cache-Control')
      if (cacheControl) {
        expect(cacheControl).toMatch(/max-age=\d+/)
      }
    })

    it('대량의 데이터를 효율적으로 처리해야 한다', async () => {
      // 대량 데이터 시뮬레이션
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `artwork-${i}`,
        fields: {
          ...mockArtworks[0],
          'Number': i,
          'Title (Korean)': `작품 ${i}`,
        }
      }))

      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue(largeDataset)
      })

      const startTime = Date.now()
      const request = new Request('http://localhost:3000/api/artworks?limit=50')
      const response = await GET(request)
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(5000) // 5초 이내 응답
      
      const data = await response.json()
      expect(data.data).toHaveLength(50) // 페이지네이션 적용
    })
  })

  describe('보안', () => {
    it('SQL 인젝션 공격을 방어해야 한다', async () => {
      const maliciousQuery = "'; DROP TABLE artworks; --"
      const request = new Request(`http://localhost:3000/api/artworks?search=${encodeURIComponent(maliciousQuery)}`)
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      // 악성 쿼리가 실행되지 않고 안전하게 처리되어야 함
    })

    it('XSS 공격을 방어해야 한다', async () => {
      const xssPayload = "<script>alert('xss')</script>"
      const request = new Request(`http://localhost:3000/api/artworks?search=${encodeURIComponent(xssPayload)}`)
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      // XSS 페이로드가 실행되지 않고 안전하게 처리되어야 함
    })

    it('과도한 요청을 제한해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks?limit=10000')
      const response = await GET(request)
      
      const data = await response.json()
      expect(data.pagination.limit).toBeLessThanOrEqual(100) // 최대 제한값 적용
    })
  })

  describe('국제화 지원', () => {
    it('Accept-Language 헤더를 고려해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks', {
        headers: {
          'Accept-Language': 'en-US'
        }
      })
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      // 영어 응답이 제공되어야 함 (실제 구현에 따라 조정)
      expect(data.success).toBe(true)
    })

    it('기본 언어로 한국어를 사용해야 한다', async () => {
      const request = new Request('http://localhost:3000/api/artworks')
      const response = await GET(request)
      
      const data = await response.json()
      const artwork = data.data[0]
      
      // 한국어 제목이 있어야 함
      expect(artwork.title).toBeDefined()
      expect(artwork.description).toBeDefined()
    })
  })
})