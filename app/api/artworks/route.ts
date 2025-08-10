import { fetchArtworksFromAirtable } from '@/lib/airtable'
import { fallbackArtworksData } from '@/lib/artworks'
import type { Artwork } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// 캐시 설정
let cachedArtworks: Artwork[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 1 * 60 * 1000 // 1분으로 단축 (기존 5분)

async function getCachedArtworks(): Promise<Artwork[]> {
  const now = Date.now()

  // 캐시가 유효한지 확인
  if (cachedArtworks && now - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 Using cached artworks data')
    return cachedArtworks
  }

  // 새로운 데이터 가져오기
  try {
    const artworks = await fetchArtworksFromAirtable()

    if (artworks && artworks.length > 0) {
      cachedArtworks = artworks
      cacheTimestamp = now
      console.log(`✅ Cached ${artworks.length} artworks from Airtable`)
      return artworks
    } else {
      console.warn('⚠️ No artworks from Airtable, using fallback data')
      cachedArtworks = fallbackArtworksData
      cacheTimestamp = now
      return fallbackArtworksData
    }
  } catch (error) {
    console.error('❌ Error fetching artworks, using fallback data:', error)
    cachedArtworks = fallbackArtworksData
    cacheTimestamp = now
    return fallbackArtworksData
  }
}

// 캐시 무효화 함수
function invalidateCache() {
  cachedArtworks = null
  cacheTimestamp = 0
  console.log('🗑️ Cache invalidated')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const artworks = await getCachedArtworks()

    // getCachedArtworks() now always returns fallback data, so artworks should never be empty
    // But let's add a final safety net just in case
    const finalArtworks = (artworks && artworks.length > 0) ? artworks : fallbackArtworksData

    // 특정 slug가 요청된 경우
    if (slug) {
      const artwork = finalArtworks.find((artwork: Artwork) => artwork.slug === slug)
      return NextResponse.json({
        success: !!artwork,
        message: artwork ? 'Artwork found' : 'Artwork not found',
        data: artwork || null,
      }, { status: artwork ? 200 : 404 })
    }

    // 모든 작품 반환
    return NextResponse.json({
      success: true,
      message: `Found ${finalArtworks.length} artworks`,
      data: finalArtworks,
    })
  } catch (error) {
    console.error('Failed to fetch artworks:', error)

    // Even on error, return fallback data instead of null
    return NextResponse.json({
      success: false,
      message: 'Using fallback data due to error',
      data: fallbackArtworksData,
    }, { status: 200 }) // Return 200 with fallback data instead of error status
  }
}

// 캐시 무효화를 위한 POST 메서드
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'refresh') {
      invalidateCache()

      // 새로운 데이터 즉시 가져오기
      const artworks = await getCachedArtworks()

      return NextResponse.json({
        success: true,
        message: 'Cache refreshed successfully',
        data: {
          count: artworks.length,
          featuredCount: artworks.filter((artwork) => artwork.featured).length,
        },
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use ?action=refresh to refresh cache',
    })
  } catch (error) {
    console.error('Failed to refresh cache:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to refresh cache',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
