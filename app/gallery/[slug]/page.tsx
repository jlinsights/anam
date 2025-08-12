import { notFound } from 'next/navigation'
import { getArtworkBySlug, getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import { ArtworkDetailPage } from '@/components/artwork-detail/ArtworkDetailPage'
import type { Metadata } from 'next'

interface ArtworkPageProps {
  params: Promise<{ slug: string }>
}

// Helper function to sanitize text for metadata
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  // Remove control characters and other problematic characters
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim()
}

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtworkBySlug(slug)
  
  if (!artwork) {
    return {
      title: '작품을 찾을 수 없습니다 | 아남 갤러리'
    }
  }

  // Sanitize all text fields
  const sanitizedTitle = sanitizeText(artwork.title)
  const sanitizedDescription = sanitizeText(artwork.description || '아남 배옥영 작가의 현대 서예 작품입니다.')

  return {
    title: `${sanitizedTitle} (${artwork.year}) | 아남 배옥영 서예 갤러리`,
    description: `${sanitizedTitle} - ${artwork.year}년 작품. ${sanitizedDescription}`,
    openGraph: {
      title: `${sanitizedTitle} | 아남 배옥영`,
      description: sanitizedDescription || `${artwork.year}년 작품`,
      images: [{
        url: (() => {
          // slug에서 숫자 부분 추출 (anam-36 → 36)
          if (!artwork.slug || typeof artwork.slug !== 'string') {
            return `/Images/Artworks/optimized/01/01-large.jpg`
          }
          const numberMatch = artwork.slug.match(/anam-(\d+)/)
          const number = numberMatch ? numberMatch[1].padStart(2, '0') : '01'
          return `/Images/Artworks/optimized/${number}/${number}-large.jpg`
        })(),
        width: 1200,
        height: 1200,
        alt: sanitizedTitle
      }]
    }
  }
}

// Dynamic rendering strategy for gallery pages
// Static generation has been causing InvalidCharacterError during build
// Dynamic rendering works perfectly and provides the same user experience
export const dynamic = 'force-dynamic'

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params
  
  try {
    // Get artwork and artist data
    const [artwork, allArtworks, artist] = await Promise.all([
      getArtworkBySlug(slug),
      getArtworks(),
      fetchArtist('fallback-artist').catch(() => undefined)
    ])
    
    if (!artwork) {
      notFound()
    }
    
    // Additional sanitization for artwork data before rendering
    const sanitizedArtwork = {
      ...artwork,
      title: sanitizeText(artwork.title),
      description: sanitizeText(artwork.description || ''),
      artistNote: sanitizeText(artwork.artistNote || ''),
      medium: sanitizeText(artwork.medium || ''),
      dimensions: sanitizeText(artwork.dimensions || ''),
    }
    
    return (
      <ArtworkDetailPage 
        artwork={sanitizedArtwork}
        allArtworks={allArtworks}
        artist={artist || undefined}
      />
    )
  } catch (error) {
    console.error(`Error rendering artwork page for slug: ${slug}`, error)
    notFound()
  }
}