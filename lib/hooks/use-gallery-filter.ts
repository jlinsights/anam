/**
 * 갤러리 필터링 및 검색 커스텀 훅
 */

import { useMemo, useState, useEffect } from 'react'
import { useGallery } from '@/lib/store/ui-store'
import type { Artwork } from '@/lib/types'

export interface UseGalleryFilterReturn {
  filteredArtworks: Artwork[]
  totalCount: number
  availableYears: string[]
  availableMediums: string[]
  isFiltered: boolean
  hasResults: boolean
}

export function useGalleryFilter(artworks: Artwork[]): UseGalleryFilterReturn {
  const { galleryFilter } = useGallery()

  // 필터링된 작품 목록 계산
  const filteredArtworks = useMemo(() => {
    let filtered = [...artworks]

    // 연도 필터
    if (galleryFilter.year) {
      filtered = filtered.filter(
        (artwork) => artwork.year?.toString() === galleryFilter.year
      )
    }

    // 재료/기법 필터
    if (galleryFilter.medium) {
      filtered = filtered.filter((artwork) =>
        artwork.medium
          ?.toLowerCase()
          .includes(galleryFilter.medium!.toLowerCase())
      )
    }

    // 검색 쿼리 필터
    if (galleryFilter.searchQuery) {
      const query = galleryFilter.searchQuery.toLowerCase()
      filtered = filtered.filter((artwork) => {
        const searchableText = [
          artwork.title,
          artwork.description,
          artwork.artistNote,
          artwork.medium,
          artwork.technique,
          artwork.series,
          artwork.year?.toString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(query)
      })
    }

    // 정렬
    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = galleryFilter
      let comparison = 0

      switch (sortBy) {
        case 'year':
          comparison = (a.year || 0) - (b.year || 0)
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '', 'ko-KR')
          break
        case 'medium':
          comparison = (a.medium || '').localeCompare(b.medium || '', 'ko-KR')
          break
        default:
          comparison = 0
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [artworks, galleryFilter])

  // 사용 가능한 연도 목록
  const availableYears = useMemo(() => {
    const years = artworks
      .map((artwork) => artwork.year?.toString())
      .filter((year): year is string => Boolean(year))
      .filter((year, index, array) => array.indexOf(year) === index)

    return years.sort((a, b) => parseInt(b) - parseInt(a))
  }, [artworks])

  // 사용 가능한 재료/기법 목록
  const availableMediums = useMemo(() => {
    const mediums = artworks
      .map((artwork) => artwork.medium)
      .filter((medium): medium is string => Boolean(medium))
      .filter((medium, index, array) => array.indexOf(medium) === index)

    return mediums.sort((a, b) => a.localeCompare(b, 'ko-KR'))
  }, [artworks])

  // 필터가 적용되었는지 확인
  const isFiltered = useMemo(() => {
    return Boolean(
      galleryFilter.year || galleryFilter.medium || galleryFilter.searchQuery
    )
  }, [galleryFilter])

  // 검색 결과가 있는지 확인
  const hasResults = filteredArtworks.length > 0

  return {
    filteredArtworks,
    totalCount: filteredArtworks.length,
    availableYears,
    availableMediums,
    isFiltered,
    hasResults,
  }
}

// 갤러리 페이지네이션 훅
export interface UseGalleryPaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

export interface UseGalleryPaginationReturn {
  currentPage: number
  totalPages: number
  paginatedItems: Artwork[]
  hasNextPage: boolean
  hasPrevPage: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirst: () => void
  goToLast: () => void
}

export function useGalleryPagination(
  items: Artwork[],
  options: UseGalleryPaginationOptions = {}
): UseGalleryPaginationReturn {
  const { itemsPerPage = 12, initialPage = 1 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)

  // 페이지 수 계산
  const totalPages = Math.ceil(items.length / itemsPerPage)

  // 현재 페이지의 아이템들
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  // 페이지 네비게이션 함수들
  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(clampedPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToFirst = () => setCurrentPage(1)
  const goToLast = () => setCurrentPage(totalPages)

  // 아이템이 변경되면 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  // 현재 페이지가 총 페이지를 초과하면 마지막 페이지로 이동
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
  }
}

// 갤러리 통계 훅
export interface UseGalleryStatsReturn {
  totalArtworks: number
  artworksByYear: Record<string, number>
  artworksByMedium: Record<string, number>
  yearRange: {
    earliest: number | null
    latest: number | null
  }
  averagePerYear: number
}

export function useGalleryStats(artworks: Artwork[]): UseGalleryStatsReturn {
  return useMemo(() => {
    const totalArtworks = artworks.length

    // 연도별 작품 수
    const artworksByYear = artworks.reduce(
      (acc, artwork) => {
        const year = artwork.year?.toString()
        if (year) {
          acc[year] = (acc[year] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    // 재료별 작품 수
    const artworksByMedium = artworks.reduce(
      (acc, artwork) => {
        const medium = artwork.medium
        if (medium) {
          acc[medium] = (acc[medium] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    // 연도 범위
    const years = artworks
      .map((artwork) => artwork.year)
      .filter((year): year is number => typeof year === 'number')

    const yearRange = {
      earliest: years.length > 0 ? Math.min(...years) : null,
      latest: years.length > 0 ? Math.max(...years) : null,
    }

    // 연간 평균 작품 수
    const yearSpan =
      yearRange.latest && yearRange.earliest
        ? yearRange.latest - yearRange.earliest + 1
        : 1
    const averagePerYear = totalArtworks / yearSpan

    return {
      totalArtworks,
      artworksByYear,
      artworksByMedium,
      yearRange,
      averagePerYear,
    }
  }, [artworks])
}
