import { fetchArtistFromSupabase } from '@/lib/supabase/artworks'
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler'
import type { Artist } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

function getFallbackArtistData(): Artist {
  return {
    id: 'artist-heelang',
    name: '아남 배옥영',
    bio: '아남 배옥영은 현대 한국 서예의 새로운 지평을 열어가는 작가입니다. 전통 서예의 깊은 정신성을 바탕으로 현대적 감각을 접목한 독창적인 작품 세계를 구축하고 있습니다.',
    profileImageUrl: '/images/artist/artist.png',
    email: 'contact@orientalcalligraphy.org',
    phone: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      website: 'https://heelang.orientalcalligraphy.org',
      youtube: '',
      linkedin: '',
    },
    birthPlace: '한국',
    currentLocation: '한국',
    specialties: ['서예', '캘리그래피', '동양화'],
    influences: ['전통 서예', '현대 미술', '동양 철학'],
    teachingExperience: ['개인 지도', '워크샵', '전시 기획'],
    publications: [],
    memberships: [],
    philosophy:
      '서예는 단순한 글씨가 아니라 마음의 표현이며, 전통과 현대를 잇는 다리 역할을 해야 한다고 믿습니다.',
    techniques: ['전통 붓글씨', '현대 캘리그래피', '수묵화'],
    materials: ['화선지', '먹', '붓', '인주'],
    awards: [],
    exhibitions: ['개인전 다수', '그룹전 참여'],
    collections: [],
  }
}

// 캐시 설정
let cachedArtist: Artist | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5분

async function getCachedArtist(): Promise<Artist | null> {
  const now = Date.now()

  // 캐시가 유효한지 확인
  if (cachedArtist && now - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 Using cached artist data')
    return cachedArtist
  }

  // 새로운 데이터 가져오기 (Supabase 우선, 실패 시 fallback)
  try {
    const artist = await fetchArtistFromSupabase()

    if (artist) {
      cachedArtist = artist
      cacheTimestamp = now
      console.log('✅ Cached artist data from Supabase')
      return artist
    } else {
      console.warn('⚠️ No artist found in Supabase, using fallback data')
      const fallbackArtist = getFallbackArtistData()
      cachedArtist = fallbackArtist
      cacheTimestamp = now
      return fallbackArtist
    }
  } catch (error) {
    console.error('❌ Error fetching artist from Supabase:', error)

    // 오류 시 fallback 데이터 사용
    console.log('🔄 Using fallback artist data due to error')
    const fallbackArtist = getFallbackArtistData()
    cachedArtist = fallbackArtist
    cacheTimestamp = now
    return fallbackArtist
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
    } else {
      return NextResponse.json({
        success: false,
        message: 'No artist data available',
        data: null,
      })
    }
  } catch (error) {
    return createErrorResponse(error, 500, 'Failed to fetch artist data')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'clearCache') {
      cachedArtist = null
      cacheTimestamp = 0
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
