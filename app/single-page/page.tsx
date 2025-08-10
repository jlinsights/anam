import { getArtworks } from '@/lib/artworks'
import { fetchArtist } from '@/lib/artist'
import { SinglePageLayout } from '@/components/single-page'
import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata: Metadata = {
  title: '아남 배옥영 서예 갤러리 - 단일 페이지 경험',
  description: '전통 서예의 깊이와 현대적 감각이 어우러진 아남 배옥영 작가의 완전한 갤러리 경험을 단일 페이지로 만나보세요.',
  keywords: [
    '아남 배옥영',
    '서예',
    '한국 전통 예술',
    '현대 서예',
    '먹, 그리고',
    '단일 페이지 갤러리',
    'Oriental Calligraphy',
    'Korean Art',
    'Single Page Application'
  ],
  openGraph: {
    title: '아남 배옥영 서예 갤러리 - 단일 페이지',
    description: '전통과 현대가 만나는 서예의 완전한 경험',
    url: '/single-page',
    siteName: '먹, 그리고... 展',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function SinglePageHome() {
  // Fetch data in parallel
  const [artworks, artist] = await Promise.all([
    getArtworks(),
    fetchArtist('fallback-artist').catch(() => undefined)
  ])

  return <SinglePageLayout initialArtworks={artworks} artist={artist || undefined} />
}