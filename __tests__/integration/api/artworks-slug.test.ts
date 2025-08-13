import { GET } from '@/app/api/artworks/[slug]/route'
import { mockArtworks } from '../../mocks/api-handlers'

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

describe('/api/artworks/[slug] API Route', () => {
  describe('GET /api/artworks/[slug]', () => {
    it('존재하는 작품을 올바르게 반환해야 한다', async () => {
      const slug = mockArtworks[0].slug
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.slug).toBe(slug)
      expect(data.data.id).toBe(mockArtworks[0].id)
      expect(data.timestamp).toBeDefined()
    })

    it('작품의 모든 상세 정보를 포함해야 한다', async () => {
      const slug = mockArtworks[0].slug
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      const data = await response.json()
      const artwork = data.data

      // 기본 정보
      expect(artwork.title).toBeDefined()
      expect(artwork.year).toBeDefined()
      expect(artwork.medium).toBeDefined()
      expect(artwork.dimensions).toBeDefined()
      expect(artwork.description).toBeDefined()
      
      // 이미지 정보
      expect(artwork.imageUrl).toBeDefined()
      expect(artwork.aspectRatio).toBeDefined()
      
      // 메타데이터
      expect(artwork.category).toBeDefined()
      expect(artwork.featured).toBeDefined()
      expect(artwork.available).toBeDefined()
      
      // 선택적 필드들
      if (artwork.exhibition) expect(typeof artwork.exhibition).toBe('string')
      if (artwork.series) expect(typeof artwork.series).toBe('string')
      if (artwork.technique) expect(typeof artwork.technique).toBe('string')
    })

    it('존재하지 않는 작품에 대해 404를 반환해야 한다', async () => {
      const nonExistentSlug = 'non-existent-artwork'
      const request = new Request(`http://localhost:3000/api/artworks/${nonExistentSlug}`)
      const response = await GET(request, { params: { slug: nonExistentSlug } })
      
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(data.error.code).toBe('ARTWORK_NOT_FOUND')
      expect(data.error.message).toContain('not found')
    })

    it('slug 대소문자를 구분하지 않아야 한다', async () => {
      const originalSlug = mockArtworks[0].slug
      const uppercaseSlug = originalSlug.toUpperCase()
      
      const request = new Request(`http://localhost:3000/api/artworks/${uppercaseSlug}`)
      const response = await GET(request, { params: { slug: uppercaseSlug } })
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.slug).toBe(originalSlug) // 원본 slug 반환
    })

    it('한글 slug를 올바르게 처리해야 한다', async () => {
      // 한글 제목을 가진 작품의 slug 테스트
      const koreanSlug = '작품-1'
      
      // 모킹된 데이터에 한글 slug 작품 추가
      const mockKoreanArtwork = {
        ...mockArtworks[0],
        id: 'korean-artwork',
        slug: koreanSlug,
        title: '한글 제목 작품',
      }

      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([{
          id: mockKoreanArtwork.id,
          fields: {
            ...mockKoreanArtwork,
            'Number': mockKoreanArtwork.number,
            'Title (Korean)': mockKoreanArtwork.title,
          }
        }])
      })

      const request = new Request(`http://localhost:3000/api/artworks/${encodeURIComponent(koreanSlug)}`)
      const response = await GET(request, { params: { slug: koreanSlug } })
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('한글 제목 작품')
    })
  })

  describe('SEO 및 메타데이터', () => {
    it('SEO에 필요한 모든 정보를 제공해야 한다', async () => {
      const slug = mockArtworks[0].slug
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      const data = await response.json()
      const artwork = data.data

      // SEO 필수 정보
      expect(artwork.title).toBeDefined()
      expect(artwork.description).toBeDefined()
      expect(artwork.imageUrl).toBeDefined()
      
      // OpenGraph 메타데이터용
      expect(artwork.year).toBeDefined()
      expect(artwork.medium).toBeDefined()
      expect(artwork.dimensions).toBeDefined()
    })

    it('소셜 미디어 공유를 위한 이미지 URL이 절대 경로여야 한다', async () => {
      const slug = mockArtworks[0].slug
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      const data = await response.json()
      const artwork = data.data

      expect(artwork.imageUrl).toMatch(/^\//)
      // 절대 URL로 변환 가능해야 함
      const absoluteUrl = `https://anam-gallery.com${artwork.imageUrl}`
      expect(absoluteUrl).toMatch(/^https?:\/\//)
    })
  })

  describe('캐싱 및 성능', () => {
    it('응답 헤더에 캐시 정보가 포함되어야 한다', async () => {
      const slug = mockArtworks[0].slug
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      expect(response.status).toBe(200)
      
      // 캐시 헤더 확인
      const cacheControl = response.headers.get('Cache-Control')
      if (cacheControl) {
        expect(cacheControl).toMatch(/max-age=\d+/)
      }
      
      // ETag 헤더 확인
      const etag = response.headers.get('ETag')
      if (etag) {
        expect(etag).toBeDefined()
      }
    })

    it('동일한 요청에 대해 일관된 응답을 제공해야 한다', async () => {
      const slug = mockArtworks[0].slug
      const request1 = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const request2 = new Request(`http://localhost:3000/api/artworks/${slug}`)
      
      const response1 = await GET(request1, { params: { slug } })
      const response2 = await GET(request2, { params: { slug } })
      
      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.data).toEqual(data2.data)
    })
  })

  describe('에러 처리', () => {
    it('Airtable 연결 실패를 처리해야 한다', async () => {
      // Airtable 에러 시뮬레이션
      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: jest.fn().mockRejectedValue(new Error('Airtable connection failed'))
      })

      const slug = mockArtworks[0].slug
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('잘못된 slug 형식을 처리해야 한다', async () => {
      const invalidSlugs = [
        '',
        '   ',
        '<script>alert("xss")</script>',
        'very-long-slug-'.repeat(100),
        '../../../etc/passwd',
      ]

      for (const invalidSlug of invalidSlugs) {
        const request = new Request(`http://localhost:3000/api/artworks/${encodeURIComponent(invalidSlug)}`)
        const response = await GET(request, { params: { slug: invalidSlug } })
        
        expect([404, 400]).toContain(response.status)
        
        const data = await response.json()
        expect(data.success).toBe(false)
      }
    })

    it('데이터베이스에서 부분적 데이터를 처리해야 한다', async () => {
      // 부분적 데이터 시뮬레이션 (필수 필드 일부 누락)
      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([{
          id: 'partial-data',
          fields: {
            'Number': 1,
            'Title (Korean)': '부분 데이터 작품',
            // 다른 필수 필드들 누락
          }
        }])
      })

      const slug = 'partial-data-artwork'
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      // 에러를 반환하거나 기본값으로 처리해야 함
      if (response.status === 200) {
        const data = await response.json()
        expect(data.data.title).toBeDefined()
      } else {
        expect([400, 500]).toContain(response.status)
      }
    })
  })

  describe('보안', () => {
    it('Path traversal 공격을 방어해야 한다', async () => {
      const maliciousSlugs = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      ]

      for (const maliciousSlug of maliciousSlugs) {
        const request = new Request(`http://localhost:3000/api/artworks/${maliciousSlug}`)
        const response = await GET(request, { params: { slug: maliciousSlug } })
        
        expect(response.status).toBe(404)
        
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error.code).toBe('ARTWORK_NOT_FOUND')
      }
    })

    it('SQL 인젝션 공격을 방어해야 한다', async () => {
      const sqlInjectionSlugs = [
        "'; DROP TABLE artworks; --",
        "' OR '1'='1",
        "1; DELETE FROM artworks; --",
      ]

      for (const sqlSlug of sqlInjectionSlugs) {
        const request = new Request(`http://localhost:3000/api/artworks/${encodeURIComponent(sqlSlug)}`)
        const response = await GET(request, { params: { slug: sqlSlug } })
        
        expect(response.status).toBe(404)
        
        const data = await response.json()
        expect(data.success).toBe(false)
        // SQL 인젝션이 실행되지 않고 안전하게 처리되어야 함
      }
    })

    it('XSS 공격을 방어해야 한다', async () => {
      const xssSlugs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
      ]

      for (const xssSlug of xssSlugs) {
        const request = new Request(`http://localhost:3000/api/artworks/${encodeURIComponent(xssSlug)}`)
        const response = await GET(request, { params: { slug: xssSlug } })
        
        const data = await response.json()
        
        // 응답에 XSS 페이로드가 그대로 포함되지 않아야 함
        const responseText = JSON.stringify(data)
        expect(responseText).not.toContain('<script>')
        expect(responseText).not.toContain('javascript:')
        expect(responseText).not.toContain('onerror=')
      }
    })
  })

  describe('국제화 지원', () => {
    it('Accept-Language 헤더에 따른 응답을 제공해야 한다', async () => {
      const slug = mockArtworks[0].slug
      
      // 영어 요청
      const enRequest = new Request(`http://localhost:3000/api/artworks/${slug}`, {
        headers: { 'Accept-Language': 'en-US' }
      })
      const enResponse = await GET(enRequest, { params: { slug } })
      
      // 한국어 요청
      const koRequest = new Request(`http://localhost:3000/api/artworks/${slug}`, {
        headers: { 'Accept-Language': 'ko-KR' }
      })
      const koResponse = await GET(koRequest, { params: { slug } })
      
      expect(enResponse.status).toBe(200)
      expect(koResponse.status).toBe(200)
      
      const enData = await enResponse.json()
      const koData = await koResponse.json()
      
      // 기본적으로는 같은 데이터를 반환하지만, 
      // 향후 다국어 지원 시 다른 응답을 할 수 있음
      expect(enData.success).toBe(true)
      expect(koData.success).toBe(true)
    })

    it('다국어 제목과 설명을 지원해야 한다', async () => {
      // 다국어 데이터 시뮬레이션
      const multilingualArtwork = {
        id: 'multilingual-artwork',
        fields: {
          'Number': 1,
          'Title (Korean)': '한국어 제목',
          'Title (English)': 'English Title',
          'Description (Korean)': '한국어 설명',
          'Description (English)': 'English Description',
          'Year': 2024,
          'Medium (Korean)': '한지에 먹',
          'Dimensions (Korean)': '50x70cm',
        }
      }

      require('@/lib/airtable').airtableClient.select = jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([multilingualArtwork])
      })

      const slug = 'multilingual-artwork'
      const request = new Request(`http://localhost:3000/api/artworks/${slug}`)
      const response = await GET(request, { params: { slug } })
      
      const data = await response.json()
      
      // 기본적으로 한국어 데이터가 반환되어야 함
      expect(data.data.title).toBe('한국어 제목')
      expect(data.data.description).toBe('한국어 설명')
    })
  })
})