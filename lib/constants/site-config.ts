/**
 * Site Configuration Constants
 * Centralized configuration for metadata, SEO, and site settings
 */

export const SITE_CONFIG = {
  name: '아남 배옥영 작가 서예 갤러리',
  title: '아남 배옥영 작가 서예 갤러리',
  description: '아남 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리. 전통 서예의 정신과 현대적 감각이 조화를 이루는 독창적인 작품들을 만나보세요.',
  url: 'https://anam.orientalcalligraphy.org',
  siteName: '아남 배옥영 서예 갤러리',
  creator: '아남 배옥영',
  publisher: 'ANAM Art Gallery',
  locale: 'ko_KR',
  
  // Artist Information
  artist: {
    name: '아남 배옥영',
    alternateName: ['배옥영', 'ANAM', 'Bae Ok Young'],
    jobTitle: '현대 서예 작가',
    description: '한국의 전통 서예와 현대적 감각을 결합한 독창적인 작품 세계를 구축하고 있는 서예 작가',
    birthPlace: '한국',
    nationality: '한국',
    knowsAbout: ['현대 서예', '캘리그래피', '전통 서예', '한국 서예'],
    image: '/Images/Artist/배옥영.jpeg',
    profileUrl: '/artist',
  },

  // SEO Keywords
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

  // Theme Colors
  theme: {
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
  },

  // Social Media
  social: {
    instagram: 'https://instagram.com/anam_art',
    website: 'https://anam.com',
    twitter: '@anam_art',
  },

  // Images
  images: {
    artist: '/Images/Artist/배옥영.jpeg',
    logo: '/icons/icon-192x192.png',
    appleTouchIcon: '/icons/icon-192x192.png',
    favicon16: '/icons/icon-16x16.png',
    favicon32: '/icons/icon-32x32.png',
    icon152: '/icons/icon-152x152.png',
    icon192: '/icons/icon-192x192.png',
  },

  // PWA Configuration
  pwa: {
    name: '아남 서예 갤러리',
    shortName: '아남',
    description: '아남 배옥영 작가의 현대 서예 작품 갤러리',
    applicationName: '아남 서예 갤러리',
    appleStatusBarStyle: 'default' as const,
    manifestPath: '/manifest.json',
    browserconfigPath: '/browserconfig.xml',
  },

  // Verification Codes (Update with actual values)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    // Add other verification codes as needed
  },

  // Gallery Configuration
  gallery: {
    artform: ['현대 서예', '캘리그래피', '전통 서예'],
    defaultImage: '/Images/default-artwork.jpg',
  },
} as const

// Structured Data Schemas
export const STRUCTURED_DATA = {
  person: {
    '@type': 'Person',
    name: SITE_CONFIG.artist.name,
    alternateName: SITE_CONFIG.artist.alternateName,
    jobTitle: SITE_CONFIG.artist.jobTitle,
    description: SITE_CONFIG.artist.description,
    birthPlace: SITE_CONFIG.artist.birthPlace,
    nationality: SITE_CONFIG.artist.nationality,
    knowsAbout: SITE_CONFIG.artist.knowsAbout,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.artist.image}`,
    url: `${SITE_CONFIG.url}${SITE_CONFIG.artist.profileUrl}`,
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.website,
    ],
  },

  website: {
    '@type': 'WebSite',
    name: SITE_CONFIG.siteName,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    inLanguage: SITE_CONFIG.locale,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.publisher,
    },
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.artist.name,
    },
  },

  artGallery: {
    '@type': 'ArtGallery',
    name: SITE_CONFIG.siteName,
    description: '전통 서예와 현대적 감각이 조화를 이루는 독창적인 작품들을 전시하는 온라인 갤러리',
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.images.artist}`,
    artform: SITE_CONFIG.gallery.artform,
    artist: {
      '@type': 'Person',
      name: SITE_CONFIG.artist.name,
    },
  },
} as const

// Helper function to generate structured data JSON-LD
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      STRUCTURED_DATA.person,
      STRUCTURED_DATA.website,
      STRUCTURED_DATA.artGallery,
    ],
  }
}