'use client'

import { useCallback } from 'react'
import { useFetch, useApiRequest } from './use-api-request'
import type { Artwork, Artist } from '@/lib/types'

/**
 * Hook for fetching artworks from API
 */
export function useArtworks() {
  return useFetch<Artwork[]>('/api/artworks', {
    immediate: true,
    revalidateOnFocus: true,
    retryAttempts: 2,
    retryDelay: 1000
  })
}

/**
 * Hook for fetching a specific artwork by slug
 */
export function useArtwork(slug: string) {
  return useFetch<Artwork>(`/api/artworks/${slug}`, {
    immediate: !!slug,
    revalidateOnFocus: false,
    retryAttempts: 2,
    retryDelay: 1000
  })
}

/**
 * Hook for fetching artist information
 */
export function useArtist() {
  return useFetch<Artist>('/api/artist', {
    immediate: true,
    revalidateOnFocus: false,
    retryAttempts: 2,
    retryDelay: 1000
  })
}

/**
 * Hook for fetching random artworks
 */
export function useRandomArtworks(currentSlug?: string, count: number = 4) {
  const requestFn = useCallback(async (signal: AbortSignal) => {
    const params = new URLSearchParams()
    if (currentSlug) params.set('exclude', currentSlug)
    params.set('count', count.toString())
    params.set('random', 'true')

    const response = await fetch(`/api/artworks?${params.toString()}`, { signal })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data || []
  }, [currentSlug, count])

  return useApiRequest<Artwork[]>(requestFn, {
    immediate: true,
    revalidateOnFocus: false,
    retryAttempts: 1,
    retryDelay: 500
  })
}

/**
 * Hook for fetching featured artworks
 */
export function useFeaturedArtworks() {
  return useFetch<Artwork[]>('/api/artworks?featured=true', {
    immediate: true,
    revalidateOnFocus: true,
    retryAttempts: 2,
    retryDelay: 1000
  })
}

/**
 * Hook for searching artworks
 */
export function useArtworkSearch(query: string, filters?: {
  category?: string
  year?: number
  medium?: string
}) {
  const requestFn = useCallback(async (signal: AbortSignal) => {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.year) params.set('year', filters.year.toString())
    if (filters?.medium) params.set('medium', filters.medium)

    const response = await fetch(`/api/artworks?${params.toString()}`, { signal })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data || []
  }, [query, filters])

  return useApiRequest<Artwork[]>(requestFn, {
    immediate: !!query,
    revalidateOnFocus: false,
    retryAttempts: 1,
    retryDelay: 300
  })
}