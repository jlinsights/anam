import { getArtworks } from '@/lib/artworks'
import type { Metadata } from 'next'
import GalleryClient from './gallery-client'

export const dynamic = 'force-static' // can be revalidated via tag

export const metadata: Metadata = {
      title: '갤러리 | 아남 배옥영 개인전 | 길',
  description:
          "아남 배옥영 작가의 서예 작품을 감상하세요. '길'을 주제로 한 현대 서예 작품을 온라인으로 만나보실 수 있습니다.",
  keywords: [
    '갤러리',
    '서예 작품',
          '아남 배옥영',
    '현대서예',
    '한국서예',
    '길',
    'calligraphy gallery',
    'korean art',
    'way',
  ],
  openGraph: {
    title: '갤러리 | 아남 배옥영 개인전',
    description: '현대 서예 작품 컬렉션',
    url: '/gallery',
    siteName: '길 (Way) 展',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function GalleryPage() {
  const artworks = await getArtworks()
  return <GalleryClient initialArtworks={artworks} />
}
