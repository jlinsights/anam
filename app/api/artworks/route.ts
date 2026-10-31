import {
  fetchArtworksFromSupabase,
  fetchArtworkBySlugFromSupabase,
} from '@/lib/supabase/artworks'
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler'
import { withRateLimit } from '@/lib/rate-limit'
import { hasBearerSecret } from '@/lib/server-secret'
import type { Artwork } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

// 캐시 설정
let cachedArtworks: Artwork[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 1 * 60 * 1000 // 1분

// 실제 작품만 캐시한다. 못 받으면 null 을 돌려주고 캐시하지 않는다(복구되면 다음 요청에서 바로 실제 데이터).
// 예전에는 실패 시 지어낸 작품 61점을 돌려주고 그것까지 캐시했다
async function getCachedArtworks(): Promise<Artwork[] | null> {
  const now = Date.now()

  if (cachedArtworks && now - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 Using cached artworks data')
    return cachedArtworks
  }

  try {
    const artworks = await fetchArtworksFromSupabase()
    if (artworks && artworks.length > 0) {
      cachedArtworks = artworks
      cacheTimestamp = now
      console.log(`✅ Cached ${artworks.length} artworks from Supabase`)
      return artworks
    }
    console.warn('⚠️ No artworks from Supabase')
    return null
  } catch (error) {
    console.error('❌ Error fetching artworks from Supabase:', error)
    return null
  }
}

function artworksUnavailable() {
  return NextResponse.json(
    {
      success: false,
      message: '작품 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      data: null,
    },
    { status: 503 }
  )
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
          console.warn(
            '⚠️ Error fetching artwork by slug from Supabase, falling back to cache:',
            error
          )
        }

        if (!artworks) return artworksUnavailable()

        // Fallback to cached artworks
        const artwork = artworks.find(
          (artwork: Artwork) => artwork.slug === slug
        )
        return NextResponse.json(
          {
            success: !!artwork,
            message: artwork ? 'Artwork found' : 'Artwork not found',
            data: artwork || null,
          },
          { status: artwork ? 200 : 404 }
        )
      }

      if (!artworks) return artworksUnavailable()

      // 모든 작품 반환
      return NextResponse.json({
        success: true,
        message: `Found ${artworks.length} artworks`,
        data: artworks,
      })
    } catch (error) {
      console.error('❌ GET /api/artworks failed:', error)
      return artworksUnavailable()
    }
  })
}

// 캐시 무효화를 위한 POST 메서드
export async function POST(request: NextRequest) {
  return withRateLimit(request, 'api', async () => {
    try {
      const { searchParams } = new URL(request.url)
      const action = searchParams.get('action')

      // 인증 없이 열려 있으면 누구나 캐시를 비우고 데이터를 다시 불러오게 할 수 있다
      if (!hasBearerSecret(request.headers, 'REVALIDATE_SECRET')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        )
      }

      if (action === 'refresh') {
        invalidateCache()

        // 새로운 데이터 즉시 가져오기
        const artworks = await getCachedArtworks()
        if (!artworks) return artworksUnavailable()

        return NextResponse.json({
          success: true,
          message: 'Cache refreshed successfully',
          data: {
            count: artworks.length,
            featuredCount: artworks.filter((artwork) => artwork.featured)
              .length,
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
