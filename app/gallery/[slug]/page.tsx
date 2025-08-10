import { notFound } from 'next/navigation'
import { getArtworkBySlug, getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import { ArtworkDetailPage } from '@/components/artwork-detail/ArtworkDetailPage'
import type { Metadata } from 'next'

interface ArtworkPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtworkBySlug(slug)
  
  if (!artwork) {
    return {
      title: '작품을 찾을 수 없습니다 | 아남 갤러리'
    }
  }

  return {
    title: `${artwork.title} (${artwork.year}) | 아남 배옥영 서예 갤러리`,
    description: `${artwork.title} - ${artwork.year}년 작품. ${artwork.description || '아남 배옥영 작가의 현대 서예 작품입니다.'}`,
    openGraph: {
      title: `${artwork.title} | 아남 배옥영`,
      description: artwork.description || `${artwork.year}년 작품`,
      images: [{
        url: `/Images/Artworks/optimized/${artwork.slug.padStart(2, '0')}/${artwork.slug.padStart(2, '0')}-large.jpg`,
        width: 1200,
        height: 1200,
        alt: artwork.title
      }]
    }
  }
}

export async function generateStaticParams() {
  const artworks = await getArtworks()
  return artworks.map(artwork => ({
    slug: artwork.slug
  }))
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params
  
  // Get artwork and artist data
  const [artwork, allArtworks, artist] = await Promise.all([
    getArtworkBySlug(slug),
    getArtworks(),
    fetchArtist('fallback-artist').catch(() => undefined)
  ])
  
  if (!artwork) {
    notFound()
  }
  
  return (
    <ArtworkDetailPage 
      artwork={artwork}
      allArtworks={allArtworks}
      artist={artist || undefined}
    />
  )
}