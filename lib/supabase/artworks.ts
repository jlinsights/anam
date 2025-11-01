/**
 * Supabase를 사용한 작품 데이터 페칭 함수
 * Airtable 대신 Supabase를 데이터 소스로 사용
 */

import { createSupabaseClient } from './server'
import type { Artwork, Artist } from '@/lib/types'
import { captureError } from '@/lib/error-logger'

/**
 * Supabase에서 모든 작품 데이터 가져오기
 */
export async function fetchArtworksFromSupabase(): Promise<Artwork[] | null> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching artworks from Supabase:', error)
      captureError(error, { scope: 'fetchArtworksFromSupabase' })
      return null
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No artworks found in Supabase')
      return []
    }

    // Transform Supabase data to Artwork type
    const artworks: Artwork[] = data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      year: row.year,
      medium: row.medium,
      dimensions: row.dimensions || '70 x 140 cm',
      aspectRatio: row.aspect_ratio || '2/1',
      description: row.description || '',
      imageUrl: row.image_path || row.image_url, // image_path 우선, 하위 호환성
      imageUrlQuery: row.image_url_query || undefined,
      imageId: row.image_id || undefined,
      number: row.number || undefined,
      artistNote: row.artist_note || undefined,
      featured: row.featured || false,
      category: row.category || undefined,
      tags: row.tags || [],
      price: row.price || undefined,
      available: row.available !== false,
      exhibition: row.exhibition || undefined,
      series: row.series || undefined,
      technique: row.technique || undefined,
      inspiration: row.inspiration || undefined,
      symbolism: row.symbolism || undefined,
      culturalContext: row.cultural_context || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    console.log(`✅ Successfully fetched ${artworks.length} artworks from Supabase`)
    return artworks
  } catch (error) {
    console.error('❌ Exception in fetchArtworksFromSupabase:', error)
    captureError(error, { scope: 'fetchArtworksFromSupabase' })
    return null
  }
}

/**
 * Supabase에서 특정 slug로 작품 가져오기
 */
export async function fetchArtworkBySlugFromSupabase(
  slug: string
): Promise<Artwork | null> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('❌ Error fetching artwork by slug from Supabase:', error)
      captureError(error, { scope: 'fetchArtworkBySlugFromSupabase', slug })
      return null
    }

    if (!data) {
      return null
    }

    // Transform to Artwork type
    const artwork: Artwork = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      year: data.year,
      medium: data.medium,
      dimensions: data.dimensions || '70 x 140 cm',
      aspectRatio: data.aspect_ratio || '2/1',
      description: data.description || '',
      imageUrl: data.image_path || data.image_url, // image_path 우선, 하위 호환성
      imageUrlQuery: data.image_url_query || undefined,
      imageId: data.image_id || undefined,
      number: data.number || undefined,
      artistNote: data.artist_note || undefined,
      featured: data.featured || false,
      category: data.category || undefined,
      tags: data.tags || [],
      price: data.price || undefined,
      available: data.available !== false,
      exhibition: data.exhibition || undefined,
      series: data.series || undefined,
      technique: data.technique || undefined,
      inspiration: data.inspiration || undefined,
      symbolism: data.symbolism || undefined,
      culturalContext: data.cultural_context || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return artwork
  } catch (error) {
    console.error('❌ Exception in fetchArtworkBySlugFromSupabase:', error)
    captureError(error, { scope: 'fetchArtworkBySlugFromSupabase', slug })
    return null
  }
}

/**
 * Supabase에서 작가 정보 가져오기
 */
