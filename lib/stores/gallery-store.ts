import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Artwork, Artist } from '@/lib/types'

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
  
  // User preferences
  preferences: {
    autoplay: boolean
    showMetadata: boolean
    animationSpeed: 'slow' | 'normal' | 'fast'
    theme: 'light' | 'dark' | 'auto'
  }
  
  // Performance tracking
  performance: {
    lastSectionChange: number
    sectionViewTimes: Record<string, number>
    totalSessionTime: number
    artworksViewed: Set<string>
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
  
  // Performance actions
  trackSectionView: (section: string) => void
  trackArtworkView: (artworkId: string) => void
  getViewingStats: () => {
    sectionsVisited: number
    artworksViewed: number
    averageViewTime: number
    totalTime: number
  }
  
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
    theme: 'auto'
  },
  performance: {
    lastSectionChange: Date.now(),
    sectionViewTimes: {},
    totalSessionTime: 0,
    artworksViewed: new Set()
  }
}

// Create the store
export const useGalleryStore = create<GalleryState & GalleryActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Navigation actions
        setCurrentSection: (section) => {
          const state = get()
          const now = Date.now()
          const timeDiff = now - state.performance.lastSectionChange
          
          set((state) => ({
            currentSection: section,
            performance: {
              ...state.performance,
              lastSectionChange: now,
              sectionViewTimes: {
                ...state.performance.sectionViewTimes,
                [state.currentSection]: (state.performance.sectionViewTimes[state.currentSection] || 0) + timeDiff
              },
              totalSessionTime: state.performance.totalSessionTime + timeDiff
            }
          }))
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
          const index = state.artworks.findIndex(a => a.id === artwork.id)
          
          set({
            selectedArtwork: artwork,
            currentArtworkIndex: index,
            modalHistory: [...state.modalHistory, artwork].slice(-10) // Keep last 10
          })
          
          get().trackArtworkView(artwork.id)
        },

        nextArtwork: () => {
          const state = get()
          if (state.filteredArtworks.length === 0) return
          
          const nextIndex = state.currentArtworkIndex < state.filteredArtworks.length - 1 
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
          
          const prevIndex = state.currentArtworkIndex > 0 
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
            currentArtworkIndex: 0
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
            selectedMedium: null
          })
          get().updateFilteredArtworks()
        },

        updateFilteredArtworks: () => {
          const state = get()
          
          let filtered = state.artworks.filter(artwork => {
            const matchesSearch = !state.searchTerm || 
              artwork.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              artwork.medium.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              (artwork.description && artwork.description.toLowerCase().includes(state.searchTerm.toLowerCase()))
            
            const matchesYear = state.selectedYear === null || artwork.year === state.selectedYear
            const matchesMedium = state.selectedMedium === null || artwork.medium === state.selectedMedium
            
            return matchesSearch && matchesYear && matchesMedium
          })
          
          set({ filteredArtworks: filtered })
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
              ...newPreferences
            }
          }))
        },

        // Performance actions
        trackSectionView: (section) => {
          const now = Date.now()
          set((state) => ({
            performance: {
              ...state.performance,
              sectionViewTimes: {
                ...state.performance.sectionViewTimes,
                [section]: now
              }
            }
          }))
        },

        trackArtworkView: (artworkId) => {
          set((state) => ({
            performance: {
              ...state.performance,
              artworksViewed: new Set([...(state.performance.artworksViewed || []), artworkId])
            }
          }))
        },

        getViewingStats: () => {
          const state = get()
          const sectionsVisited = Object.keys(state.performance?.sectionViewTimes || {}).length
          const artworksViewed = (state.performance?.artworksViewed || new Set()).size
          const totalTime = state.performance?.totalSessionTime || 0
          const averageViewTime = sectionsVisited > 0 ? totalTime / sectionsVisited : 0
          
          return {
            sectionsVisited,
            artworksViewed,
            averageViewTime,
            totalTime
          }
        },

        // Utility actions
        reset: () => {
          set(initialState)
        }
      }),
      {
        name: 'anam-gallery-store',
        partialize: (state) => ({
          preferences: state.preferences,
          modalHistory: state.modalHistory.slice(-5), // Persist only last 5
          performance: {
            sectionViewTimes: state.performance.sectionViewTimes,
            totalSessionTime: state.performance.totalSessionTime,
            artworksViewed: Array.from(state.performance.artworksViewed) // Serialize Set
          }
        }),
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.warn('Error during store rehydration:', error)
              return
            }
            
            // Safely rehydrate state
            if (state) {
              try {
                // Convert persisted array back to Set
                if (state.performance?.artworksViewed && Array.isArray(state.performance.artworksViewed)) {
                  state.performance.artworksViewed = new Set(state.performance.artworksViewed)
                } else if (!state.performance?.artworksViewed) {
                  // Initialize as empty Set if missing
                  if (state.performance) {
                    state.performance.artworksViewed = new Set()
                  }
                }
                
                // Ensure lastSectionChange is properly initialized
                if (!state.performance?.lastSectionChange) {
                  if (state.performance) {
                    state.performance.lastSectionChange = Date.now()
                  }
                }
                
                // Ensure all required state is present
                if (!state.preferences) {
                  state.preferences = initialState.preferences
                }
                
                if (!state.performance) {
                  state.performance = {
                    ...initialState.performance,
                    lastSectionChange: Date.now()
                  }
                }
              } catch (error) {
                console.warn('Error rehydrating gallery store:', error)
                // Reset to safe defaults on error
                if (state.performance) {
                  state.performance = {
                    lastSectionChange: Date.now(),
                    sectionViewTimes: {},
                    totalSessionTime: 0,
                    artworksViewed: new Set()
                  }
                }
              }
            }
          }
        }
      }
    ),
    { name: 'gallery-store' }
  )
)

// Selector hooks for performance
export const useCurrentSection = () => useGalleryStore(state => state.currentSection)
export const useArtworks = () => useGalleryStore(state => state.filteredArtworks)
export const useSelectedArtwork = () => useGalleryStore(state => state.selectedArtwork)
export const useModalState = () => useGalleryStore(state => ({ 
  isOpen: state.isModalOpen, 
  artwork: state.selectedArtwork 
}))
export const useGalleryFilters = () => useGalleryStore(state => ({
  searchTerm: state.searchTerm,
  selectedYear: state.selectedYear,
  selectedMedium: state.selectedMedium
}))
export const usePreferences = () => useGalleryStore(state => state.preferences)