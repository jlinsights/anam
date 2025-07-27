import { ClientLayout } from '@/components/client-layout'
import type { Metadata } from 'next'
import { Inter, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
// import { ThemeProvider } from "@/components/theme-provider"
// import { ErrorBoundary } from "@/components/error-boundary"
// import { SkipToContent } from "@/components/simple-skip-link"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  variable: '--font-noto-serif-kr',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['serif', 'Times New Roman'],
})

export const metadata: Metadata = {
  title: '아남 배옥영 작가 서예 갤러리',
  description:
    "아남 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리. 전통 서예의 정신과 현대적 감각이 조화를 이루는 독창적인 작품들을 만나보세요.",
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
  ],
  authors: [{ name: '아남 배옥영' }],
  creator: '아남 배옥영',
  publisher: 'ANAM Art Gallery',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://anam.orientalcalligraphy.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '아남 배옥영 작가 서예 갤러리',
    description:
      "아남 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리. 전통 서예의 정신과 현대적 감각이 조화를 이루는 독창적인 작품들을 만나보세요.",
    url: 'https://anam.orientalcalligraphy.org',
    siteName: '아남 배옥영 서예 갤러리',
    images: [
      {
        url: '/Images/Artist/배옥영.jpeg',
        width: 1200,
        height: 630,
        alt: '아남 배옥영 작가 프로필',
        type: 'image/jpeg',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '아남 배옥영 작가 서예 갤러리',
    description:
      "아남 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리",
    images: ['/Images/Artist/배옥영.jpeg'],
    creator: '@anam_art',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // 실제 구글 서치 콘솔 코드로 교체 필요
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <head>
        {/* PWA 매니페스트 */}
        <link rel='manifest' href='/manifest.json' />

        {/* PWA 메타 태그 */}
        <meta name='application-name' content='아남 서예 갤러리' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='아남 서예 갤러리' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <meta name='msapplication-TileColor' content='#1a1a1a' />
        <meta name='theme-color' content='#1a1a1a' />

        {/* Apple Touch 아이콘 */}
        <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
        <link
          rel='apple-touch-icon'
          sizes='152x152'
          href='/icons/icon-152x152.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/icons/icon-192x192.png'
        />

        {/* 파비콘 */}
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/icons/icon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/icons/icon-16x16.png'
        />
        <link rel='shortcut icon' href='/favicon.ico' />

        {/* 폰트 프리로딩 최적화 */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        {/* 폰트 폴백 CSS - CLS 최소화 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @font-face {
              font-family: 'Inter-fallback';
              src: local('system-ui'), local('arial');
              ascent-override: 90.2%;
              descent-override: 22.5%;
              line-gap-override: 0%;
              font-display: swap;
            }
            @font-face {
              font-family: 'NotoSerifKR-fallback';
              src: local('serif'), local('Times New Roman');
              ascent-override: 116%;
              descent-override: 29%;
              line-gap-override: 0%;
              font-display: swap;
            }
          `,
          }}
        />

        {/* 구조화 데이터 */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              {
                '@context': 'https://schema.org',
                '@graph': [
                  {
                    '@type': 'Person',
                    name: '아남 배옥영',
                    alternateName: ['배옥영', 'ANAM', 'Bae Ok Young'],
                    jobTitle: '현대 서예 작가',
                    description: '한국의 전통 서예와 현대적 감각을 결합한 독창적인 작품 세계를 구축하고 있는 서예 작가',
                    birthPlace: '한국',
                    nationality: '한국',
                    knowsAbout: ['현대 서예', '캘리그래피', '전통 서예', '한국 서예'],
                    image: 'https://anam.orientalcalligraphy.org/Images/Artist/배옥영.jpeg',
                    url: 'https://anam.orientalcalligraphy.org/artist',
                    sameAs: [
                      'https://instagram.com/anam_art',
                      'https://anam.com'
                    ],
                  },
                  {
                    '@type': 'WebSite',
                    name: '아남 배옥영 서예 갤러리',
                    description:
                      '아남 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리',
                    url: 'https://anam.orientalcalligraphy.org',
                    inLanguage: 'ko-KR',
                    publisher: {
                      '@type': 'Organization',
                      name: 'ANAM Art Gallery',
                    },
                    author: {
                      '@type': 'Person',
                      name: '아남 배옥영',
                    },
                  },
                  {
                    '@type': 'ArtGallery',
                    name: '아남 배옥영 서예 갤러리',
                    description: '전통 서예와 현대적 감각이 조화를 이루는 독창적인 작품들을 전시하는 온라인 갤러리',
                    url: 'https://anam.orientalcalligraphy.org',
                    image: 'https://anam.orientalcalligraphy.org/Images/Artist/배옥영.jpeg',
                    artform: ['현대 서예', '캘리그래피', '전통 서예'],
                    artist: {
                      '@type': 'Person',
                      name: '아남 배옥영',
                    },
                  },
                ],
              },
              null,
              2
            ),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSerifKR.variable}`}
        suppressHydrationWarning
      >
        <ClientLayout>
          <main id='main-content'>{children}</main>
          {/* Footer */}
          <footer className='bg-ink text-paper py-8'>
            <div className='container-art text-center'>
              <p className='text-responsive-sm text-ink-light'>
                © 2025 아남 배옥영 서예 갤러리 (ANAM Calligraphy Gallery)
              </p>
            </div>
          </footer>
        </ClientLayout>
      </body>
    </html>
  )
}
