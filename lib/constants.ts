// 앱 전체에서 사용하는 상수들
export const APP_CONFIG = {
  name: '아남 서예 갤러리',
  nameEn: 'ANAM Calligraphy Gallery',
  description:
    '아남 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  author: {
    name: '아남 배옥영',
    email: 'contact@anam.com',
  },
} as const

// 이미지 관련 상수
export const IMAGE_CONFIG = {
  // 반응형 이미지 sizes 속성
  artworkImageSizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  profileImageSize: '(max-width: 768px) 100vw, 50vw',

  // 이미지 크기 설정
  imageSizes: {
    thumb: { width: 400, height: 400 },
    medium: { width: 800, height: 800 },
    large: { width: 1200, height: 1200 },
  },

  // 품질 설정
  defaultQuality: 85,

  // 파일 형식
  defaultFormat: 'jpg',
} as const

// 페이지네이션 관련 상수
export const PAGINATION_CONFIG = {
  artworksPerPage: 12,
  maxPaginationPages: 10,
} as const

// SEO 관련 상수
export const SEO_CONFIG = {
  keywords: [
    '현대서예',
    'contemporary calligraphy',
    'calligraphy',
    'gallery',
    'Korean art',
    '한국 서예',
    '아남',
    '배옥영',
  ],
  twitterHandle: '@anam_calligraphy',
} as const

// 사이트 메타데이터
export const SITE_CONFIG = {
  name: '아남 서예 갤러리',
  description: '아남 배옥영 작가의 현대 서예 작품을 소개합니다',
  url: 'https://anam.orientalcalligraphy.org',
  author: '아남 배옥영 (ANAM Bae Ok Young)',
} as const

// 네비게이션 메뉴
export const NAVIGATION = [
  { label: '작가 소개', href: '/artist' },
  { label: '작품 갤러리', href: '/gallery' },
  { label: '전시 정보', href: '/exhibition' },
  { label: '문의하기', href: '/contact' },
] as const
