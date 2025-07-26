export interface Artwork {
  id: string
  slug: string
  title: string
  year: number
  medium: string
  dimensions: string
  aspectRatio: string // CSS aspect-ratio 값 (예: "2/1", "1/1", "5/7")
  description: string
  imageUrl: string
  imageUrlQuery?: string
  artistNote?: string
  // Airtable 연동을 위한 추가 필드들
  featured?: boolean
  category?: string
  tags?: string[]
  price?: number
  available?: boolean
  createdAt?: string
  updatedAt?: string
  // 추가 메타데이터
  exhibition?: string // 전시 정보
  series?: string // 시리즈명
  technique?: string // 기법
  inspiration?: string // 영감
  symbolism?: string // 상징성
  culturalContext?: string // 문화적 맥락
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  website?: string
  youtube?: string
  linkedin?: string
}

export interface Artist {
  id: string
  name: string
  bio: string
  statement?: string
  profileImageUrl?: string
  // Airtable 연동을 위한 추가 필드들
  birthYear?: number
  education?: string[]
  exhibitions?: string[]
  awards?: string[]
  collections?: string[]
  website?: string
  email?: string
  phone?: string
  socialLinks?: SocialLinks
  // 추가 작가 정보
  birthPlace?: string // 출생지
  currentLocation?: string // 현재 거주지
  specialties?: string[] // 전문 분야
  influences?: string[] // 영향받은 작가/사상
  teachingExperience?: string[] // 교육 경력
  publications?: string[] // 출판물
  memberships?: string[] // 소속 단체
  philosophy?: string // 작가 철학
  techniques?: string[] // 주요 기법
  materials?: string[] // 주요 재료
}

// 멀티플 초이스 대응을 위한 개선된 Artist 타입
export interface ArtistWithStructuredData extends Artist {
  // 년도별 구조화된 데이터
  awardsByYear?: Record<string, string[]>
  exhibitionsByType?: {
    solo: string[]
    group: string[]
  }

  // 멀티플 초이스 필드 (에어테이블에서 직접 제공)
  award_years?: string[]
  exhibition_types?: string[]
  award_categories?: string[]
}

// 페이지 컴포넌트 Props 타입들
export interface PageProps {
  params: { [key: string]: string | string[] | undefined }
  searchParams: { [key: string]: string | string[] | undefined }
}

export interface LayoutProps {
  children: React.ReactNode
  params?: { [key: string]: string | string[] | undefined }
}

// 테마 관련 타입들
export type Theme = 'light' | 'dark' | 'system'

// 언어 관련 타입들
export type Locale = 'ko' | 'en' | 'ja' | 'zh'

// 갤러리 상태 타입들
export interface GalleryState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  searchQuery: string
  selectedCategory: string
  sortBy: 'year' | 'title' | 'featured'
  sortOrder: 'asc' | 'desc'
}

// 에러 관련 타입들
export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

// API 응답 타입들
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: AppError
  timestamp: string
}

// 연락처 폼 타입들
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

// SEO 관련 타입들
export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}

// 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 이벤트 핸들러 타입들
export type EventHandler<T = Event> = (event: T) => void
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

// 전역 타입 확장
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
