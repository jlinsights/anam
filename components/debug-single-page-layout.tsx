'use client'

import { useEffect } from 'react'
import type { Artwork, Artist } from '@/lib/types'

interface DebugSinglePageLayoutProps {
  initialArtworks: Artwork[]
  artist?: Artist
}

export default function DebugSinglePageLayout({ initialArtworks, artist }: DebugSinglePageLayoutProps) {
  useEffect(() => {
    console.log('DebugSinglePageLayout mounted with:', { artworks: initialArtworks.length, artist: !!artist })
  }, [initialArtworks, artist])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">아남 배옥영 서예 갤러리</h1>
        
        <div className="mb-8">
          <p className="text-lg text-center text-gray-600">
            전통과 현대가 어우러진 서예 작품을 만나보세요
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">작품 갤러리</h2>
          <p className="mb-4">총 {initialArtworks.length}개의 작품이 있습니다.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialArtworks.slice(0, 12).map((artwork) => (
              <div key={artwork.id} className="border border-gray-200 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">{artwork.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{artwork.year}</p>
                <p className="text-sm text-gray-500">{artwork.medium}</p>
              </div>
            ))}
          </div>
          
          {initialArtworks.length > 12 && (
            <p className="mt-4 text-center text-gray-500">
              그 외 {initialArtworks.length - 12}개의 작품이 더 있습니다.
            </p>
          )}
        </div>
        
        {artist && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">작가 소개</h2>
            <div className="bg-gray-50 p-6 rounded">
              <h3 className="font-bold text-xl mb-2">{artist.name}</h3>
              {artist.bio && <p className="text-gray-700">{artist.bio}</p>}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800"
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  )
}