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

// 지어낸 작가 정보(getFallbackArtist·defaultArtist: 전시·수상·저서·소속·전화번호)는 삭제했다.
// 어디서도 쓰지 않았고, 실제 데이터가 없으면 null 을 돌려준다
