import {
  fetchArtistFromAirtable,
  fetchArtworksFromAirtable,
} from '@/lib/airtable'
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler'
import { NextResponse } from 'next/server'

export async function GET() {
  // 요청마다 Airtable API를 두 번 호출하고 레코드 샘플을 돌려주므로 프로덕션에서는 막는다
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  try {
    console.log('🔍 Testing Airtable connection...')

    // 작품 데이터 테스트
    const artworks = await fetchArtworksFromAirtable()
    console.log(`📚 Artworks found: ${artworks?.length || 0}`)

    // 작가 데이터 테스트
    const artist = await fetchArtistFromAirtable()
    console.log(`👨‍🎨 Artist found: ${artist ? 'Yes' : 'No'}`)

    return createSuccessResponse(
      {
        artworks: {
          count: artworks?.length || 0,
          sample: artworks?.slice(0, 2) || [],
        },
        artist: artist
          ? {
              name: artist.name,
              bio: artist.bio?.substring(0, 100) + '...',
              hasData: true,
            }
          : null,
      },
      'Airtable connection test completed successfully'
    )
  } catch (error) {
    return createErrorResponse(error, 500, 'Airtable connection test failed')
  }
}
