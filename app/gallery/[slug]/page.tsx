import { redirect } from 'next/navigation'
import { getArtworkBySlug } from '@/lib/artworks'

interface ArtworkPageProps {
  params: Promise<{ slug: string }>
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params
  
  // Try to find the artwork to verify it exists
  const artwork = await getArtworkBySlug(slug)
  
  if (!artwork) {
    // If artwork doesn't exist, redirect to gallery section
    redirect('/#gallery')
  }
  
  // Redirect to single-page gallery with artwork ID
  redirect(`/#gallery?artwork=${artwork.id}`)
}