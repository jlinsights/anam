import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { OptimizedGallery } from '@/components/optimized-gallery'
import { EnhancedGalleryComponent } from '@/components/enhanced-gallery-component'
import { SearchFilter } from '@/components/search-filter'
import { mockArtworks } from '../lib/hooks/artwork.mock'
import { testAccessibility, testKeyboardNavigation, render as customRender } from '../utils/test-utils'

// jest-axe 확장
expect.extend(toHaveNoViolations)

// 컴포넌트 모킹
jest.mock('@/components/optimized-image', () => ({
  GalleryGridImage: ({ artwork, className, priority }: any) => (
    <img
      src={artwork.imageUrl}
      alt={artwork.title}
      className={className}
      data-priority={priority}
      loading={priority ? 'eager' : 'lazy'}
    />
  ),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('Gallery Accessibility Tests', () => {
  describe('OptimizedGallery 접근성', () => {
    it('접근성 위반사항이 없어야 한다', async () => {
      const { container } = customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('모든 이미지에 적절한 alt 텍스트가 있어야 한다', () => {
      customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })

    it('모든 링크가 접근 가능해야 한다', () => {
      customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
        expect(link.getAttribute('href')).not.toBe('')
        
        // 링크에 접근 가능한 텍스트가 있어야 함
        const accessibleName = link.getAttribute('aria-label') || link.textContent
        expect(accessibleName).toBeTruthy()
      })
    })

    it('키보드 내비게이션이 올바르게 작동해야 한다', async () => {
      const user = userEvent.setup()
      const { container } = customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 첫 번째 링크로 이동
      const firstLink = screen.getAllByRole('link')[0]
      await user.tab()
      expect(firstLink).toHaveFocus()

      // Tab 키로 다음 링크들로 이동
      for (let i = 1; i < Math.min(3, mockArtworks.length); i++) {
        await user.tab()
        const nextLink = screen.getAllByRole('link')[i]
        expect(nextLink).toHaveFocus()
      }
    })

    it('Enter 키로 링크를 활성화할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const firstLink = screen.getAllByRole('link')[0]
      firstLink.focus()
      
      // Enter 키 눌러서 링크 활성화 시뮬레이션
      await user.keyboard('{Enter}')
      
      // 링크가 여전히 존재하고 접근 가능해야 함
      expect(firstLink).toBeInTheDocument()
    })

    it('로딩 상태에서 적절한 접근성 정보를 제공해야 한다', () => {
      customRender(
        <OptimizedGallery artworks={[]} loading={true} error={null} />
      )

      const loadingElement = screen.getByText(/로딩/i)
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute('role', 'status')
      expect(loadingElement).toHaveAttribute('aria-live', 'polite')
    })

    it('에러 상태에서 적절한 접근성 정보를 제공해야 한다', () => {
      const error = { message: '작품을 불러올 수 없습니다', code: 'FETCH_ERROR' }
      customRender(
        <OptimizedGallery artworks={[]} loading={false} error={error} />
      )

      const errorElement = screen.getByText(error.message)
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveAttribute('role', 'alert')
      expect(errorElement).toHaveAttribute('aria-live', 'assertive')
    })

    it('빈 상태에서 적절한 메시지를 제공해야 한다', () => {
      customRender(
        <OptimizedGallery artworks={[]} loading={false} error={null} />
      )

      const emptyMessage = screen.getByText(/작품이 없습니다/i)
      expect(emptyMessage).toBeInTheDocument()
      expect(emptyMessage).toHaveAttribute('role', 'status')
    })
  })

  describe('SearchFilter 접근성', () => {
    const mockHandlers = {
      onFilteredResults: jest.fn(),
    }

    it('접근성 위반사항이 없어야 한다', async () => {
      const { container } = customRender(
        <SearchFilter artworks={mockArtworks} {...mockHandlers} />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('검색 입력 필드에 적절한 라벨이 있어야 한다', () => {
      customRender(
        <SearchFilter artworks={mockArtworks} {...mockHandlers} />
      )

      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveAccessibleName()
      
      // aria-label 또는 연결된 label이 있어야 함
      const hasLabel = searchInput.getAttribute('aria-label') || 
                     searchInput.getAttribute('aria-labelledby') ||
                     screen.queryByLabelText(searchInput.getAttribute('placeholder') || '')
      expect(hasLabel).toBeTruthy()
    })

    it('필터 버튼에 적절한 접근성 정보가 있어야 한다', () => {
      customRender(
        <SearchFilter artworks={mockArtworks} {...mockHandlers} />
      )

      const filterButton = screen.getByRole('button', { name: /필터/i })
      expect(filterButton).toBeInTheDocument()
      expect(filterButton).toHaveAccessibleName()
      
      // 버튼 상태 정보가 있어야 함
      const ariaExpanded = filterButton.getAttribute('aria-expanded')
      if (ariaExpanded !== null) {
        expect(['true', 'false']).toContain(ariaExpanded)
      }
    })

    it('필터 모달이 적절한 접근성 구조를 가져야 한다', async () => {
      const user = userEvent.setup()
      customRender(
        <SearchFilter artworks={mockArtworks} {...mockHandlers} />
      )

      const filterButton = screen.getByRole('button', { name: /필터/i })
      await user.click(filterButton)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      expect(modal).toHaveAccessibleName()
      
      // 모달이 포커스를 받아야 함
      expect(modal).toHaveFocus()
    })

    it('필터 제거 버튼들에 적절한 라벨이 있어야 한다', async () => {
      const user = userEvent.setup()
      customRender(
        <SearchFilter artworks={mockArtworks} {...mockHandlers} />
      )

      // 검색어 입력으로 필터 활성화
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, '테스트')

      const removeButtons = screen.getAllByRole('button', { name: /제거/i })
      removeButtons.forEach(button => {
        expect(button).toHaveAccessibleName()
        expect(button.getAttribute('aria-label')).toContain('제거')
      })
    })

    it('폼 컨트롤들이 논리적 순서로 배치되어야 한다', async () => {
      const user = userEvent.setup()
      customRender(
        <SearchFilter artworks={mockArtworks} {...mockHandlers} />
      )

      // Tab 순서 확인
      const searchInput = screen.getByRole('textbox')
      const filterButton = screen.getByRole('button', { name: /필터/i })

      await user.tab()
      expect(searchInput).toHaveFocus()

      await user.tab()
      expect(filterButton).toHaveFocus()
    })
  })

  describe('스크린 리더 지원', () => {
    it('중요한 정보가 스크린 리더에 제대로 전달되어야 한다', () => {
      customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 작품 개수 정보
      const artworkCount = screen.getByText(/개 작품/i)
      expect(artworkCount).toBeInTheDocument()
      expect(artworkCount).toHaveAttribute('aria-live', 'polite')

      // 각 작품의 정보가 적절히 구조화되어야 함
      mockArtworks.forEach(artwork => {
        const artworkElement = screen.getByText(artwork.title)
        expect(artworkElement).toBeInTheDocument()
        
        // heading 또는 적절한 semantic 요소 사용
        const headingElement = artworkElement.closest('h1, h2, h3, h4, h5, h6')
        if (headingElement) {
          expect(headingElement).toBeInTheDocument()
        }
      })
    })

    it('동적 콘텐츠 변경이 스크린 리더에 알려져야 한다', async () => {
      const user = userEvent.setup()
      customRender(
        <SearchFilter artworks={mockArtworks} onFilteredResults={jest.fn()} />
      )

      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, '검색어')

      // 검색 결과 변경이 live region으로 알려져야 함
      const liveRegion = screen.getByRole('status', { hidden: true }) || 
                        screen.getByRole('log', { hidden: true }) ||
                        document.querySelector('[aria-live]')
      
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('색상 및 대비', () => {
    it('텍스트와 배경 간의 대비가 충분해야 한다', () => {
      const { container } = customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 텍스트 요소들의 대비 확인 (CSS 계산은 브라우저에서만 가능하므로 클래스 확인)
      const textElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span')
      textElements.forEach(element => {
        // 대비 관련 CSS 클래스가 적용되어야 함
        const hasContrastClass = element.className.includes('text-') ||
                                element.className.includes('contrast-')
        expect(hasContrastClass).toBe(true)
      })
    })

    it('포커스 상태가 명확하게 표시되어야 한다', async () => {
      const user = userEvent.setup()
      customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      const firstLink = screen.getAllByRole('link')[0]
      await user.tab()
      
      // 포커스 상태 확인 (CSS 클래스 또는 인라인 스타일)
      expect(firstLink).toHaveFocus()
      expect(
        firstLink.className.includes('focus:') ||
        firstLink.style.outline ||
        firstLink.style.border
      ).toBe(true)
    })
  })

  describe('모바일 접근성', () => {
    it('터치 타겟이 충분한 크기를 가져야 한다', () => {
      const { container } = customRender(
        <SearchFilter artworks={mockArtworks} onFilteredResults={jest.fn()} />
      )

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        // 44x44px 최소 크기 확인 (CSS 클래스로 판단)
        const hasMinSizeClass = button.className.includes('min-h-') ||
                               button.className.includes('p-') ||
                               button.className.includes('py-') ||
                               button.className.includes('px-')
        expect(hasMinSizeClass).toBe(true)
      })
    })

    it('제스처 기반 상호작용이 접근 가능해야 한다', () => {
      customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 스와이프나 드래그가 필요한 UI가 있다면 대안적 접근 방법 제공
      const interactiveElements = screen.getAllByRole('button')
      interactiveElements.forEach(element => {
        // 키보드나 음성 명령으로도 접근 가능해야 함
        expect(element).not.toHaveAttribute('onTouchStart')
        expect(element).not.toHaveAttribute('onTouchMove')
      })
    })
  })

  describe('다국어 접근성', () => {
    it('언어 속성이 올바르게 설정되어야 한다', () => {
      const { container } = customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // HTML lang 속성 확인
      const htmlElement = document.documentElement
      expect(htmlElement).toHaveAttribute('lang')

      // 다른 언어 콘텐츠가 있다면 lang 속성 지정
      const textElements = container.querySelectorAll('[lang]')
      textElements.forEach(element => {
        const langValue = element.getAttribute('lang')
        expect(langValue).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/)
      })
    })

    it('RTL 언어 지원이 고려되어야 한다', () => {
      const { container } = customRender(
        <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
      )

      // 텍스트 방향성 관련 CSS 클래스 확인
      const layoutElements = container.querySelectorAll('.grid, .flex')
      layoutElements.forEach(element => {
        // RTL 대응 클래스가 있거나 논리적 속성 사용
        const hasRTLSupport = element.className.includes('rtl:') ||
                             element.className.includes('ltr:') ||
                             element.className.includes('start-') ||
                             element.className.includes('end-')
        expect(hasRTLSupport).toBe(true)
      })
    })
  })

  describe('보조 기술 호환성', () => {
    it('ARIA 랜드마크가 적절히 사용되어야 한다', () => {
      const { container } = customRender(
        <div>
          <SearchFilter artworks={mockArtworks} onFilteredResults={jest.fn()} />
          <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
        </div>
      )

      // 검색 영역
      const searchLandmark = container.querySelector('[role="search"]') ||
                            container.querySelector('search')
      expect(searchLandmark).toBeInTheDocument()

      // 메인 콘텐츠 영역
      const mainLandmark = container.querySelector('[role="main"]') ||
                          container.querySelector('main')
      expect(mainLandmark).toBeInTheDocument()
    })

    it('ARIA 속성이 올바르게 사용되어야 한다', () => {
      customRender(
        <SearchFilter artworks={mockArtworks} onFilteredResults={jest.fn()} />
      )

      // aria-expanded 사용 확인
      const expandableElements = screen.getAllByRole('button')
      expandableElements.forEach(element => {
        const ariaExpanded = element.getAttribute('aria-expanded')
        if (ariaExpanded !== null) {
          expect(['true', 'false']).toContain(ariaExpanded)
        }
      })

      // aria-describedby 사용 확인
      const describedElements = document.querySelectorAll('[aria-describedby]')
      describedElements.forEach(element => {
        const describedById = element.getAttribute('aria-describedby')
        const describedByElement = document.getElementById(describedById!)
        expect(describedByElement).toBeInTheDocument()
      })
    })

    it('헤딩 구조가 논리적이어야 한다', () => {
      const { container } = customRender(
        <div>
          <h1>ANAM Gallery</h1>
          <SearchFilter artworks={mockArtworks} onFilteredResults={jest.fn()} />
          <OptimizedGallery artworks={mockArtworks} loading={false} error={null} />
        </div>
      )

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)))

      // 헤딩 레벨이 점진적으로 증가해야 함 (갭이 1보다 크면 안 됨)
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1]
        expect(diff).toBeLessThanOrEqual(1)
      }
    })
  })
})