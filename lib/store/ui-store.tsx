'use client'

/**
 * Simplified UI Store using React Context
 * Compatible with Next.js webpack module loading
 */

import { createContext, useContext, useState, ReactNode } from 'react'

// 타입 정의
export type Theme = 'light' | 'dark' | 'system'
export type Language = 'ko' | 'en' | 'ja' | 'zh'

export interface GalleryFilter {
  year?: string
  medium?: string
  searchQuery?: string
  sortBy: 'year' | 'title' | 'medium'
  sortOrder: 'asc' | 'desc'
}

interface UIState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  language: Language
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  galleryFilter: GalleryFilter
  selectedArtworkId: string | null
  isLightboxOpen: boolean
  isLoading: boolean
  loadingMessage: string
  error: string | null
}

interface UIActions {
  setTheme: (theme: Theme) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleSearch: () => void
  closeSearch: () => void
  setGalleryFilter: (filter: Partial<GalleryFilter>) => void
  resetGalleryFilter: () => void
  setSelectedArtwork: (id: string | null) => void
  openLightbox: (artworkId: string) => void
  closeLightbox: () => void
  setLoading: (loading: boolean, message?: string) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

type UIContextType = UIState & UIActions

// 초기 상태
const initialState: UIState = {
  theme: 'system',
  resolvedTheme: 'light',
  language: 'ko',
  isMobileMenuOpen: false,
  isSearchOpen: false,
  galleryFilter: {
    sortBy: 'year',
    sortOrder: 'desc',
  },
  selectedArtworkId: null,
  isLightboxOpen: false,
  isLoading: false,
  loadingMessage: '',
  error: null,
}

// Context 생성
const UIContext = createContext<UIContextType | undefined>(undefined)

// Provider 컴포넌트
export function UIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState)

  // 액션 함수들
  const actions: UIActions = {
    setTheme: (theme) => {
      setState((prev) => {
        if (theme === 'system') {
          const systemTheme =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
          return { ...prev, theme, resolvedTheme: systemTheme }
        } else {
          return { ...prev, theme, resolvedTheme: theme }
        }
      })
    },

    setResolvedTheme: (resolvedTheme) => {
      setState((prev) => ({ ...prev, resolvedTheme }))
    },

    toggleTheme: () => {
      setState((prev) => {
        const newTheme = prev.resolvedTheme === 'light' ? 'dark' : 'light'
        return { ...prev, theme: newTheme, resolvedTheme: newTheme }
      })
    },

    setLanguage: (language) => {
      setState((prev) => ({ ...prev, language }))
    },

    toggleMobileMenu: () => {
      setState((prev) => ({
        ...prev,
        isMobileMenuOpen: !prev.isMobileMenuOpen,
      }))
    },

    closeMobileMenu: () => {
      setState((prev) => ({ ...prev, isMobileMenuOpen: false }))
    },

    toggleSearch: () => {
      setState((prev) => ({ ...prev, isSearchOpen: !prev.isSearchOpen }))
    },

    closeSearch: () => {
      setState((prev) => ({ ...prev, isSearchOpen: false }))
    },

    setGalleryFilter: (filter) => {
      setState((prev) => ({
        ...prev,
        galleryFilter: { ...prev.galleryFilter, ...filter },
      }))
    },

    resetGalleryFilter: () => {
      setState((prev) => ({
        ...prev,
        galleryFilter: { sortBy: 'year', sortOrder: 'desc' },
      }))
    },

    setSelectedArtwork: (id) => {
      setState((prev) => ({ ...prev, selectedArtworkId: id }))
    },

    openLightbox: (artworkId) => {
      setState((prev) => ({
        ...prev,
        selectedArtworkId: artworkId,
        isLightboxOpen: true,
      }))
    },

    closeLightbox: () => {
      setState((prev) => ({
        ...prev,
        isLightboxOpen: false,
        selectedArtworkId: null,
      }))
    },

    setLoading: (loading, message = '') => {
      setState((prev) => ({
        ...prev,
        isLoading: loading,
        loadingMessage: message,
      }))
    },

    setError: (error) => {
      setState((prev) => ({ ...prev, error }))
    },

    clearError: () => {
      setState((prev) => ({ ...prev, error: null }))
    },

    reset: () => {
      setState(initialState)
    },
  }

  const contextValue: UIContextType = {
    ...state,
    ...actions,
  }

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  )
}

// 기본 훅
export function useUIStore<T>(selector: (state: UIContextType) => T): T {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUIStore must be used within a UIProvider')
  }
  return selector(context)
}

// 선택자 훅들
export const useTheme = () =>
  useUIStore((state) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
  }))

export const useLanguage = () =>
  useUIStore((state) => ({
    language: state.language,
    setLanguage: state.setLanguage,
  }))

export const useNavigation = () =>
  useUIStore((state) => ({
    isMobileMenuOpen: state.isMobileMenuOpen,
    isSearchOpen: state.isSearchOpen,
    toggleMobileMenu: state.toggleMobileMenu,
    closeMobileMenu: state.closeMobileMenu,
    toggleSearch: state.toggleSearch,
    closeSearch: state.closeSearch,
  }))

export const useGallery = () =>
  useUIStore((state) => ({
    galleryFilter: state.galleryFilter,
    selectedArtworkId: state.selectedArtworkId,
    isLightboxOpen: state.isLightboxOpen,
    setGalleryFilter: state.setGalleryFilter,
    resetGalleryFilter: state.resetGalleryFilter,
    setSelectedArtwork: state.setSelectedArtwork,
    openLightbox: state.openLightbox,
    closeLightbox: state.closeLightbox,
  }))

export const useLoading = () =>
  useUIStore((state) => ({
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
    setLoading: state.setLoading,
  }))

export const useError = () =>
  useUIStore((state) => ({
    error: state.error,
    setError: state.setError,
    clearError: state.clearError,
  }))
