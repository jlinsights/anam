import { getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import { SinglePageLayout } from '@/components/single-page'
import type { Metadata } from 'next'

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

  return <SinglePageLayout initialArtworks={artworks} artist={artist || undefined} />
}