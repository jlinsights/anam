import { ClientLayout } from '@/components/client-layout'
import type { Metadata } from 'next'
import { IBM_Plex_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import {
  SITE_CONFIG,
  generateStructuredData,
} from '@/lib/constants/site-config'

// 한글 UI 글자(메뉴·버튼·작품 정보)용 산세리프. Inter에는 한글이 없어 OS 기본 글꼴로 대체되던 것을 바꾼다
const plexSansKR = IBM_Plex_Sans_KR({
  subsets: ['latin'],
  variable: '--font-plex-sans-kr',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  // 한글 글꼴은 구글이 유니코드 범위별로 수십 개 파일로 쪼개 주므로, preload를 켜면
  // 굵기마다 모든 조각이 <link rel=preload>로 붙는다(홈 HTML 33KB → 116KB, 링크 374개).
  // swap으로 대체 글꼴을 먼저 보여 주고 필요한 조각만 내려받게 둔다
  preload: false,
  fallback: ['Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
})

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  variable: '--font-noto-serif-kr',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['AppleMyungjo', 'Batang', 'serif'],
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
        <meta
          name='application-name'
          content={SITE_CONFIG.pwa.applicationName}
        />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content={SITE_CONFIG.pwa.appleStatusBarStyle}
        />
        <meta
          name='apple-mobile-web-app-title'
          content={SITE_CONFIG.pwa.name}
        />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta
          name='msapplication-config'
          content={SITE_CONFIG.pwa.browserconfigPath}
        />
        <meta
          name='msapplication-TileColor'
          content={SITE_CONFIG.theme.color}
        />
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

        {/* 리소스 힌트 최적화 - LCP 개선 */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link rel='preconnect' href='https://imagedelivery.net' />
        <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
        <link rel='dns-prefetch' href='https://fonts.gstatic.com' />
        <link rel='dns-prefetch' href='https://imagedelivery.net' />

        {/* 중요 CSS 프리로드 */}
        {/* ✅ FIXED: Removed non-existent font and CSS preloads that were causing 404 errors */}
        {/* <link rel='preload' href='/fonts/noto-serif-kr-subset.woff2' as='font' type='font/woff2' crossOrigin='anonymous' /> */}
        {/* <link rel='preload' href='/css/critical.css' as='style' /> */}
        {/* Critical CSS - LCP 및 CLS 최적화 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Critical above-the-fold styles - LCP 최적화 */
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: var(--font-plex-sans-kr), 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
              line-height: 1.6;
              text-rendering: optimizeSpeed;
            }
            #main-content { min-height: 100vh; contain: layout; }
            .container-art { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            
            /* 이미지 최적화 - CLS 방지 */
            img { 
              max-width: 100%; 
              height: auto; 
              font-size: 0;
              vertical-align: middle;
            }
            .aspect-square { aspect-ratio: 1 / 1; }
            .aspect-[3/4] { aspect-ratio: 3 / 4; }
            .aspect-[4/5] { aspect-ratio: 4 / 5; }
            
            /* Hero 섹션 최적화 */
            .hero-container {
              min-height: 70vh;
              display: flex;
              align-items: center;
              contain: layout style paint;
            }
            
            /* 스켈레톤 로더 애니메이션 */
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .skeleton {
              position: relative;
              overflow: hidden;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
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

        {/* ✅ SIMPLE ERROR PREVENTION - Basic only */}
      </head>
      <body
        className={`${plexSansKR.variable} ${notoSerifKR.variable}`}
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
