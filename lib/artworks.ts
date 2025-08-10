import {
  fetchArtistFromAirtable,
  fetchArtworksFromAirtable,
  fetchFeaturedArtworks,
  fetchTreasureArtworks,
} from '@/lib/airtable'
import type { Artist, Artwork } from '@/lib/types'
import { getArtistImageUrl } from './image-utils'

// 레거시 이미지 경로 생성 함수 (로컬 정의)
function createLegacyImagePath(slug: string, year: number, size: string = 'medium'): string {
  return `/Images/Artworks/${year}/${slug}-${size}.jpg`
}

import {
  getOptimizedImagePath,
  getResponsiveImageData,
  extractArtworkId,
  type ImageSize,
  type ResponsiveImageData,
} from '@/lib/optimized-image-utils'

// 원본 이미지 번호에서 최적화된 이미지 경로 생성
export function getOptimizedArtworkImagePath(
  imageId: string,
  size: ImageSize = 'medium',
  format: 'jpg' | 'webp' | 'avif' = 'jpg'
): string {
  return getOptimizedImagePath(imageId, size, format)
}

// 작품 이미지 URL 생성 (최적화된 버전, fallback 포함)
export function getArtworkImageWithFallback(
  imageId: string,
  size: ImageSize = 'medium',
  format: 'jpg' | 'webp' | 'avif' = 'jpg'
): string {
  try {
    return getOptimizedArtworkImagePath(imageId, size, format)
  } catch (error) {
    console.warn(`Failed to get optimized image for ${imageId}:`, error)
    // fallback to placeholder
    return '/placeholders/placeholder.jpg'
  }
}

// 작품 반응형 이미지 데이터 생성
export function getArtworkResponsiveImageData(
  imageId: string,
  title: string,
  aspectRatio: string = '4/5'
): ResponsiveImageData {
  return getResponsiveImageData(imageId, title, aspectRatio)
}

// 레거시 함수 (하위 호환성)
export function getLocalArtworkImagePath(
  slug: string,
  year: number,
  size: 'thumb' | 'medium' | 'large' = 'medium'
): string {
  // 새로운 시스템으로 전환 - slug에서 imageId 추출 시도
  const cleanSlug = slug.replace(/^anam-/, '')
  // 일단 레거시 경로 반환 (점진적 마이그레이션)
  const filename = `anam-${cleanSlug}-${size}.jpg`
  return `/Images/Artworks/${year}/${filename}`
}

// 로컬 fallback 데이터
export const fallbackArtistData: Artist = {
  id: 'artist-anam',
  name: '아남 배옥영 (ANAM Bae Ok Young)',
  bio: '한국의 전통 서예와 현대적 감각을 결합한 독창적인 작품 세계를 구축하고 있는 서예 작가입니다. 전통 서예의 정신을 계승하면서도 현대적 미감을 탐구하며, 문자의 조형성과 먹의 물성을 통해 내면의 세계를 표현합니다. 다수의 개인전과 그룹전에 참여하였으며, 그의 작품은 여러 미술관과 개인 컬렉션에 소장되어 있습니다.',
  statement:
    '전통 서예의 정신을 바탕으로 현대적 감각을 더하여, 과거와 현재가 조화를 이루는 작품을 추구합니다. 각 작품은 선과 공간, 여백의 관계를 탐구하는 과정이며, 전통에 뿌리를 두되 동시대의 감성과 소통하는 새로운 서예의 가능성을 모색합니다.',
  profileImageUrl: getArtistImageUrl('배옥영.jpeg'),
  birthYear: 1980,
  education: ['서예학과 졸업', '서예학 석사'],
  exhibitions: [
    "2024 개인전 '현대 서예의 향기' - 갤러리",
    "2023 단체전 '한국 현대 서예전' - 미술관",
    "2022 개인전 '전통과 현대의 만남' - 서예문화원",
  ],
  awards: [
    '2024 한국서예대전 대상',
    '2023 현대서예협회 우수상',
    '2022 신진서예가상',
  ],
  collections: ['미술관 소장', '개인 컬렉션 다수'],
  website: 'https://anam.com',
  socialLinks: {
    instagram: 'https://instagram.com/anam_art',
    website: 'https://anam.com',
  },
}

