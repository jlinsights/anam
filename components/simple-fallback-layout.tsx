'use client'

import type { Artwork, Artist } from '@/lib/types'

interface SimpleFallbackLayoutProps {
  initialArtworks: Artwork[]
  artist?: Artist
}

export default function SimpleFallbackLayout({ initialArtworks, artist }: SimpleFallbackLayoutProps) {
  return (
    <div className="min-h-screen bg-paper">
      {/* Simple Header */}
      <header className="bg-ink text-paper p-4">
        <h1 className="text-2xl font-bold">아남 배옥영 서예 갤러리</h1>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold text-ink mb-6">
            먹, 그리고... 展
          </h2>
          <p className="text-xl text-stone mb-8">
            전통과 현대가 만나는 서예의 새로운 지평
          </p>
          <div className="text-stone">
            {artist && (
              <p>작가: {artist.name}</p>
            )}
            <p>작품 수: {initialArtworks.length}점</p>
          </div>
        </div>
      </section>

      {/* Simple Gallery */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-ink text-center mb-12">작품 갤러리</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialArtworks.slice(0, 12).map((artwork) => (
              <div key={artwork.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-ink mb-2">{artwork.title}</h4>
                  <p className="text-sm text-stone">{artwork.year} | {artwork.medium}</p>
                  {artwork.dimensions && (
                    <p className="text-xs text-gray-500 mt-1">{artwork.dimensions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-paper p-8 text-center">
        <p className="mb-2">© 2024 아남 배옥영 서예 갤러리</p>
        <p className="text-sm opacity-75">전통과 현대가 만나는 서예의 새로운 지평</p>
      </footer>
    </div>
  )
}