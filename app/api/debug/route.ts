import { getArtworks } from '@/lib/artworks'
import { isDebugAllowed } from '@/lib/debug-guard'
import { createErrorResponse, createSuccessResponse, handleNotFoundError } from '@/lib/error-handler'
import { NextResponse } from 'next/server'

export async function GET() {
  // Check if debug routes are allowed
  if (!isDebugAllowed()) {
    return handleNotFoundError('Debug endpoint')
  }

  try {
    const artworks = await getArtworks()
    
    const debugInfo = {
      totalArtworks: artworks.length,
      slugs: artworks.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        imageUrl: a.imageUrl
      })),
      invalidSlugs: artworks.filter(a => !a.slug || !/^[a-zA-Z0-9\-_]+$/.test(a.slug)),
      imagePathSample: artworks.slice(0, 5).map(a => ({
        slug: a.slug,
        imageUrl: a.imageUrl,
        expectedPath: `/Images/Artworks/optimized/${a.slug}/${a.slug}-medium.jpg`
      }))
    }
    
    return createSuccessResponse(debugInfo, 'Debug information retrieved successfully')
  } catch (error) {
    return createErrorResponse(error, 500, 'Failed to fetch debug info')
  }
}