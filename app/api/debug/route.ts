import { getArtworks } from '@/lib/artworks'
import { NextResponse } from 'next/server'

export async function GET() {
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
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch debug info',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}