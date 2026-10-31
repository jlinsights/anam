import { fetchArtistFromSupabase } from '@/lib/supabase/artworks'
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler'
import type { Artist } from '@/lib/types'
import { clearCache, getCachedData, setCachedData } from '@/lib/cache'
import { hasBearerSecret } from '@/lib/server-secret'
import { NextRequest, NextResponse } from 'next/server'

// 캐시: lib/cache 의 공용 저장소에 둔다. 동기화(clearCacheAndRevalidate)가 함께 비우게 하려고
// 모듈 변수 대신 여기 둔다(예전에는 동기화 뒤에도 최대 5분간 이전 데이터를 줬다)
const CACHE_KEY = 'api:artist'
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// 실제 작가 정보만 캐시한다. 못 받으면 null(작가 섹션을 그리지 않음)이고 캐시하지 않는다.
// 예전 fallback 은 소개문과 작가가 했다는 말("…믿습니다")을 지어내 실제처럼 보여 줬다
async function getCachedArtist(): Promise<Artist | null> {
  const cached = getCachedData(CACHE_KEY) as Artist | null
  if (cached) {
    console.log('📦 Using cached artist data')
    return cached
  }

  try {
    const artist = await fetchArtistFromSupabase()
    if (artist) {
      setCachedData(CACHE_KEY, artist, CACHE_DURATION)
      console.log('✅ Cached artist data from Supabase')
      return artist
    }
    console.warn('⚠️ No artist found in Supabase')
    return null
  } catch (error) {
    console.error('❌ Error fetching artist from Supabase:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const artist = await getCachedArtist()

    if (artist) {
      return NextResponse.json({
        success: true,
        data: artist,
      })
    }
    // 200 + data:null 이면 useFetch 가 `result.data ?? result` 로 응답 봉투를 작가로 착각한다
    return NextResponse.json(
      {
        success: false,
        message: 'No artist data available',
        data: null,
      },
      { status: 503 }
    )
  } catch (error) {
    return createErrorResponse(error, 500, 'Failed to fetch artist data')
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 없이 열려 있으면 누구나 캐시를 비우고 데이터를 다시 불러오게 할 수 있다
    if (!hasBearerSecret(request.headers, 'REVALIDATE_SECRET')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (body.action === 'clearCache') {
      clearCache()
      console.log('🗑️ Artist cache cleared')

      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid action',
      },
      { status: 400 }
    )
  } catch (error) {
    return createErrorResponse(error, 500, 'Failed to process request')
  }
}