export async function fetchArtistFromSupabase(): Promise<Artist | null> {
  try {
    const supabase = createSupabaseClient()

    // Get the first artist (assuming single artist for now)
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('❌ Error fetching artist from Supabase:', error)
      captureError(error, { scope: 'fetchArtistFromSupabase' })
      return null
    }

    if (!data) {
      return null
    }

    // Transform to Artist type
    const artist: Artist = {
      id: data.id,
      name: data.name,
      bio: data.bio || '',
      statement: data.statement || undefined,
      profileImageUrl: data.profile_image_url || undefined,
      birthYear: data.birth_year || undefined,
      education: data.education || [],
      exhibitions: data.exhibitions || [],
      awards: data.awards || [],
      collections: data.collections || [],
      website: data.website || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      socialLinks: (() => {
        // Handle both JSONB format and individual columns
        if (data.social_links && typeof data.social_links === 'object') {
          return data.social_links
        }
        // Build from individual columns (actual table structure)
        const links: any = {}
        if (data.instagram) links.instagram = data.instagram
        if (data.facebook) links.facebook = data.facebook
        if (data.twitter) links.twitter = data.twitter
        if (data.youtube) links.youtube = data.youtube
        if (data.linkedin) links.linkedin = data.linkedin
        if (data.website) links.website = data.website
        return Object.keys(links).length > 0 ? links : undefined
      })(),
      birthPlace: data.birth_place || undefined,
      currentLocation: data.current_location || undefined,
      specialties: data.specialties || [],
      influences: data.influences || [],
      teachingExperience: data.teaching_experience || [],
      publications: data.publications || [],
      memberships: data.memberships || [],
      philosophy: data.philosophy || undefined,
      techniques: data.techniques || [],
      materials: data.materials || [],
    }

    console.log('✅ Successfully fetched artist from Supabase')
    return artist
  } catch (error) {
    console.error('❌ Exception in fetchArtistFromSupabase:', error)
    captureError(error, { scope: 'fetchArtistFromSupabase' })
    return null
  }
}

/**
 * Supabase에서 추천 작품 가져오기
 */
export async function fetchFeaturedArtworksFromSupabase(
  limit: number = 3
): Promise<Artwork[]> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('featured', true)
      .order('year', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching featured artworks from Supabase:', error)
      captureError(error, { scope: 'fetchFeaturedArtworksFromSupabase' })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Transform to Artwork type
    const artworks: Artwork[] = data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      year: row.year,
      medium: row.medium,
      dimensions: row.dimensions || '70 x 140 cm',
      aspectRatio: row.aspect_ratio || '2/1',
      description: row.description || '',
      imageUrl: row.image_path || row.image_url, // image_path 우선, 하위 호환성
      imageUrlQuery: row.image_url_query || undefined,
      imageId: row.image_id || undefined,
      number: row.number || undefined,
      artistNote: row.artist_note || undefined,
      featured: row.featured || false,
      category: row.category || undefined,
      tags: row.tags || [],
      price: row.price || undefined,
      available: row.available !== false,
      exhibition: row.exhibition || undefined,
      series: row.series || undefined,
      technique: row.technique || undefined,
      inspiration: row.inspiration || undefined,
      symbolism: row.symbolism || undefined,
      culturalContext: row.cultural_context || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return artworks
  } catch (error) {
    console.error('❌ Exception in fetchFeaturedArtworksFromSupabase:', error)
    captureError(error, { scope: 'fetchFeaturedArtworksFromSupabase' })
    return []
  }
}

/**
 * 검색 기능 (Supabase full-text search 사용)
 */
export async function searchArtworksInSupabase(
  query: string
): Promise<Artwork[]> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,artist_note.ilike.%${query}%`)
      .order('year', { ascending: false })

    if (error) {
      console.error('❌ Error searching artworks in Supabase:', error)
      captureError(error, { scope: 'searchArtworksInSupabase', query })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Transform to Artwork type
    const artworks: Artwork[] = data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      year: row.year,
      medium: row.medium,
      dimensions: row.dimensions || '70 x 140 cm',
      aspectRatio: row.aspect_ratio || '2/1',
      description: row.description || '',
      imageUrl: row.image_path || row.image_url, // image_path 우선, 하위 호환성
      imageUrlQuery: row.image_url_query || undefined,
      imageId: row.image_id || undefined,
      number: row.number || undefined,
      artistNote: row.artist_note || undefined,
      featured: row.featured || false,
      category: row.category || undefined,
      tags: row.tags || [],
      price: row.price || undefined,
      available: row.available !== false,
      exhibition: row.exhibition || undefined,
      series: row.series || undefined,
      technique: row.technique || undefined,
      inspiration: row.inspiration || undefined,
      symbolism: row.symbolism || undefined,
      culturalContext: row.cultural_context || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return artworks
  } catch (error) {
    console.error('❌ Exception in searchArtworksInSupabase:', error)
    captureError(error, { scope: 'searchArtworksInSupabase', query })
    return []
  }
}

