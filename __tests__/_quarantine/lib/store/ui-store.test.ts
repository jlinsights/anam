import { renderHook, act } from '@testing-library/react'
import {
  useUIStore,
  useTheme,
  useLanguage,
  useNavigation,
  useGallery,
  useLoading,
  useError,
} from '@/lib/store/ui-store'

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('UI Store', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    const { result } = renderHook(() => useUIStore((state) => state))
    act(() => {
      result.current.reset()
    })
    jest.clearAllMocks()
  })

  describe('초기 상태', () => {
    it('기본 테마가 system으로 설정되어야 한다', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('system')
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('기본 언어가 ko로 설정되어야 한다', () => {
      const { result } = renderHook(() => useLanguage())
      expect(result.current.language).toBe('ko')
    })

    it('모바일 메뉴가 닫혀있어야 한다', () => {
      const { result } = renderHook(() => useNavigation())
      expect(result.current.isMobileMenuOpen).toBe(false)
      expect(result.current.isSearchOpen).toBe(false)
    })

    it('갤러리 필터가 기본값으로 설정되어야 한다', () => {
      const { result } = renderHook(() => useGallery())
      expect(result.current.galleryFilter.sortBy).toBe('year')
      expect(result.current.galleryFilter.sortOrder).toBe('desc')
      expect(result.current.selectedArtworkId).toBeNull()
      expect(result.current.isLightboxOpen).toBe(false)
    })

    it('로딩 상태가 false여야 한다', () => {
      const { result } = renderHook(() => useLoading())
      expect(result.current.isLoading).toBe(false)
      expect(result.current.loadingMessage).toBe('')
    })

    it('에러가 없어야 한다', () => {
      const { result } = renderHook(() => useError())
      expect(result.current.error).toBeNull()
    })
  })

  describe('테마 관리', () => {
    it('테마를 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('dark')
      })

      expect(result.current.theme).toBe('dark')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    it('시스템 테마 설정 시 실제 테마를 감지해야 한다', () => {
      // matchMedia가 dark 모드를 반환하도록 설정
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('system')
      })

      expect(result.current.theme).toBe('system')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    it('테마를 토글할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTheme())

      // 먼저 light로 설정
      act(() => {
        result.current.setTheme('light')
      })

      // 토글
      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
      expect(result.current.resolvedTheme).toBe('dark')

      // 다시 토글
      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
    })
  })

  describe('언어 관리', () => {
    it('언어를 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useLanguage())

      act(() => {
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
    })

    it('모든 지원 언어로 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useLanguage())
      const supportedLanguages = ['ko', 'en', 'ja', 'zh'] as const

      supportedLanguages.forEach((lang) => {
        act(() => {
          result.current.setLanguage(lang)
        })
        expect(result.current.language).toBe(lang)
      })
    })
  })

  describe('네비게이션 관리', () => {
    it('모바일 메뉴를 토글할 수 있어야 한다', () => {
      const { result } = renderHook(() => useNavigation())

      expect(result.current.isMobileMenuOpen).toBe(false)

      act(() => {
        result.current.toggleMobileMenu()
      })

      expect(result.current.isMobileMenuOpen).toBe(true)

      act(() => {
        result.current.toggleMobileMenu()
      })

      expect(result.current.isMobileMenuOpen).toBe(false)
    })

    it('모바일 메뉴를 닫을 수 있어야 한다', () => {
      const { result } = renderHook(() => useNavigation())

      // 먼저 열기
      act(() => {
        result.current.toggleMobileMenu()
      })
      expect(result.current.isMobileMenuOpen).toBe(true)

      // 닫기
      act(() => {
        result.current.closeMobileMenu()
      })
      expect(result.current.isMobileMenuOpen).toBe(false)
    })

    it('검색 모달을 토글할 수 있어야 한다', () => {
      const { result } = renderHook(() => useNavigation())

      expect(result.current.isSearchOpen).toBe(false)

      act(() => {
        result.current.toggleSearch()
      })

      expect(result.current.isSearchOpen).toBe(true)

      act(() => {
        result.current.closeSearch()
      })

      expect(result.current.isSearchOpen).toBe(false)
    })
  })

  describe('갤러리 관리', () => {
    it('갤러리 필터를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useGallery())

      const newFilter = {
        year: '2024',
        medium: '한지에 먹',
        searchQuery: '길',
      }

      act(() => {
        result.current.setGalleryFilter(newFilter)
      })

      expect(result.current.galleryFilter.year).toBe('2024')
      expect(result.current.galleryFilter.medium).toBe('한지에 먹')
      expect(result.current.galleryFilter.searchQuery).toBe('길')
    })

    it('갤러리 필터를 부분적으로 업데이트할 수 있어야 한다', () => {
      const { result } = renderHook(() => useGallery())

      // 먼저 일부 필터 설정
      act(() => {
        result.current.setGalleryFilter({ year: '2024' })
      })
      expect(result.current.galleryFilter.year).toBe('2024')

      // 다른 필터 추가 (기존 필터는 유지)
      act(() => {
        result.current.setGalleryFilter({ medium: '한지에 먹' })
      })
      expect(result.current.galleryFilter.year).toBe('2024')
      expect(result.current.galleryFilter.medium).toBe('한지에 먹')
    })

    it('갤러리 필터를 초기화할 수 있어야 한다', () => {
      const { result } = renderHook(() => useGallery())

      // 필터 설정
      act(() => {
        result.current.setGalleryFilter({
          year: '2024',
          medium: '한지에 먹',
          searchQuery: '길',
        })
      })

      // 초기화
      act(() => {
        result.current.resetGalleryFilter()
      })

      expect(result.current.galleryFilter.year).toBeUndefined()
      expect(result.current.galleryFilter.medium).toBeUndefined()
      expect(result.current.galleryFilter.searchQuery).toBeUndefined()
      expect(result.current.galleryFilter.sortBy).toBe('year')
      expect(result.current.galleryFilter.sortOrder).toBe('desc')
    })

    it('라이트박스를 열고 닫을 수 있어야 한다', () => {
      const { result } = renderHook(() => useGallery())

      expect(result.current.isLightboxOpen).toBe(false)
      expect(result.current.selectedArtworkId).toBeNull()

      // 라이트박스 열기
      act(() => {
        result.current.openLightbox('artwork-1')
      })

      expect(result.current.isLightboxOpen).toBe(true)
      expect(result.current.selectedArtworkId).toBe('artwork-1')

      // 라이트박스 닫기
      act(() => {
        result.current.closeLightbox()
      })

      expect(result.current.isLightboxOpen).toBe(false)
      expect(result.current.selectedArtworkId).toBeNull()
    })

    it('선택된 작품을 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useGallery())

      act(() => {
        result.current.setSelectedArtwork('artwork-2')
      })

      expect(result.current.selectedArtworkId).toBe('artwork-2')

      act(() => {
        result.current.setSelectedArtwork(null)
      })

      expect(result.current.selectedArtworkId).toBeNull()
    })
  })

  describe('로딩 관리', () => {
    it('로딩 상태를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.setLoading(true, '작품을 불러오는 중...')
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.loadingMessage).toBe('작품을 불러오는 중...')

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.loadingMessage).toBe('')
    })
  })

  describe('에러 관리', () => {
    it('에러를 설정하고 지울 수 있어야 한다', () => {
      const { result } = renderHook(() => useError())

      act(() => {
        result.current.setError('작품을 불러올 수 없습니다.')
      })

      expect(result.current.error).toBe('작품을 불러올 수 없습니다.')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('스토어 초기화', () => {
    it('reset 함수로 모든 상태를 초기값으로 되돌릴 수 있어야 한다', () => {
      const { result } = renderHook(() => useUIStore((state) => state))

      // 여러 상태 변경
      act(() => {
        result.current.setTheme('dark')
        result.current.setLanguage('en')
        result.current.toggleMobileMenu()
        result.current.setGalleryFilter({ year: '2024' })
        result.current.setLoading(true, '로딩 중...')
        result.current.setError('에러 발생')
      })

      // 상태가 변경되었는지 확인
      expect(result.current.theme).toBe('dark')
      expect(result.current.language).toBe('en')
      expect(result.current.isMobileMenuOpen).toBe(true)
      expect(result.current.galleryFilter.year).toBe('2024')
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe('에러 발생')

      // 초기화
      act(() => {
        result.current.reset()
      })

      // 모든 상태가 초기값으로 되돌아왔는지 확인
      expect(result.current.theme).toBe('system')
      expect(result.current.language).toBe('ko')
      expect(result.current.isMobileMenuOpen).toBe(false)
      expect(result.current.galleryFilter.year).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })
})
