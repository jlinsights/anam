import { ClientLayout } from '@/components/client-layout'
import type { Metadata } from 'next'
import { Inter, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { SITE_CONFIG, generateStructuredData } from '@/lib/constants/site-config'

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
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.artist.name }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.siteName,
    images: [
      {
        url: SITE_CONFIG.images.artist,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.artist.name} 작가 프로필`,
        type: 'image/jpeg',
      },
    ],
    locale: SITE_CONFIG.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.images.artist],
    creator: SITE_CONFIG.social.twitter,
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
  verification: SITE_CONFIG.verification.google 
    ? { google: SITE_CONFIG.verification.google }
    : undefined,
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
        <link rel='manifest' href={SITE_CONFIG.pwa.manifestPath} />

        {/* PWA 메타 태그 */}
        <meta name='application-name' content={SITE_CONFIG.pwa.applicationName} />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content={SITE_CONFIG.pwa.appleStatusBarStyle} />
        <meta name='apple-mobile-web-app-title' content={SITE_CONFIG.pwa.name} />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-config' content={SITE_CONFIG.pwa.browserconfigPath} />
        <meta name='msapplication-TileColor' content={SITE_CONFIG.theme.color} />
        <meta name='theme-color' content={SITE_CONFIG.theme.color} />

        {/* Apple Touch 아이콘 */}
        <link rel='apple-touch-icon' href={SITE_CONFIG.images.appleTouchIcon} />
        <link
          rel='apple-touch-icon'
          sizes='152x152'
          href={SITE_CONFIG.images.icon152}
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href={SITE_CONFIG.images.icon192}
        />

        {/* 파비콘 */}
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href={SITE_CONFIG.images.favicon32}
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href={SITE_CONFIG.images.favicon16}
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
            __html: JSON.stringify(generateStructuredData(), null, 2),
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
                © 2025 {SITE_CONFIG.siteName} ({SITE_CONFIG.publisher})
              </p>
            </div>
          </footer>
        </ClientLayout>
      </body>
    </html>
  )
}
