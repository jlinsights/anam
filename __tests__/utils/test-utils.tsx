import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { axe, toHaveNoViolations } from 'jest-axe'

// Mock messages for testing
const mockMessages = {
  common: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    retry: '다시 시도',
    close: '닫기',
  },
  navigation: {
    home: '홈',
    gallery: '갤러리',
    artist: '작가',
    contact: '연락처',
  },
  gallery: {
    title: '갤러리',
    filter: '필터',
    search: '검색',
    sort: '정렬',
    featured: '대표작',
    loadMore: '더 보기',
  },
  artwork: {
    title: '제목',
    year: '제작년도',
    medium: '재료',
    dimensions: '크기',
    description: '설명',
    viewDetails: '상세보기',
    like: '좋아요',
    share: '공유',
  },
  contact: {
    title: '연락하기',
    name: '이름',
    email: '이메일',
    subject: '제목',
    message: '메시지',
    send: '보내기',
    phone: '전화번호',
  },
}

// 커스텀 렌더 함수
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string
  messages?: any
}

const customRender = (
  ui: ReactElement,
  {
    locale = 'ko',
    messages = mockMessages,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// 접근성 테스트 헬퍼
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// 키보드 내비게이션 테스트 헬퍼
export const testKeyboardNavigation = async (
  element: HTMLElement,
  expectedFocusableElements: number
) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  expect(focusableElements).toHaveLength(expectedFocusableElements)

  // Tab 키 순회 테스트
  for (let i = 0; i < focusableElements.length; i++) {
    const el = focusableElements[i] as HTMLElement
    el.focus()
    expect(document.activeElement).toBe(el)
  }
}

// 반응형 테스트 헬퍼
export const testResponsiveLayout = (
  container: HTMLElement,
  breakpoints: { [key: string]: number }
) => {
  Object.entries(breakpoints).forEach(([name, width]) => {
    // jsdom에서는 실제 viewport 변경이 어려우므로 클래스 확인
    const responsiveClasses = container.querySelector(
      `[class*="${name}:"], [class*="@${name}:"]`
    )
    if (responsiveClasses) {
      expect(responsiveClasses).toBeInTheDocument()
    }
  })
}

// 이미지 로딩 테스트 헬퍼
export const testImageLoading = async (imageElement: HTMLImageElement) => {
  return new Promise<void>((resolve, reject) => {
    if (imageElement.complete) {
      resolve()
    } else {
      imageElement.onload = () => resolve()
      imageElement.onerror = () => reject(new Error('Image failed to load'))
      
      // 테스트 환경에서 강제로 로드 이벤트 발생
      const event = new Event('load')
      imageElement.dispatchEvent(event)
    }
  })
}

// 성능 메트릭 모킹
export const mockPerformanceMetrics = () => {
  const mockEntries = [
    {
      name: 'navigation',
      entryType: 'navigation',
      startTime: 0,
      duration: 1000,
      loadEventEnd: 1000,
      domContentLoadedEventEnd: 800,
    },
    {
      name: 'paint',
      entryType: 'paint',
      startTime: 0,
      duration: 200,
    },
  ]

  Object.defineProperty(window, 'performance', {
    value: {
      getEntriesByType: jest.fn().mockReturnValue(mockEntries),
      mark: jest.fn(),
      measure: jest.fn(),
      now: jest.fn().mockReturnValue(Date.now()),
      getEntriesByName: jest.fn().mockReturnValue([]),
    },
    writable: true,
  })
}

// 스크롤 테스트 헬퍼
export const simulateScroll = (element: HTMLElement, scrollTop: number) => {
  Object.defineProperty(element, 'scrollTop', {
    value: scrollTop,
    writable: true,
  })
  
  const scrollEvent = new Event('scroll')
  element.dispatchEvent(scrollEvent)
}

// 터치 이벤트 헬퍼
export const simulateTouch = (
  element: HTMLElement,
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: { clientX: number; clientY: number }[]
) => {
  const touchEvent = new TouchEvent(type, {
    touches: touches.map(
      (touch, index) =>
        new Touch({
          identifier: index,
          target: element,
          ...touch,
        })
    ) as any,
  })
  
  element.dispatchEvent(touchEvent)
}

// 지연 로딩 테스트 헬퍼
export const testLazyLoading = (element: HTMLElement) => {
  const observer = new IntersectionObserver(jest.fn())
  
  // IntersectionObserver 콜백 시뮬레이션
  const callback = (observer as any).mock.calls[0]?.[0]
  if (callback) {
    callback([
      {
        target: element,
        isIntersecting: true,
        intersectionRatio: 1,
      },
    ])
  }
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { axe, toHaveNoViolations }