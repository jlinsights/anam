/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/artworks/route'
import { NextRequest } from 'next/server'
import { mockArtworks } from '../lib/hooks/artwork.mock'

// Mock Airtable module
jest.mock('@/lib/airtable', () => ({
  fetchArtworksFromAirtable: jest.fn(),
}))

const mockFetchArtworksFromAirtable =
  require('@/lib/airtable').fetchArtworksFromAirtable

// Mock console methods to avoid cluttering test output
const originalConsole = { ...console }
beforeAll(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

describe('/api/artworks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset module cache to clear any cached artworks
    jest.resetModules()
  })

  describe('GET /api/artworks', () => {
    it('모든 작품을 성공적으로 반환해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest('http://localhost:3000/api/artworks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(mockArtworks.length)
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('특정 slug로 작품을 조회할 수 있어야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest(
        'http://localhost:3000/api/artworks?slug=way-dao'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeTruthy()
      expect(data.data.slug).toBe('way-dao')
      expect(data.data.title).toBe('먹, 그리고...')
    })

    it('존재하지 않는 slug 조회 시 null을 반환해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest(
        'http://localhost:3000/api/artworks?slug=non-existent'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeNull()
    })

    it('Airtable에서 빈 배열을 반환할 때 적절히 처리해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/artworks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.message).toBe('No artworks available')
      expect(data.data).toEqual([])
    })

    it('Airtable 오류 시 적절한 에러 응답을 반환해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockRejectedValue(
        new Error('Airtable connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/artworks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Failed to fetch artworks')
      expect(data.data).toBeNull()
    })

    it('캐시가 작동해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      // 첫 번째 요청
      const request1 = new NextRequest('http://localhost:3000/api/artworks')
      const response1 = await GET(request1)
      const data1 = await response1.json()

      expect(mockFetchArtworksFromAirtable).toHaveBeenCalledTimes(1)
      expect(data1.success).toBe(true)
      expect(data1.data).toHaveLength(mockArtworks.length)

      // 두 번째 요청 (캐시 사용)
      const request2 = new NextRequest('http://localhost:3000/api/artworks')
      const response2 = await GET(request2)
      const data2 = await response2.json()

      // Airtable 호출은 여전히 1번만 이루어져야 함 (캐시 사용)
      expect(mockFetchArtworksFromAirtable).toHaveBeenCalledTimes(1)
      expect(data2.success).toBe(true)
      expect(data2.data).toHaveLength(mockArtworks.length)
    })
  })

  describe('POST /api/artworks', () => {
    it('캐시를 새로고침할 수 있어야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest(
        'http://localhost:3000/api/artworks?action=refresh',
        {
          method: 'POST',
        }
      )
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Cache refreshed successfully')
      expect(data.data.count).toBe(mockArtworks.length)
      expect(typeof data.data.featuredCount).toBe('number')
    })

    it('featured 작품 개수를 올바르게 계산해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest(
        'http://localhost:3000/api/artworks?action=refresh',
        {
          method: 'POST',
        }
      )
      const response = await POST(request)
      const data = await response.json()

      const expectedFeaturedCount = mockArtworks.filter(
        (artwork) => artwork.featured
      ).length
      expect(data.data.featuredCount).toBe(expectedFeaturedCount)
    })

    it('잘못된 action 파라미터 시 에러를 반환해야 한다', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/artworks?action=invalid',
        {
          method: 'POST',
        }
      )
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.message).toBe(
        'Invalid action. Use ?action=refresh to refresh cache'
      )
    })

    it('action 파라미터가 없을 때 에러를 반환해야 한다', async () => {
      const request = new NextRequest('http://localhost:3000/api/artworks', {
        method: 'POST',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.message).toBe(
        'Invalid action. Use ?action=refresh to refresh cache'
      )
    })

    it('캐시 새로고침 중 Airtable 오류 시 적절한 에러 응답을 반환해야 한다', async () => {
      mockFetchArtworksFromAirtable.mockRejectedValue(
        new Error('Airtable connection failed')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/artworks?action=refresh',
        {
          method: 'POST',
        }
      )
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Failed to refresh cache')
      expect(data.error).toBe('Airtable connection failed')
    })
  })

  describe('캐시 동작', () => {
    it('캐시 새로고침 후 새로운 데이터를 반환해야 한다', async () => {
      // 첫 번째 데이터셋
      const firstDataset = mockArtworks.slice(0, 2)
      mockFetchArtworksFromAirtable.mockResolvedValueOnce(firstDataset)

      // 첫 번째 GET 요청
      const getRequest1 = new NextRequest('http://localhost:3000/api/artworks')
      const getResponse1 = await GET(getRequest1)
      const getData1 = await getResponse1.json()

      expect(getData1.data).toHaveLength(2)

      // 두 번째 데이터셋으로 모킹 변경
      const secondDataset = mockArtworks
      mockFetchArtworksFromAirtable.mockResolvedValueOnce(secondDataset)

      // 캐시 새로고침
      const postRequest = new NextRequest(
        'http://localhost:3000/api/artworks?action=refresh',
        {
          method: 'POST',
        }
      )
      await POST(postRequest)

      // 새로고침 후 GET 요청
      const getRequest2 = new NextRequest('http://localhost:3000/api/artworks')
      const getResponse2 = await GET(getRequest2)
      const getData2 = await getResponse2.json()

      expect(getData2.data).toHaveLength(mockArtworks.length)
    })
  })

  describe('데이터 무결성', () => {
    it('반환된 작품 데이터가 올바른 구조를 가져야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest('http://localhost:3000/api/artworks')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)

      data.data.forEach((artwork: any) => {
        expect(artwork).toHaveProperty('id')
        expect(artwork).toHaveProperty('title')
        expect(artwork).toHaveProperty('slug')
        expect(artwork).toHaveProperty('imageUrl')
        expect(artwork).toHaveProperty('year')
        expect(artwork).toHaveProperty('medium')
        expect(artwork).toHaveProperty('dimensions')
        expect(artwork).toHaveProperty('aspectRatio')
        expect(artwork).toHaveProperty('description')
      })
    })

    it('slug로 조회한 작품이 올바른 구조를 가져야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest(
        'http://localhost:3000/api/artworks?slug=way-dao'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toBeTruthy()

      const artwork = data.data
      expect(artwork).toHaveProperty('id')
      expect(artwork).toHaveProperty('title')
      expect(artwork).toHaveProperty('slug')
      expect(artwork.slug).toBe('way-dao')
    })
  })

  describe('응답 형식', () => {
    it('성공 응답이 일관된 형식을 가져야 한다', async () => {
      mockFetchArtworksFromAirtable.mockResolvedValue(mockArtworks)

      const request = new NextRequest('http://localhost:3000/api/artworks')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(typeof data.success).toBe('boolean')
    })

    it('실패 응답이 일관된 형식을 가져야 한다', async () => {
      mockFetchArtworksFromAirtable.mockRejectedValue(new Error('Test error'))

      const request = new NextRequest('http://localhost:3000/api/artworks')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('data')
      expect(data.success).toBe(false)
      expect(typeof data.message).toBe('string')
    })
  })
})
