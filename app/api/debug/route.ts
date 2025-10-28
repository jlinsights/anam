import { getArtworks } from '@/lib/artworks'
import { validateDebugAccess } from '@/lib/debug-guard'
import { createErrorResponse, createSuccessResponse, handleNotFoundError } from '@/lib/error-handler'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Enhanced security check with context validation
  const { allowed, reason, context } = validateDebugAccess(request)
  
  if (!allowed) {
    console.warn('🔒 Debug route access denied:', { reason, context })
    return handleNotFoundError('Debug endpoint')
  }

  console.info('🔓 Debug route access granted:', { reason, ip: context.ip })

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