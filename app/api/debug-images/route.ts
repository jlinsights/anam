import { fallbackArtworksData } from '@/lib/artworks'
import { fetchArtworksFromAirtable } from '@/lib/airtable'
import { validateDebugAccess } from '@/lib/debug-guard'
import { createErrorResponse, createSuccessResponse, handleNotFoundError } from '@/lib/error-handler'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Enhanced security check with context validation
  const { allowed, reason, context } = validateDebugAccess(request)
  
  if (!allowed) {
    console.warn('🔒 Debug images route access denied:', { reason, context })
    return handleNotFoundError('Debug endpoint')
  }

  console.info('🔓 Debug images route access granted:', { reason, ip: context.ip })

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

    return createSuccessResponse(response, 'Debug images information retrieved successfully')
  } catch (error) {
    return createErrorResponse(error, 500, 'Failed to fetch debug images information')
  }
}