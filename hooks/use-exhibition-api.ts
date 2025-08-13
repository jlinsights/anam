'use client'

import { useFetch } from './use-api-request'

export interface ExhibitionData {
  id: string
  title: string
  subtitle?: string
  description: string
  venue: string
  location: string
  startDate: string
  endDate: string
  openingReception?: string
  imageUrl?: string
  status: 'upcoming' | 'current' | 'past'
  featured?: boolean
  artworkCount?: number
  ticketUrl?: string
  galleryHours?: string[]
}

/**
 * Hook for fetching exhibitions from API
 */
export function useExhibitions() {
  return useFetch<ExhibitionData[]>('/api/exhibitions', {
    immediate: true,
    revalidateOnFocus: true,
    retryAttempts: 2,
    retryDelay: 1000
  })
}

/**
 * Hook for fetching upcoming exhibitions
 */
export function useUpcomingExhibitions() {
  return useFetch<ExhibitionData[]>('/api/exhibitions?status=upcoming', {
    immediate: true,
    revalidateOnFocus: true,
    retryAttempts: 2,
    retryDelay: 1000
  })
}

/**
 * Hook for fetching a specific exhibition by ID
 */
export function useExhibition(id: string) {
  return useFetch<ExhibitionData>(`/api/exhibitions/${id}`, {
    immediate: !!id,
    revalidateOnFocus: false,
    retryAttempts: 2,
    retryDelay: 1000
  })
}