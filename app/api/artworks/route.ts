import { fetchArtworksFromAirtable } from '@/lib/airtable'
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
      console.warn('⚠️ No artworks from Airtable')
      cachedArtworks = []
      cacheTimestamp = now
      return []
    }
  } catch (error) {
    console.error('❌ Error fetching artworks:', error)
    cachedArtworks = []
    cacheTimestamp = now
    return []
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

    if (!artworks || artworks.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No artworks available',
        data: slug ? null : [],
      })
    }

    // 특정 slug가 요청된 경우
    if (slug) {
      const artwork = artworks.find((artwork: Artwork) => artwork.slug === slug)
      return NextResponse.json({
        success: true,
        data: artwork || null,
      })
    }

    // 모든 작품 반환
    return NextResponse.json({
      success: true,
      data: artworks,
    })
  } catch (error) {
    console.error('Failed to fetch artworks:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch artworks',
      data: null,
    })
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
