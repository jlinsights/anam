import { http, HttpResponse } from 'msw'
import type { Artwork, Artist } from '@/lib/types'

// Mock 데이터
export const mockArtworks: Artwork[] = [
  {
    id: '1',
    slug: 'artwork-1',
    title: '작품 1',
    year: 2024,
    medium: '캔버스에 아크릴',
    dimensions: '100x80cm',
    aspectRatio: '5/4',
    description: '테스트 작품 설명입니다.',
    imageUrl: '/Images/Artworks/optimized/01/01-medium.jpg',
    imageId: '01',
    number: 1,
    featured: true,
    category: 'painting',
    tags: ['abstract', 'contemporary'],
    available: true,
    exhibition: '2024 개인전',
    series: '추상 시리즈',
    technique: '아크릴 페인팅',
    inspiration: '자연의 색채',
    symbolism: '생명력과 에너지',
    culturalContext: '한국 현대미술',
  },
  {
    id: '2',
    slug: 'artwork-2',
    title: '작품 2',
    year: 2023,
    medium: '종이에 수채',
    dimensions: '50x70cm',
    aspectRatio: '5/7',
    description: '두 번째 테스트 작품입니다.',
    imageUrl: '/Images/Artworks/optimized/02/02-medium.jpg',
    imageId: '02',
    number: 2,
    featured: false,
    category: 'watercolor',
    tags: ['landscape', 'nature'],
    available: true,
    exhibition: '2023 그룹전',
    series: '풍경 시리즈',
    technique: '수채화',
    inspiration: '한국의 산하',
    symbolism: '평온과 고요',
    culturalContext: '전통과 현대의 만남',
  },
  {
    id: '3',
    slug: 'artwork-3',
    title: '작품 3',
    year: 2024,
    medium: '혼합재료',
    dimensions: '120x90cm',
    aspectRatio: '4/3',
    description: '세 번째 테스트 작품입니다.',
    imageUrl: '/Images/Artworks/optimized/03/03-medium.jpg',
    imageId: '03',
    number: 3,
    featured: true,
    category: 'mixed-media',
    tags: ['experimental', 'modern'],
    available: false,
    exhibition: '2024 신작전',
    series: '실험 시리즈',
    technique: '혼합재료',
    inspiration: '도시의 리듬',
    symbolism: '변화와 발전',
    culturalContext: '글로벌 아트',
  },
]

export const mockArtist: Artist = {
  id: '1',
  name: '배옥영',
  bio: '한국의 현대 화가로, 추상과 구상을 아우르는 독특한 화풍으로 주목받고 있습니다.',
  statement: '저의 작품은 인간의 내면과 자연의 조화를 표현합니다.',
  profileImageUrl: '/Images/Artist/artist.png',
  birthYear: 1970,
  education: [
    '서울대학교 미술대학 서양화과 졸업',
    '파리 국립고등미술학교 수료',
  ],
  exhibitions: [
    '2024 개인전 - 갤러리 현대',
    '2023 그룹전 - 국립현대미술관',
    '2022 개인전 - 아람미술관',
  ],
  awards: [
    '2024 대한민국미술대전 대상',
    '2023 김세중청년조각상',
    '2022 이중섭미술상',
  ],
  collections: [
    '국립현대미술관',
    '서울시립미술관',
    '부산시립미술관',
  ],
  website: 'https://anam-gallery.com',
  email: 'artist@anam-gallery.com',
  phone: '+82-10-1234-5678',
  socialLinks: {
    instagram: '@anam_artist',
    facebook: 'anam.artist',
    website: 'https://anam-gallery.com',
  },
  birthPlace: '서울, 대한민국',
  currentLocation: '서울, 대한민국',
  specialties: ['추상화', '풍경화', '혼합재료'],
  influences: ['피카소', '폴 세잔', '이중섭'],
  teachingExperience: [
    '서울대학교 미술대학 겸임교수 (2020-현재)',
    '홍익대학교 미술대학 강사 (2018-2020)',
  ],
  publications: [
    '현대미술과 추상표현 (2023)',
    '색채의 언어 (2021)',
  ],
  memberships: [
    '한국미술협회',
    '서양화가협회',
    '현대미술가협회',
  ],
  philosophy: '예술은 인간의 영혼을 치유하고 사회를 아름답게 만드는 힘이 있습니다.',
  techniques: ['아크릴 페인팅', '수채화', '혼합재료', '콜라주'],
  materials: ['캔버스', '종이', '나무', '금속', '자연재료'],
}

// API 핸들러들
export const apiHandlers = [
  // 아트워크 목록 API
  http.get('/api/artworks', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const featured = url.searchParams.get('featured')
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 12
    
    let filteredArtworks = [...mockArtworks]
    
    // 필터링
    if (category && category !== 'all') {
      filteredArtworks = filteredArtworks.filter(
        artwork => artwork.category === category
      )
    }
    
    if (search) {
      filteredArtworks = filteredArtworks.filter(
        artwork =>
          artwork.title.toLowerCase().includes(search.toLowerCase()) ||
          artwork.description.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (featured === 'true') {
      filteredArtworks = filteredArtworks.filter(artwork => artwork.featured)
    }
    
    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      data: paginatedArtworks,
      success: true,
      pagination: {
        page,
        limit,
        total: filteredArtworks.length,
        totalPages: Math.ceil(filteredArtworks.length / limit),
      },
      timestamp: new Date().toISOString(),
    })
  }),

  // 개별 아트워크 API
  http.get('/api/artworks/:slug', ({ params }) => {
    const { slug } = params
    const artwork = mockArtworks.find(art => art.slug === slug)
    
    if (!artwork) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            message: 'Artwork not found',
            code: 'ARTWORK_NOT_FOUND',
            statusCode: 404,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      data: artwork,
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  // 작가 정보 API
  http.get('/api/artist', () => {
    return HttpResponse.json({
      data: mockArtist,
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  // 연락처 폼 API
  http.post('/api/contact', async ({ request }) => {
    const body = await request.json()
    
    // 유효성 검사 시뮬레이션
    if (!body.name || !body.email || !body.message) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            message: 'Required fields are missing',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }
    
    // 성공 응답
    return HttpResponse.json({
      data: { message: 'Message sent successfully' },
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  // 에러 시뮬레이션을 위한 핸들러
  http.get('/api/artworks/error', () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }),

  // 느린 응답 시뮬레이션
  http.get('/api/artworks/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    return HttpResponse.json({
      data: mockArtworks,
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),
]

// 에러 핸들러들
export const errorHandlers = [
  http.get('/api/artworks', () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch artworks',
          code: 'FETCH_ERROR',
          statusCode: 500,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }),
]