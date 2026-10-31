import {
  fetchArtworksFromAirtable,
  fetchFeaturedArtworks,
  fetchTreasureArtworks,
} from '@/lib/airtable'
import type { Artwork } from '@/lib/types'

// 레거시 이미지 경로 생성 함수 (로컬 정의)
function createLegacyImagePath(
  slug: string,
  year: number,
  size: string = 'medium'
): string {
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

// 지어낸 작품·작가 데이터는 두지 않는다. 예전에는 'Harmony'·'Serenity' 같은 영어 제목에
// 2021년·Ink on paper 를 붙인 61점과 수상·학력·생년을 지어낸 작가 정보를 여기서 만들어,
// 데이터를 못 받으면(브라우저에서는 늘) 실제처럼 보여 줬다. 실제 데이터가 없으면 비어 있거나 오류여야 한다

/**
 * 작품 데이터를 가져오는 메인 함수 (Supabase → Airtable 순서)
 * 둘 다 실패하면 빈 배열. 서버 전용: 브라우저에는 두 출처의 키가 없으므로
 * 클라이언트 컴포넌트는 이 함수 대신 /api/artworks 를 부른다
 */
export async function getArtworks(): Promise<Artwork[]> {
  try {
    // 1. Try Supabase first (primary data source)
    try {
      const { fetchArtworksFromSupabase } =
        await import('@/lib/supabase/artworks')
      const artworksFromSupabase = await fetchArtworksFromSupabase()
      if (artworksFromSupabase && artworksFromSupabase.length > 0) {
        console.log(
          `✅ Loaded ${artworksFromSupabase.length} artworks from Supabase`
        )
        return artworksFromSupabase
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase unavailable, trying Airtable:', supabaseError)
    }

    // 2. Fallback to Airtable if Supabase fails
    try {
      const artworksFromAirtable = await fetchArtworksFromAirtable()
      if (artworksFromAirtable && artworksFromAirtable.length > 0) {
        console.log(
          `✅ Loaded ${artworksFromAirtable.length} artworks from Airtable (fallback)`
        )
        return artworksFromAirtable
      }
    } catch (airtableError) {
      console.warn('⚠️ Airtable also unavailable:', airtableError)
    }

    console.warn('⚠️ No artworks: both Supabase and Airtable unavailable')
    return []
  } catch (error) {
    console.error('❌ Error in getArtworks:', error)
    return []
  }
}

/**
 * 특정 slug로 작품 찾기 (Supabase 우선, fallback 지원)
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      console.warn('Invalid slug provided to getArtworkBySlug:', slug)
      return null
    }

    // 1. Try Supabase first
    try {
      const { fetchArtworkBySlugFromSupabase } =
        await import('@/lib/supabase/artworks')
      const artwork = await fetchArtworkBySlugFromSupabase(slug)
      if (artwork) {
        console.log(`✅ Found artwork in Supabase for slug: "${slug}"`)
        return artwork
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase query failed, trying fallback:', supabaseError)
    }

    // 2. Fallback to getArtworks() which tries all sources
    const artworks = await getArtworks()
    console.log(
      `🔍 Looking for artwork with slug: "${slug}" in ${artworks.length} artworks`
    )

    // Try exact slug match first
    let found = artworks.find((artwork) => artwork.slug === slug)
    if (found) {
      console.log(`✅ Found exact slug match for "${slug}":`, found.title)
      return found
    }

    // Try alternative matching patterns for slug format changes
    if (/^\d{1,2}$/.test(slug)) {
      // Slug is just a number (e.g., "01", "2", "25")
      const paddedSlug = slug.padStart(2, '0')
      found = artworks.find(
        (artwork) =>
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
      found = artworks.find(
        (artwork) =>
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
    console.log(
      'Available slugs:',
      artworks.slice(0, 10).map((a) => a.slug)
    )
    return null
  } catch (error) {
    console.error('❌ Error in getArtworkBySlug:', error)
    return null
  }
}

/**
 * 클라이언트 컴포넌트용: 서버 API(/api/artworks)에서 실제 작품을 받는다.
 * 실패하면 예외를 던져 화면이 오류 상태를 보이게 한다(지어낸 작품으로 채우지 않음)
 */
export async function fetchArtworksFromApi(
  signal?: AbortSignal
): Promise<Artwork[]> {
  const res = await fetch('/api/artworks', { signal })
  if (!res.ok) {
    throw new Error(`작품을 불러오지 못했습니다 (HTTP ${res.status})`)
  }
  const json = (await res.json()) as { data?: Artwork[] }
  return json.data ?? []
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
