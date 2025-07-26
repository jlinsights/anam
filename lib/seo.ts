import type { Metadata } from 'next'
import { APP_CONFIG, SEO_CONFIG } from './constants'
import type { Locale } from './types'
import type { Artwork } from './types'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  locale?: Locale
  image?: string
  type?: 'website' | 'article'
}

export function generateSEOMetadata({
  title,
  description = APP_CONFIG.description,
  path = '/',
  locale = 'ko',
  image,
  type = 'website',
}: SEOProps): Metadata {
  const fullTitle = title
    ? `${title} | ${APP_CONFIG.name}`
    : `${APP_CONFIG.name} | ${APP_CONFIG.nameEn}`

  const url = `${APP_CONFIG.url}${locale === 'ko' ? '' : `/${locale}`}${path}`
  const imageUrl = image
    ? `${APP_CONFIG.url}${image}`
    : `${APP_CONFIG.url}/images/og-image.jpg`

  return {
    title: fullTitle,
    description,
    keywords: [...SEO_CONFIG.keywords],
    authors: [{ name: APP_CONFIG.author.name, url: APP_CONFIG.url }],
    creator: APP_CONFIG.author.name,
    publisher: APP_CONFIG.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(APP_CONFIG.url),
    alternates: {
      canonical: url,
      languages: {
        ko: '/',
        en: '/en',
        ja: '/ja',
        zh: '/zh',
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || APP_CONFIG.name,
        },
      ],
      locale:
        locale === 'ko'
          ? 'ko_KR'
          : locale === 'en'
            ? 'en_US'
            : locale === 'ja'
              ? 'ja_JP'
              : 'zh_CN',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: SEO_CONFIG.twitterHandle,
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
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  }
}

export function generateArtworkSEO(artwork: Artwork, locale: Locale): Metadata {
  return generateSEOMetadata({
    title: artwork.title,
    description: artwork.description,
    path: `/gallery/${artwork.slug}`,
    locale,
    image: artwork.imageUrl,
    type: 'article',
  })
}

// 구조화된 데이터 생성
export function generateArtworkJsonLd(artwork: Artwork) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArt',
    name: artwork.title,
    description: artwork.description,
    image: `${APP_CONFIG.url}${artwork.imageUrl}`,
    dateCreated: artwork.year.toString(),
    creator: {
      '@type': 'Person',
      name: APP_CONFIG.author.name,
    },
    material: artwork.medium,
    width: artwork.dimensions,
    height: artwork.dimensions,
    url: `${APP_CONFIG.url}/gallery/${artwork.slug}`,
  }
}
