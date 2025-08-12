import { fetchArtist } from '@/lib/artist'
import { EnhancedArtistSection } from '@/components/single-page/EnhancedArtistSection'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '작가 소개 | 아남 배옥영 서예 갤러리',
  description: '아남 배옥영 작가의 프로필, 경력, 작품 철학을 소개합니다. 전통 서예와 현대적 감각을 결합한 독창적인 서예 작가의 세계를 만나보세요.',
  openGraph: {
    title: '작가 소개 | 아남 배옥영',
    description: '전통 서예와 현대적 감각을 결합한 독창적인 서예 작가 아남 배옥영의 세계',
    images: [
      {
        url: '/Images/Artist/artist.jpg',
        width: 1200,
        height: 630,
        alt: '아남 배옥영 작가'
      }
    ]
  }
}

export default async function ArtistPage() {
  // Fetch artist data from Airtable
  const artist = await fetchArtist('anam-artist')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="font-calligraphy font-bold text-gray-900 dark:text-white text-4xl md:text-5xl mb-4">
              작가 소개
            </h1>
            <p className="font-display text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              전통의 깊이와 현대적 감각을 조화시키며, 한국 미학의 정수를 현대적 언어로 재해석하는 서예 작가
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Artist Section */}
      <EnhancedArtistSection artist={artist} />

      {/* Bottom Navigation */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-xl mb-2">
                더 많은 작품을 둘러보세요
              </h3>
              <p className="font-display text-gray-600 dark:text-gray-400">
                아남 배옥영 작가의 다양한 서예 작품들을 갤러리에서 만나보실 수 있습니다.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/gallery" className="
                px-8 py-4
                bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-display font-bold
                hover:bg-yellow-600 hover:text-gray-900
                transition-all duration-300
                shadow-lg hover:shadow-xl
                border-4 border-gray-900 dark:border-gray-100 hover:border-yellow-600
                transform hover:-translate-x-1 hover:-translate-y-1
              ">
                갤러리 보기
              </a>
              <a href="/" className="
                px-8 py-4
                bg-white dark:bg-gray-800 border-4 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-white font-display font-bold
                hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900
                transition-all duration-300
                shadow-lg hover:shadow-xl
                transform hover:translate-x-1 hover:translate-y-1
              ">
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}