// 앱 전체에서 사용하는 상수들
export const APP_CONFIG = {
  name: '묵향 서예전',
  nameEn: 'Calligraphy Catalog',
  description:
    '현대 서예가의 작품을 온라인으로 감상할 수 있는 다국어 지원 전시 카탈로그',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  author: {
    name: '이름 예시',
    email: 'artist@example.com',
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
    '서예',
    'calligraphy',
    'art',
    'exhibition',
    'Korean art',
    '한국 전통 예술',
  ],
  twitterHandle: '@calligraphy_art',
} as const

// 사이트 메타데이터
export const SITE_CONFIG = {
  name: '희랑 서예',
  description: '희랑 공경순 작가의 서예 작품을 소개합니다',
  url: 'https://heelang.orientalcalligraphy.org',
  author: '공경순 (Kong KyongSun)',
} as const

// 네비게이션 메뉴
export const NAVIGATION = [
  { label: '작가 소개', href: '/artist' },
  { label: '작품 갤러리', href: '/gallery' },
  { label: '전시 정보', href: '/exhibition' },
  { label: '문의하기', href: '/contact' },
] as const
