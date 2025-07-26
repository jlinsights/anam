import { Logo } from '@/components/logo'
import { SimpleThemeToggle } from '@/components/simple-theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ClientEntry from './ClientEntry'

// generateStaticParams 함수 - 빌드 시점에 모든 유효한 slug 생성
export async function generateStaticParams() {
  try {
    console.log('🔧 generateStaticParams: Starting...')

    // Airtable에서 모든 작품 데이터 가져오기
    const { getArtworks } = await import('@/lib/artworks')
    const artworks = await getArtworks()

    console.log(`🔧 generateStaticParams: Found ${artworks.length} artworks`)

    // 유효한 slug만 필터링
    const validSlugs = artworks
      .filter((artwork) => artwork.slug && artwork.slug.trim() !== '')
      .map((artwork) => ({
        slug: artwork.slug,
      }))

    console.log(
      `🔧 generateStaticParams: Generated ${validSlugs.length} static params`
    )
    console.log(
      '🔧 generateStaticParams: Slugs:',
      validSlugs.map((p) => p.slug)
    )

    return validSlugs
  } catch (error) {
    console.error('🚨 generateStaticParams error:', error)
    return []
  }
}

interface ArtworkDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ArtworkDetailPage({
  params,
}: ArtworkDetailPageProps) {
  // Next.js 15에서는 params가 Promise입니다
  const { slug } = await params

  console.log('🔧 ArtworkDetailPage: Loading artwork with slug:', slug)

  try {
    // 서버에서 작품 데이터 가져오기
    const { getArtworkBySlug, getRandomArtworks } = await import(
      '@/lib/artworks'
    )
    const artwork = await getArtworkBySlug(slug)

    if (!artwork) {
      console.log('🚨 ArtworkDetailPage: Artwork not found for slug:', slug)
      notFound()
    }

    // 추천 작품 가져오기
    const recommendedArtworks = await getRandomArtworks(slug, 4)

    console.log('✅ ArtworkDetailPage: Artwork loaded:', artwork.title)

    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800'>
        {/* Header */}
        <header className='border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <Link href='/' className='flex items-center space-x-2'>
                <Logo className='w-8 h-8' showLink={false} />
                <span className='text-xl font-bold text-slate-900 dark:text-white'>
                  희랑
                </span>
              </Link>
              <div className='flex items-center space-x-4'>
                <Link href='/gallery'>
                  <Button variant='ghost' size='sm'>
                    갤러리로 돌아가기
                  </Button>
                </Link>
                <SimpleThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='container mx-auto px-4 py-8'>
          <ClientEntry
            artwork={artwork}
            recommendedArtworks={recommendedArtworks}
          />
        </main>
      </div>
    )
  } catch (error) {
    console.error('🚨 ArtworkDetailPage error:', error)
    notFound()
  }
}
