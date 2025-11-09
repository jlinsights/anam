import { fetchArtworksFromSupabase, fetchArtworkBySlugFromSupabase } from '@/lib/supabase/artworks'
import { fallbackArtworksData } from '@/lib/artworks'
import { createErrorResponse, createSuccessResponse, handleExternalServiceError } from '@/lib/error-handler'
import { withRateLimit } from '@/lib/rate-limit'
import type { Artwork } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// 캐시 설정
let cachedArtworks: Artwork[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 1 * 60 * 1000 // 1분

async function getCachedArtworks(): Promise<Artwork[]> {
  const now = Date.now()

  // 캐시가 유효한지 확인
  if (cachedArtworks && now - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 Using cached artworks data')
    return cachedArtworks
  }

  // 새로운 데이터 가져오기 (Supabase 우선, 실패 시 fallback)
  try {
    const artworks = await fetchArtworksFromSupabase()

    if (artworks && artworks.length > 0) {
      cachedArtworks = artworks
      cacheTimestamp = now
      console.log(`✅ Cached ${artworks.length} artworks from Supabase`)
      return artworks
    } else {
      console.warn('⚠️ No artworks from Supabase, using fallback data')
      cachedArtworks = fallbackArtworksData
      cacheTimestamp = now
      return fallbackArtworksData
    }
  } catch (error) {
    console.error('❌ Error fetching artworks from Supabase, using fallback data:', error)
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
  return withRateLimit(request, 'api', async () => {
    try {
      const { searchParams } = new URL(request.url)
      const slug = searchParams.get('slug')

      const artworks = await getCachedArtworks()

      // getCachedArtworks() now always returns fallback data, so artworks should never be empty
      // But let's add a final safety net just in case
      const finalArtworks = (artworks && artworks.length > 0) ? artworks : fallbackArtworksData

      // 특정 slug가 요청된 경우 (Supabase에서 직접 조회 시도)
      if (slug) {
        try {
          const artwork = await fetchArtworkBySlugFromSupabase(slug)
          if (artwork) {
            return NextResponse.json({
              success: true,
              message: 'Artwork found',
              data: artwork,
            })
          }
        } catch (error) {
          console.warn('⚠️ Error fetching artwork by slug from Supabase, falling back to cache:', error)
        }

        // Fallback to cached artworks
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
      // Return fallback data with proper error handling
      return handleExternalServiceError(error, fallbackArtworksData)
    }
  })
}

// 캐시 무효화를 위한 POST 메서드
export async function POST(request: NextRequest) {
  return withRateLimit(request, 'api', async () => {
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
      return createErrorResponse(error, 500, 'Failed to refresh cache')
    }
  })
}
