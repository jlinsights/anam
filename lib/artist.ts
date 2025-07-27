import { fetchArtistFromAirtable } from '@/lib/airtable'
import { Artist } from '@/lib/types'

const CACHE_KEY = 'artist_data'
const CACHE_DURATION = 60 * 60 * 1000 // 1시간

export async function fetchArtist(id: string): Promise<Artist | null> {
  try {
    console.log(`Fetching artist with ID: ${id}`)

    // 에어테이블에서 작가 데이터 가져오기
    const artist = await fetchArtistFromAirtable()

    if (!artist) {
      console.log(`No artist found`)
      return null
    }

    console.log(`Successfully fetched artist: ${artist.name}`)
    return artist
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

// 캐시된 작가 데이터를 가져오는 함수
export async function getCachedArtist(id: string): Promise<Artist | null> {
  try {
    // 실제 데이터 가져오기
    return await fetchArtist(id)
  } catch (error) {
    console.error('Error getting cached artist:', error)
    return null
  }
}

// 모든 작가 데이터를 가져오는 함수 (현재는 단일 작가만 지원)
export async function fetchAllArtists(): Promise<Artist[]> {
  try {
    const artist = await fetchArtistFromAirtable()
    return artist ? [artist] : []
  } catch (error) {
    console.error('Error fetching all artists:', error)
    return []
  }
}

// 작가 데이터 검색 함수
export async function searchArtists(query: string): Promise<Artist[]> {
  try {
    const allArtists = await fetchAllArtists()

    if (!query.trim()) {
      return allArtists
    }

    const searchTerm = query.toLowerCase()
    return allArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(searchTerm) ||
        artist.bio.toLowerCase().includes(searchTerm) ||
        artist.statement?.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    console.error('Error searching artists:', error)
    return []
  }
}

function getFallbackArtist(): Artist {
  return {
    id: 'fallback-artist',
    name: '아남 배옥영',
    bio: '한국의 전통 서예와 현대적 감각을 결합한 독창적인 작품 세계를 구축하고 있는 서예 작가입니다.',
    profileImageUrl: '/Images/Artist/배옥영.jpeg',
    birthYear: 1980,
    email: 'contact@anam.com',
    phone: '+82-10-0000-0000',
    website: 'https://anam.com',
    education: ['미술대학 졸업', '미술학 석사'],
    exhibitions: [
      '2024 개인전 "현대의 울림" - 갤러리',
      '2023 단체전 "한국 현대 미술전" - 미술관',
    ],
    awards: ['2024 한국미술대전 대상', '2023 현대미술협회 우수상'],
    specialties: ['현대 서예', '캘리그래피', '전통 서예'],
    influences: ['한국 전통 서예', '현대 서예'],
    techniques: ['서예', '먹', '붓글씨'],
    socialLinks: {
      instagram: 'https://instagram.com/anam_art',
      facebook: 'https://facebook.com/anam.art',
      youtube: 'https://youtube.com/@anam',
      website: 'https://anam.com',
    },
  }
}

export async function fetchArtistWithTag(): Promise<Artist | null> {
  const artist = await fetchArtist('fallback-artist')

  // Next.js 태그 추가 (서버 사이드에서만 동작)
  if (typeof window === 'undefined') {
    try {
      const { unstable_cache } = await import('next/cache')
      return unstable_cache(async () => artist, ['artist'], {
        tags: ['artist'],
        revalidate: 3600,
      })()
    } catch (error) {
      console.error('Error with Next.js cache:', error)
      return artist
    }
  }

  return artist
}

// 기본 작가 데이터 (fallback)
export const defaultArtist: Artist = {
  id: 'default',
  name: '아남 배옥영',
  bio: '전통 서예와 현대적 감각의 경계를 탐구하는 서예가',
  statement: '전통 서예의 정신 속에서 피어나는 현대적 감각을 새로운 시각으로 재해석합니다.',
  profileImageUrl: '/Images/Artist/배옥영.jpeg',
  birthYear: 1980,
  education: [
    '서예학과 졸업',
    '서예학 석사',
  ],
  exhibitions: [
    "2024 개인전 '현대 서예의 향기' (갤러리)",
    "2023 그룹전 '한국 현대 서예' (미술관)",
    "2022 개인전 '전통과 현대의 만남' (서예문화원)",
  ],
  awards: [
    '2024 한국서예대전 대상',
    '2023 현대서예제 특선',
    '2022 신진서예가상',
  ],
  collections: [
    '미술관 소장',
    '개인 컬렉션 다수',
  ],
  email: 'contact@anam.com',
  phone: '010-0000-0000',
  socialLinks: {
    instagram: '@anam_art',
  },
  birthPlace: '한국',
  currentLocation: '서울',
  specialties: ['현대 서예', '캘리그래피', '전통 서예'],
  influences: ['한국 전통 서예', '현대 서예', '동양 철학'],
  teachingExperience: [
    '서예 워크숍 진행',
    '캘리그래피 클래스 강의',
  ],
  publications: [
    '『현대 서예의 이해』 (출판사)',
    '『서예와 철학』 (출간예정)',
  ],
  memberships: [
    '한국서예협회 정회원',
    '현대서예작가회 회원',
  ],
  philosophy:
    '전통 서예의 정신을 바탕으로 현대적 감각을 더하여, 과거와 현재가 조화를 이루는 작품을 추구합니다.',
  techniques: ['서예', '먹', '붓글씨'],
  materials: ['한지', '먹', '붓', '벼루'],
}
