import { getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import type { Metadata } from 'next'
import type { Artwork, Artist } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata: Metadata = {
  title: '아남 배옥영 작가 서예 갤러리 | 현대 한국 서예의 새로운 지평',
  description: '아남 배옥영 작가의 현대 서예 58점 전시. 전통 서예와 현대적 감각이 조화를 이루는 독창적 작품. 갤러리, 작가 소개, 전시 정보, 연락처를 한 곳에서 만나보세요.',
  keywords: [
    '아남',
    '배옥영',
    '현대서예',
    '서예',
    '캘리그래피',
    '한국서예',
    '전통예술',
    '현대작가',
    '서예전시',
    '붓글씨',
    '먹그림',
    '한국화',
    '동양서예',
    '서예갤러리',
    'Oriental Calligraphy',
    'Korean Art',
    'ANAM',
    'Bae Ok Young'
  ],
  openGraph: {
    title: '아남 배옥영 | 현대 한국 서예 갤러리',
    description: '전통과 현대가 만나는 서예의 새로운 지평. 58점의 독창적 작품을 원페이지로 감상하세요.',
    url: 'https://anam.orientalcalligraphy.org',
    siteName: '먹, 그리고... 展',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: '/Images/Artist/배옥영.jpeg',
        width: 1200,
        height: 630,
        alt: '아남 배옥영 작가',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '아남 배옥영 | 현대 한국 서예 갤러리',
    description: '전통과 현대가 만나는 서예의 새로운 지평',
    images: ['/Images/Artist/배옥영.jpeg'],
  },
  alternates: {
    canonical: 'https://anam.orientalcalligraphy.org',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

export default async function HomePage() {
  // Fetch data in parallel
  const [artworks, artist] = await Promise.all([
    getArtworks(),
    fetchArtist('fallback-artist').catch(() => undefined)
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">아남 배옥영 서예 갤러리</h1>
          <p className="text-gray-600 mt-2">전통과 현대가 만나는 서예의 새로운 지평</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Gallery Grid */}
        <section id="gallery" className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">작품 갤러리</h2>
          {artworks && artworks.length > 0 ? (
            <>
              <p className="text-gray-600 mb-8">{artworks.length}개의 작품</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      {artwork.imageUrl ? (
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">이미지 없음</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{artwork.title}</h3>
                      <p className="text-sm text-gray-500">{artwork.year}년</p>
                      <p className="text-sm text-gray-500">{artwork.medium}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">작품을 불러오는 중입니다...</p>
            </div>
          )}
        </section>

        {/* Artist Section */}
        {artist && (
          <section id="artist" className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">작가 소개</h2>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
              {artist.bio && <p className="text-gray-600 mt-4">{artist.bio}</p>}
            </div>
          </section>
        )}

        {/* Navigation Links */}
        <section id="navigation" className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gallery" className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              상세 갤러리
            </Link>
            <Link href="/artist" className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              작가 정보
            </Link>
            <Link href="/contact" className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              연락처
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 아남 배옥영. All rights reserved.</p>
            <p className="mt-2 text-sm">전통 서예와 현대적 감각이 조화를 이루는 독창적 작품</p>
          </div>
        </div>
      </footer>
    </div>
  )
}