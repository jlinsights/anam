import { fetchArtist } from '@/lib/artist'
import { EnhancedArtistSection } from '@/components/single-page/EnhancedArtistSection'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '작가 소개 | 아남 배옥영 서예 갤러리',
  description:
    '아남 배옥영 작가의 프로필, 경력, 작품 철학을 소개합니다. 전통 서예와 현대적 감각을 결합한 독창적인 서예 작가의 세계를 만나보세요.',
  openGraph: {
    title: '작가 소개 | 아남 배옥영',
    description:
      '전통 서예와 현대적 감각을 결합한 독창적인 서예 작가 아남 배옥영의 세계',
    images: [
      {
        url: '/Images/Artist/artist.jpg',
        width: 1200,
        height: 630,
        alt: '아남 배옥영 작가',
      },
    ],
  },
}

// 빌드 때 한 번 찍어 두면 작가 데이터(전시 이력 등)를 고쳐도 다음 배포까지 바뀌지 않는다.
// 홈(/api/artist, 5분 캐시)과 맞춰 5분마다 다시 만든다
export const revalidate = 300

export default async function ArtistPage() {
  // Supabase 사본 먼저, 없으면 Airtable (lib/artist.ts)
  const artist = await fetchArtist('anam-artist')

  return (
    <div className='min-h-screen bg-paper text-ink'>
      <EnhancedArtistSection artist={artist || undefined} />
    </div>
  )
}
