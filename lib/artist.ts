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
    name: '희랑 공경순',
    bio: '한국의 전통 서예와 현대적 감각을 결합한 독창적인 작품 세계를 구축하고 있는 서예 작가입니다.',
    profileImageUrl: '/images/artist/artist-large.jpg',
    birthYear: 1970,
    email: 'contact@heelang.com',
    phone: '+82-10-0000-0000',
    website: 'https://heelang.com',
    education: ['서울대학교 미술대학 서예과 졸업', '동 대학원 서예학 석사'],
    exhibitions: [
      '2023 개인전 "먹의 향기" - 갤러리 현대',
      '2022 단체전 "한국 현대 서예전" - 국립현대미술관',
    ],
    awards: ['2023 대한민국 서예대전 대상', '2022 한국서예협회 우수상'],
    specialties: ['전통 서예', '현대 서예', '캘리그래피'],
    influences: ['김정희', '추사 김정희', '원효대사'],
    techniques: ['해서', '행서', '초서', '전서'],
    socialLinks: {
      instagram: 'https://instagram.com/heelang_art',
      facebook: 'https://facebook.com/heelang.art',
      youtube: 'https://youtube.com/@heelang',
      website: 'https://heelang.com',
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
  name: '이희랑',
  bio: '전통 서예와 현대 미술의 경계를 탐구하는 작가',
  statement: '붓끝에서 피어나는 한국의 정신을 현대적 감각으로 재해석합니다.',
  profileImageUrl: '/images/artist/artist-large.jpg',
  birthYear: 1970,
  education: [
    '서울대학교 미술대학 동양화과 졸업',
    '홍익대학교 대학원 미술학 석사',
  ],
  exhibitions: [
    "2023 개인전 '묵향의 현재' (인사아트센터)",
    "2022 그룹전 '한국 현대 서예' (예술의전당)",
    "2021 개인전 '전통과 혁신' (갤러리 현대)",
  ],
  awards: [
    '2023 대한민국 서예대전 대상',
    '2022 동아미술제 특선',
    '2021 한국서예협회 신인상',
  ],
  collections: [
    '국립현대미술관 소장',
    '서울시립미술관 소장',
    '개인 컬렉션 다수',
  ],
  email: 'heelang@orientalcalligraphy.org',
  phone: '010-1234-5678',
  socialLinks: {
    instagram: '@heelang_art',
  },
  birthPlace: '서울',
  currentLocation: '서울',
  specialties: ['서예', '수묵화', '현대 캘리그래피'],
  influences: ['김정희', '이응노', '박수근'],
  teachingExperience: [
    '홍익대학교 미술대학 강사 (2020-현재)',
    '서울예술고등학교 서예 특강 (2019-2021)',
  ],
  publications: [
    '『현대 서예의 이해』 (2022, 미술문화)',
    '『붓과 먹의 철학』 (2021, 예술과비평)',
  ],
  memberships: [
    '한국서예협회 정회원',
    '현대미술작가회 회원',
    '서울서예가협회 이사',
  ],
  philosophy:
    '전통 서예의 정신을 바탕으로 현대적 감각을 더하여, 과거와 현재가 조화를 이루는 작품을 추구합니다.',
  techniques: ['전통 서예', '현대 캘리그래피', '수묵 기법'],
  materials: ['한지', '먹', '붓', '아크릴', '혼합 재료'],
}
