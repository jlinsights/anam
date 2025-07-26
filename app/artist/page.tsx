import { fetchArtist } from '@/lib/artist'
import { Metadata } from 'next'
import ArtistClient from './ArtistClient'

export const dynamic = 'force-static'
export const revalidate = 3600 // 1시간마다 재검증

export async function generateMetadata(): Promise<Metadata> {
  const artist = await fetchArtist('fallback-artist')

  return {
    title: artist ? `${artist.name} - 작가 소개` : '작가 소개',
    description:
      artist?.bio ||
      '한국의 서예 작가 희랑 공경순의 작품과 이야기를 만나보세요.',
    openGraph: {
      title: artist ? `${artist.name} - 작가 소개` : '작가 소개',
      description:
        artist?.bio ||
        '한국의 서예 작가 희랑 공경순의 작품과 이야기를 만나보세요.',
      images: artist?.profileImageUrl
        ? [
            {
              url: artist.profileImageUrl,
              width: 1200,
              height: 630,
              alt: `${artist.name} 프로필 이미지`,
            },
          ]
        : [],
    },
  }
}

export default async function ArtistPage() {
  const artist = await fetchArtist('fallback-artist')

  if (!artist) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            작가 정보를 불러올 수 없습니다
          </h1>
          <p className='text-gray-600'>잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  return <ArtistClient artist={artist} />
}