export const fallbackArtworksData: Artwork[] = [
  {
    id: '1',
    slug: '01',
    title: '작품 01',
    year: 2025,
    medium: '화선지에 먹',
    dimensions: '70 x 140 cm',
    aspectRatio: '1/2',
    description: '전통 서예의 아름다움을 현대적 감각으로 재해석한 작품입니다.',
    imageUrl: getOptimizedArtworkImagePath('01', 'medium'),
    imageId: '01',
    imageUrlQuery: 'korean calligraphy modern traditional',
    artistNote: '전통과 현대의 조화를 추구한 작품입니다.',
    featured: true,
    category: 'recent',
    available: true,
    tags: ['전통', '현대', '조화'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    slug: '02',
    title: '작품 02',
    year: 2025,
    medium: '화선지에 먹',
    dimensions: '90 x 90 cm',
    aspectRatio: '1/1',
    description: '먹의 농담과 선의 강약을 통해 내면의 세계를 표현한 작품입니다.',
    imageUrl: getOptimizedArtworkImagePath('02', 'medium'),
    imageId: '02',
    imageUrlQuery: 'ink lines inner world calligraphy',
    artistNote: '먹의 다양한 톤으로 감정의 깊이를 표현했습니다.',
    featured: false,
    category: 'recent',
    available: true,
    tags: ['먹', '선', '내면'],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
  {
    id: '3',
    slug: '03',
    title: '작품 03',
    year: 2025,
    medium: '화선지에 먹',
    dimensions: '70 x 100 cm',
    aspectRatio: '7/10',
    description: '여백의 미학을 통해 보여주는 공간의 깊이와 침묵의 소리',
    imageUrl: getOptimizedArtworkImagePath('03', 'medium'),
    imageId: '03',
    imageUrlQuery: 'space void depth silence calligraphy',
    artistNote: '여백을 통해 무한한 공간감을 표현하고자 했습니다.',
    featured: false,
    category: 'recent',
    available: true,
    tags: ['여백', '공간', '깊이'],
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
  }
]

/**
 * 작품 데이터를 가져오는 메인 함수 (Airtable → fallback 순서)
 */
export async function getArtworks(): Promise<Artwork[]> {
  try {
    // Temporary: Use only fallback data to fix build issues
    console.warn('🔄 Using fallback artwork data (temporary for build fix)')
    return fallbackArtworksData
    
    // TODO: Re-enable Airtable after fixing InvalidCharacterError
    // const artworksFromAirtable = await fetchArtworksFromAirtable()
    // if (artworksFromAirtable && artworksFromAirtable.length > 0) {
    //   console.log(`✅ Loaded ${artworksFromAirtable.length} artworks from Airtable`)
    //   return artworksFromAirtable
    // }
  } catch (error) {
    console.error('❌ Error in getArtworks:', error)
    return fallbackArtworksData
  }
}

/**
 * 특정 slug로 작품 찾기
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const artworks = await getArtworks()
    return artworks.find(artwork => artwork.slug === slug) || null
  } catch (error) {
    console.error('❌ Error in getArtworkBySlug:', error)
    return null
  }
}

/**
 * 작가 정보 가져오기
 */
export async function fetchArtist(fallbackKey = 'default'): Promise<Artist | null> {
  try {
    // 1. Airtable에서 데이터 시도
    const artistFromAirtable = await fetchArtistFromAirtable()
    if (artistFromAirtable) {
      console.log('✅ Loaded artist data from Airtable')
      return artistFromAirtable
    }

    // 2. Fallback 데이터 사용
    console.warn('🔄 Using fallback artist data')
    return fallbackArtistData
  } catch (error) {
    console.error('❌ Error in fetchArtist:', error)
    return fallbackArtistData
  }
}

/**
 * 서버 API를 통해 작품 데이터 가져오기 (클라이언트용)
 */
export async function getArtworksFromSource(): Promise<Artwork[]> {
  try {
    const res = await fetch('/api/artworks', {
      next: { revalidate: 300 }, // 5분 캐시
    })

    if (!res.ok) {
      console.error('API responded with error:', res.status)
      return []
    }

    // JSON 파싱 실패(HTML 등) 대비
    let json
    try {
      json = await res.json()
    } catch (err) {
      console.error('Failed to parse JSON from /api/artworks:', err)
      return []
    }

    return (json.data || []) as Artwork[]
  } catch (error) {
    console.error('Failed to fetch /api/artworks:', error)
    return []
  }
}

/**
 * Alias for getArtworks for backward compatibility
 */
export async function fetchArtworks(): Promise<Artwork[]> {
  return await getArtworksFromSource()
}

// 무작위 추천 작품 가져오기 (현재 작품 제외)
export async function getRandomArtworks(
  currentSlug: string,
  count: number = 4
): Promise<Artwork[]> {
  try {
    const allArtworks = await getArtworks()

    // 현재 작품 제외
    const otherArtworks = allArtworks.filter(
      (artwork) => artwork.slug !== currentSlug
    )

    // 무작위로 섞기
    const shuffled = [...otherArtworks].sort(() => Math.random() - 0.5)

    // 지정된 개수만큼 반환
    return shuffled.slice(0, count)
  } catch (error) {
    console.error('🚨 getRandomArtworks error:', error)
    return []
  }
}