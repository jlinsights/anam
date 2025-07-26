/**
 * HEELANG UI 상태 관리 스토어
 * Zustand를 사용한 전역 상태 관리
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useEffect } from 'react'

// 테마 관련 타입
export type Theme = 'light' | 'dark' | 'system'

// 언어 관련 타입
export type Language = 'ko' | 'en' | 'ja' | 'zh'

// 갤러리 필터 타입
export interface GalleryFilter {
  year?: string
  medium?: string
  searchQuery?: string
  sortBy: 'year' | 'title' | 'medium'
  sortOrder: 'asc' | 'desc'
}

// UI 상태 인터페이스
interface UIState {
  // 테마 상태
  theme: Theme
  resolvedTheme: 'light' | 'dark'

  // 언어 상태
  language: Language

  // 네비게이션 상태
  isMobileMenuOpen: boolean
  isSearchOpen: boolean

  // 갤러리 상태
  galleryFilter: GalleryFilter
  selectedArtworkId: string | null
  isLightboxOpen: boolean

  // 로딩 상태
  isLoading: boolean
  loadingMessage: string

  // 오류 상태
  error: string | null

  // 사용자 설정
  preferences: {
    reducedMotion: boolean
    autoplaySlideshow: boolean
    showArtworkDetails: boolean
    gridSize: 'small' | 'medium' | 'large'
  }
}

// 액션 인터페이스
interface UIActions {
  // 테마 액션
  setTheme: (theme: Theme) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void

  // 언어 액션
  setLanguage: (language: Language) => void

  // 네비게이션 액션
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleSearch: () => void
  closeSearch: () => void

  // 갤러리 액션
  setGalleryFilter: (filter: Partial<GalleryFilter>) => void
  resetGalleryFilter: () => void
  setSelectedArtwork: (id: string | null) => void
  openLightbox: (artworkId: string) => void
  closeLightbox: () => void

  // 로딩 액션
  setLoading: (loading: boolean, message?: string) => void

  // 오류 액션
  setError: (error: string | null) => void
  clearError: () => void

  // 사용자 설정 액션
  setPreference: <K extends keyof UIState['preferences']>(
    key: K,
    value: UIState['preferences'][K]
  ) => void
  togglePreference: (
    key: keyof Omit<UIState['preferences'], 'gridSize'>
  ) => void

  // 유틸리티 액션
  reset: () => void
}

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
  preferences: {
    reducedMotion: false,
    autoplaySlideshow: true,
    showArtworkDetails: true,
    gridSize: 'medium',
  },
}

// 스토어 생성
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 테마 액션
        setTheme: (theme) => {
          set({ theme }, false, 'setTheme')

          // 시스템 테마인 경우 실제 테마 감지
          if (theme === 'system') {
            const systemTheme = window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches
              ? 'dark'
              : 'light'
            set({ resolvedTheme: systemTheme }, false, 'setResolvedTheme')
          } else {
            set({ resolvedTheme: theme }, false, 'setResolvedTheme')
          }
        },

        setResolvedTheme: (resolvedTheme) => {
          set({ resolvedTheme }, false, 'setResolvedTheme')
        },

        toggleTheme: () => {
          const { theme, resolvedTheme } = get()
          if (theme === 'system') {
            // 시스템 테마에서 토글하면 반대 테마로 설정
            const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
            set(
              { theme: newTheme, resolvedTheme: newTheme },
              false,
              'toggleTheme'
            )
          } else {
            // 수동 테마에서 토글
            const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
            set(
              { theme: newTheme, resolvedTheme: newTheme },
              false,
              'toggleTheme'
            )
          }
        },

        // 언어 액션
        setLanguage: (language) => {
          set({ language }, false, 'setLanguage')
        },

        // 네비게이션 액션
        toggleMobileMenu: () => {
          set(
            (state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }),
            false,
            'toggleMobileMenu'
          )
        },

        closeMobileMenu: () => {
          set({ isMobileMenuOpen: false }, false, 'closeMobileMenu')
        },

        toggleSearch: () => {
          set(
            (state) => ({ isSearchOpen: !state.isSearchOpen }),
            false,
            'toggleSearch'
          )
        },

        closeSearch: () => {
          set({ isSearchOpen: false }, false, 'closeSearch')
        },

        // 갤러리 액션
        setGalleryFilter: (filter) => {
          set(
            (state) => ({
              galleryFilter: { ...state.galleryFilter, ...filter },
            }),
            false,
            'setGalleryFilter'
          )
        },

        resetGalleryFilter: () => {
          set(
            {
              galleryFilter: {
                sortBy: 'year',
                sortOrder: 'desc',
              },
            },
            false,
            'resetGalleryFilter'
          )
        },

        setSelectedArtwork: (selectedArtworkId) => {
          set({ selectedArtworkId }, false, 'setSelectedArtwork')
        },

        openLightbox: (artworkId) => {
          set(
            {
              selectedArtworkId: artworkId,
              isLightboxOpen: true,
            },
            false,
            'openLightbox'
          )
        },

        closeLightbox: () => {
          set(
            {
              isLightboxOpen: false,
              selectedArtworkId: null,
            },
            false,
            'closeLightbox'
          )
        },

        // 로딩 액션
        setLoading: (isLoading, loadingMessage = '') => {
          set({ isLoading, loadingMessage }, false, 'setLoading')
        },

        // 오류 액션
        setError: (error) => {
          set({ error }, false, 'setError')
        },

        clearError: () => {
          set({ error: null }, false, 'clearError')
        },

        // 사용자 설정 액션
        setPreference: (key, value) => {
          set(
            (state) => ({
              preferences: { ...state.preferences, [key]: value },
            }),
            false,
            'setPreference'
          )
        },

        togglePreference: (key) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                [key]: !state.preferences[key],
              },
            }),
            false,
            'togglePreference'
          )
        },

        // 유틸리티 액션
        reset: () => {
          set(initialState, false, 'reset')
        },
      }),
      {
        name: 'heelang-ui-store',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          preferences: state.preferences,
          galleryFilter: state.galleryFilter,
        }),
      }
    ),
    { name: 'HEELANG UI Store' }
  )
)

// 선택자 함수들 (성능 최적화)
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

export const usePreferences = () =>
  useUIStore((state) => ({
    preferences: state.preferences,
    setPreference: state.setPreference,
    togglePreference: state.togglePreference,
  }))

// 사용자 정의 훅 - 시스템 테마 감지
export const useSystemTheme = () => {
  const setResolvedTheme = useUIStore((state) => state.setResolvedTheme)
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light')
    }

    // 초기 설정
    setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')

    // 리스너 등록
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, setResolvedTheme])
}

// 개발자 도구용 유틸리티
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).UIStore = useUIStore
}
