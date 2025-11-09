'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { getArtworks } from '@/lib/artworks'
import { GallerySection } from '@/components/single-page/GallerySection'
import { ErrorBoundary } from '@/components/error-boundary'
import type { Artwork } from '@/lib/types'

// Loading component for gallery
function GalleryLoading() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto px-zen-md py-zen-xl">
        <div className="text-center mb-zen-xl">
          <div className="h-12 bg-ink/10 rounded-md mb-zen-sm animate-pulse"></div>
          <div className="h-6 bg-ink/5 rounded-md w-48 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-zen-md">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-ink/5 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Error fallback for gallery
function GalleryError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-zen-md">
        <h1 className="font-calligraphy text-2xl text-ink mb-zen-md">
          갤러리 로딩 중 오류가 발생했습니다
        </h1>
        <p className="text-ink-light mb-zen-lg">
          잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-zen-md py-zen-sm bg-ink text-paper font-display hover:bg-gold transition-colors duration-300"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  )
}

// Gallery page component
function GalleryPageContent() {
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const data = await getArtworks()
        setArtworks(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load artworks'))
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  const handleArtworkSelect = (artwork: Artwork) => {
    router.push(`/gallery/${artwork.slug}`)
  }

  if (loading) return <GalleryLoading />
  if (error) return <GalleryError error={error} />

  return (
    <div className="min-h-screen bg-paper">
      <Head>
        <title>작품 갤러리 | 아남 배옥영 서예</title>
        <meta 
          name="description" 
          content="아남 배옥영 작가의 서예 작품을 감상해보세요. 전통과 현대가 만나는 독창적인 서예 세계를 경험할 수 있습니다." 
        />
        <meta property="og:title" content="작품 갤러리 | 아남 배옥영 서예" />
        <meta property="og:description" content="한국 서예의 정신과 현대적 감각이 조화를 이룬 아남 작가의 작품들" />
      </Head>
      
      <div className="py-zen-xl">
        <GallerySection 
          artworks={artworks}
          onArtworkSelect={handleArtworkSelect}
        />
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <ErrorBoundary fallback={GalleryError}>
      <GalleryPageContent />
    </ErrorBoundary>
  )
}