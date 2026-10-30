import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { Artwork, Artist } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

// Gallery state interface
interface GalleryState {
  // Navigation state
  currentSection: string
  isNavigating: boolean

  // Artwork data
  artworks: Artwork[]
  selectedArtwork: Artwork | null
  currentArtworkIndex: number

  // Gallery filters and search
  searchTerm: string
  selectedYear: number | null
  selectedMedium: string | null
  filteredArtworks: Artwork[]

  // Modal state
  isModalOpen: boolean
  modalHistory: Artwork[]

  // Artist data
  artist: Artist | null

  // User preferences (simplified - no persistence)
  preferences: {
    autoplay: boolean
    showMetadata: boolean
    animationSpeed: 'slow' | 'normal' | 'fast'
    theme: 'light' | 'dark' | 'auto'
  }
}

// Gallery actions interface
interface GalleryActions {
  // Navigation actions
  setCurrentSection: (section: string) => void
  navigateToSection: (section: string) => void

  // Artwork actions
  setArtworks: (artworks: Artwork[]) => void
  selectArtwork: (artwork: Artwork) => void
  nextArtwork: () => void
  previousArtwork: () => void
  closeArtwork: () => void

  // Search and filter actions
  setSearchTerm: (term: string) => void
  setSelectedYear: (year: number | null) => void
  setSelectedMedium: (medium: string | null) => void
  clearFilters: () => void
  updateFilteredArtworks: () => void

  // Modal actions
  openModal: (artwork: Artwork) => void
  closeModal: () => void

  // Artist actions
  setArtist: (artist: Artist | null) => void

  // Preference actions
  updatePreferences: (preferences: Partial<GalleryState['preferences']>) => void

  // Performance actions (simplified)
  trackSectionView: (section: string) => void
  trackArtworkView: (artworkId: string) => void

  // Utility actions
  reset: () => void
}

// Initial state
const initialState: GalleryState = {
  currentSection: 'hero',
  isNavigating: false,
  artworks: [],
  selectedArtwork: null,
  currentArtworkIndex: 0,
  searchTerm: '',
  selectedYear: null,
  selectedMedium: null,
  filteredArtworks: [],
  isModalOpen: false,
  modalHistory: [],
  artist: null,
  preferences: {
    autoplay: false,
    showMetadata: true,
    animationSpeed: 'normal',
    theme: 'auto',
  },
}

export interface ArtworkFilters {
  searchTerm: string
  selectedYear: number | null
  selectedMedium: string | null
}

// 스토어와 GallerySection의 동기화 전 첫 렌더가 같은 규칙으로 거르도록 순수 함수로 둔다
export function filterArtworks(
  artworks: Artwork[],
  { searchTerm, selectedYear, selectedMedium }: ArtworkFilters
): Artwork[] {
  const term = searchTerm.toLowerCase()

  return artworks.filter((artwork) => {
    const matchesSearch =
      !term ||
      artwork.title.toLowerCase().includes(term) ||
      artwork.medium.toLowerCase().includes(term) ||
      (artwork.description && artwork.description.toLowerCase().includes(term))

    const matchesYear = selectedYear === null || artwork.year === selectedYear
    const matchesMedium =
      selectedMedium === null || artwork.medium === selectedMedium

    return matchesSearch && matchesYear && matchesMedium
  })
}

