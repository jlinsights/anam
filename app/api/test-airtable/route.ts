import {
  fetchArtistFromAirtable,
  fetchArtworksFromAirtable,
} from '@/lib/airtable'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing Airtable connection...')

    // 작품 데이터 테스트
    const artworks = await fetchArtworksFromAirtable()
    console.log(`📚 Artworks found: ${artworks?.length || 0}`)

    // 작가 데이터 테스트
    const artist = await fetchArtistFromAirtable()
    console.log(`👨‍🎨 Artist found: ${artist ? 'Yes' : 'No'}`)

    return NextResponse.json({
      success: true,
      data: {
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
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Airtable test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
