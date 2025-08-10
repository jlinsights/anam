import { NextResponse } from 'next/server'
import { fallbackArtworksData } from '@/lib/artworks'
import { fetchArtworksFromAirtable } from '@/lib/airtable'

export async function GET() {
  try {
    // Test both data sources
    const airtableData = await fetchArtworksFromAirtable()
    const fallbackData = fallbackArtworksData.slice(0, 3) // First 3 for comparison

    // Check if images exist
    const imageChecks = []
    
    for (let i = 1; i <= 5; i++) {
      const slug = i.toString().padStart(2, '0')
      const imagePath = `/Images/Artworks/optimized/${slug}/${slug}-medium.jpg`
      imageChecks.push({
        slug,
        path: imagePath,
        expected: true
      })
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      airtable: {
        available: !!airtableData,
        count: airtableData?.length || 0,
        samples: airtableData?.slice(0, 3).map(artwork => ({
          id: artwork.id,
          slug: artwork.slug,
          title: artwork.title,
          imageUrl: artwork.imageUrl,
          number: artwork.number
        })) || []
      },
      fallback: {
        count: fallbackData.length,
        samples: fallbackData.map(artwork => ({
          id: artwork.id,
          slug: artwork.slug,
          title: artwork.title,
          imageUrl: artwork.imageUrl
        }))
      },
      imageStructure: imageChecks,
      environment: {
        hasAirtableKey: !!process.env.AIRTABLE_API_KEY,
        hasAirtableBase: !!process.env.AIRTABLE_BASE_ID,
        nodeEnv: process.env.NODE_ENV
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}