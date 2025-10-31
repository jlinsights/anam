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

// Simple optimized image path generation (removed complex imports to fix build issues)
export function getOptimizedArtworkImagePath(
  imageId: string,
  size: 'thumb' | 'medium' | 'large' = 'medium',
  format: 'jpg' | 'webp' | 'avif' = 'jpg'
): string {
  const extension = format === 'jpg' ? 'jpg' : format
  return `/Images/Artworks/optimized/${imageId}/${imageId}-${size}.${extension}`
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

// Generate comprehensive fallback data for 61 artworks matching Number-based slugs
export const fallbackArtworksData: Artwork[] = Array.from({ length: 61 }, (_, index) => {
  const id = (index + 1).toString()
  const slug = (index + 1).toString().padStart(2, '0') // 01, 02, 03, etc.
  const year = 2021 + Math.floor(index / 15) // Distribute across years 2021-2024
  
  // Simple English titles to avoid InvalidCharacterError during build
  const titles = [
    'Harmony', 'Serenity', 'Tranquility', 'Balance', 'Flow', 'Essence', 'Spirit', 'Peace', 'Depth', 'Grace',
    'Vitality', 'Energy', 'Moment', 'Eternal', 'Nature', 'Heart', 'Mind', 'Soul', 'Dream', 'Reality',
    'Tradition', 'Modern', 'Meeting', 'Farewell', 'Longing', 'Hope', 'Love', 'Freedom', 'Release', 'Creation',
    'Birth', 'Growth', 'Change', 'Completion', 'Beginning', 'End', 'Cycle', 'Essence', 'Truth', 'Wisdom',
    'Insight', 'Enlightenment', 'Meditation', 'Practice', 'Path', 'Journey', 'Purpose', 'Meaning', 'Value', 'Beauty',
    'Sublime', 'Sacred', 'Divine', 'Light', 'Shadow', 'Void', 'Silence', 'Breath', 'Rhythm', 'Movement', 'Unity'
  ]
  
  const mediums = ['Ink on paper', 'Ink on hanji', 'Ink and color on paper', 'Traditional ink']
  const dimensions = [
    '70 x 140 cm', '90 x 90 cm', '70 x 100 cm', '50 x 70 cm', '100 x 70 cm',
    '140 x 70 cm', '80 x 120 cm', '60 x 90 cm'
  ]
  
  const title = titles[index] || `작품 ${slug}`
  const medium = mediums[index % mediums.length]
  const dimension = dimensions[index % dimensions.length]
  
  // Calculate aspect ratio from dimensions
  const [width, height] = dimension.split(' x ').map(d => parseInt(d))
  const aspectRatio = `${width}/${height}`
  
  return {
    id,
    slug,
    title,
    year,
    medium,
    dimensions: dimension,
    aspectRatio,
    description: `${title} - A contemporary calligraphy work that explores the relationship between tradition and modernity through the expressive power of ink and void space.`,
    imageUrl: getOptimizedArtworkImagePath(slug, 'medium'),
    imageId: slug,
    imageUrlQuery: `${title} korean calligraphy art`,
    artistNote: `A modern interpretation of ${title} through contemporary calligraphic expression.`,
    featured: index < 3, // First 3 are featured
    category: year >= 2024 ? 'recent' : year >= 2022 ? 'contemporary' : 'classic',
    available: true,
    tags: [title.length > 2 ? title.substring(0, 2) : title, medium.includes('color') ? 'color' : 'ink', year.toString()],
    createdAt: `${year}-01-${(index % 28 + 1).toString().padStart(2, '0')}T00:00:00Z`,
    updatedAt: `${year}-01-${(index % 28 + 1).toString().padStart(2, '0')}T00:00:00Z`,
  }
})

/**
 * 작품 데이터를 가져오는 메인 함수 (Airtable → fallback 순서)
 */
export async function getArtworks(): Promise<Artwork[]> {
  try {
    // Try to fetch from Airtable first
    const artworksFromAirtable = await fetchArtworksFromAirtable()
    if (artworksFromAirtable && artworksFromAirtable.length > 0) {
      console.log(`✅ Loaded ${artworksFromAirtable.length} artworks from Airtable`)
      return artworksFromAirtable
    }
    
    // Fallback to local data if Airtable fails
    console.warn('🔄 Using fallback artwork data (Airtable unavailable)')
    return fallbackArtworksData
  } catch (error) {
    console.error('❌ Error in getArtworks:', error)
    return fallbackArtworksData
  }
}

/**
 * 특정 slug로 작품 찾기 (Enhanced with better slug matching)
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      console.warn('Invalid slug provided to getArtworkBySlug:', slug)
      return null
    }
    
    const artworks = await getArtworks()
    console.log(`🔍 Looking for artwork with slug: "${slug}" in ${artworks.length} artworks`)
    
    // Try exact slug match first
    let found = artworks.find(artwork => artwork.slug === slug)
    if (found) {
      console.log(`✅ Found exact slug match for "${slug}":`, found.title)
      return found
    }
    
    // Try alternative matching patterns for slug format changes
    if (/^\d{1,2}$/.test(slug)) {
      // Slug is just a number (e.g., "01", "2", "25")
      const paddedSlug = slug.padStart(2, '0')
      found = artworks.find(artwork => 
        artwork.slug === paddedSlug || 
        artwork.slug === `anam-${paddedSlug}` ||
        artwork.number?.toString().padStart(2, '0') === paddedSlug ||
        artwork.id === slug ||
        artwork.id === paddedSlug
      )
      if (found) {
        console.log(`✅ Found number-based match for "${slug}":`, found.title)
        return found
      }
    }
    
    // Try anam-XX format matching  
    if (slug.startsWith('anam-')) {
      const number = slug.replace('anam-', '')
      found = artworks.find(artwork => 
        artwork.number?.toString() === number ||
        artwork.id === number ||
        artwork.slug === number.padStart(2, '0')
      )
      if (found) {
        console.log(`✅ Found anam-XX format match for "${slug}":`, found.title)
        return found
      }
    }
    
    console.warn(`⚠️ No artwork found for slug: "${slug}"`)
    console.log('Available slugs:', artworks.slice(0, 10).map(a => a.slug))
    return null
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
      // API 실패 시 fallback 데이터 즉시 반환
      console.warn('🔄 API failed, using fallback artwork data')
      return fallbackArtworksData
    }

    // JSON 파싱 실패(HTML 등) 대비
    let json
    try {
      json = await res.json()
    } catch (err) {
      console.error('Failed to parse JSON from /api/artworks:', err)
      // JSON 파싱 실패 시에도 fallback 데이터 반환
      console.warn('🔄 JSON parse failed, using fallback artwork data')
      return fallbackArtworksData
    }

    const artworks = (json.data || []) as Artwork[]
    
    // 데이터가 없거나 비어있는 경우에도 fallback 사용
    if (!artworks || artworks.length === 0) {
      console.warn('🔄 No artworks in API response, using fallback artwork data')
      return fallbackArtworksData
    }
    
    console.log(`✅ Loaded ${artworks.length} artworks from API`)
    return artworks
  } catch (error) {
    console.error('Failed to fetch /api/artworks:', error)
    // 모든 에러 상황에서 fallback 데이터 반환
    console.warn('🔄 API error, using fallback artwork data')
    return fallbackArtworksData
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