// Create the store WITHOUT persistence to avoid hydration issues
export const useGalleryStore = create<GalleryState & GalleryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Navigation actions
      setCurrentSection: (section) => {
        set({ currentSection: section })
      },

      navigateToSection: (section) => {
        set({ isNavigating: true })

        // Only run DOM operations on client side
        if (typeof window !== 'undefined') {
          // Smooth scroll to section
          const element = document.getElementById(section)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }

        setTimeout(() => {
          get().setCurrentSection(section)
          set({ isNavigating: false })
        }, 800) // Match scroll animation duration
      },

      // Artwork actions
      setArtworks: (artworks) => {
        set({ artworks })
        get().updateFilteredArtworks()
      },

      selectArtwork: (artwork) => {
        const state = get()
        const index = state.artworks.findIndex((a) => a.id === artwork.id)

        set({
          selectedArtwork: artwork,
          currentArtworkIndex: index,
          modalHistory: [...state.modalHistory, artwork].slice(-10), // Keep last 10
        })

        get().trackArtworkView(artwork.id)
      },

      nextArtwork: () => {
        const state = get()
        if (state.filteredArtworks.length === 0) return

        const nextIndex =
          state.currentArtworkIndex < state.filteredArtworks.length - 1
            ? state.currentArtworkIndex + 1
            : 0
        const nextArtwork = state.filteredArtworks[nextIndex]

        if (nextArtwork) {
          get().selectArtwork(nextArtwork)
        }
      },

      previousArtwork: () => {
        const state = get()
        if (state.filteredArtworks.length === 0) return

        const prevIndex =
          state.currentArtworkIndex > 0
            ? state.currentArtworkIndex - 1
            : state.filteredArtworks.length - 1
        const prevArtwork = state.filteredArtworks[prevIndex]

        if (prevArtwork) {
          get().selectArtwork(prevArtwork)
        }
      },

      closeArtwork: () => {
        set({
          selectedArtwork: null,
          currentArtworkIndex: 0,
        })
      },

      // Search and filter actions
      setSearchTerm: (term) => {
        set({ searchTerm: term })
        get().updateFilteredArtworks()
      },

      setSelectedYear: (year) => {
        set({ selectedYear: year })
        get().updateFilteredArtworks()
      },

      setSelectedMedium: (medium) => {
        set({ selectedMedium: medium })
        get().updateFilteredArtworks()
      },

      clearFilters: () => {
        set({
          searchTerm: '',
          selectedYear: null,
          selectedMedium: null,
        })
        get().updateFilteredArtworks()
      },

      updateFilteredArtworks: () => {
        const state = get()
        set({ filteredArtworks: filterArtworks(state.artworks, state) })
      },

      // Modal actions
      openModal: (artwork) => {
        get().selectArtwork(artwork)
        set({ isModalOpen: true })
      },

      closeModal: () => {
        set({ isModalOpen: false })
        get().closeArtwork()
      },

      // Artist actions
      setArtist: (artist) => {
        set({ artist })
      },

      // Preference actions
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        }))
      },

      // Performance actions (simplified)
      trackSectionView: (section) => {
        // Simple console logging instead of complex state tracking
        console.log('Section viewed:', section)
      },

      trackArtworkView: (artworkId) => {
        // Simple console logging instead of complex state tracking
        console.log('Artwork viewed:', artworkId)
      },

      // Utility actions
      reset: () => {
        set(initialState)
      },
    }),
    { name: 'gallery-store-safe' }
  )
)

// Optimized selector hooks for performance - prevent over-subscription
export const useCurrentSection = () =>
  useGalleryStore(useCallback((state) => state.currentSection, []))
export const useArtworks = () =>
  useGalleryStore(useCallback((state) => state.filteredArtworks, []))
export const useSelectedArtwork = () =>
  useGalleryStore(useCallback((state) => state.selectedArtwork, []))
// 객체를 반환하는 셀렉터는 useShallow로 감싼다: zustand v5는 Object.is로 비교하므로
// 매번 새 객체를 돌려주면 렌더마다 스냅샷이 바뀌어 무한 렌더(React #185)가 난다
export const useModalState = () =>
  useGalleryStore(
    useShallow((state) => ({
      isOpen: state.isModalOpen,
      artwork: state.selectedArtwork,
    }))
  )
export const useGalleryFilters = () =>
  useGalleryStore(
    useShallow((state) => ({
      searchTerm: state.searchTerm,
      selectedYear: state.selectedYear,
      selectedMedium: state.selectedMedium,
    }))
  )
export const usePreferences = () =>
  useGalleryStore(useCallback((state) => state.preferences, []))

// Safe wrapper hook to prevent hydration issues
export function useSafeGalleryStore() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const store = useGalleryStore()

  // Return default state during SSR
  if (!mounted) {
    return {
      ...initialState,
      // Safe no-op functions
      setCurrentSection: () => {},
      navigateToSection: () => {},
      setArtworks: () => {},
      selectArtwork: () => {},
      nextArtwork: () => {},
      previousArtwork: () => {},
      closeArtwork: () => {},
      setSearchTerm: () => {},
      setSelectedYear: () => {},
      setSelectedMedium: () => {},
      clearFilters: () => {},
      updateFilteredArtworks: () => {},
      openModal: () => {},
      closeModal: () => {},
      setArtist: () => {},
      updatePreferences: () => {},
      trackSectionView: () => {},
      trackArtworkView: () => {},
      reset: () => {},
    }
  }

  return store
}
