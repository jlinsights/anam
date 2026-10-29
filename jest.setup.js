import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import { toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock matchMedia (only in JSDOM environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock next/navigation
// 테스트에서 mockReturnValue로 덮어쓸 수 있도록 jest.fn으로 둔다
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'ko',
  useMessages: () => ({}),
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: () => (key) => key,
  getMessages: () => Promise.resolve({}),
}))

// Airtable 모킹은 개별 테스트 파일에서 처리

// Mock Zustand persist middleware
jest.mock('zustand/middleware', () => ({
  devtools: (fn) => fn,
  persist: (fn, options) => fn,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    article: 'article',
    aside: 'aside',
    header: 'header',
    footer: 'footer',
    main: 'main',
    nav: 'nav',
    img: 'img',
    button: 'button',
    a: 'a',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}))

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'Inter, sans-serif',
    },
  }),
  Noto_Serif_KR: () => ({
    style: {
      fontFamily: 'Noto Serif KR, serif',
    },
  }),
}))

// Request/Response/Headers/fetch는 jest-fixed-jsdom이 Node 내장 구현을 제공한다 (jest.fn으로 덮으면 NextRequest가 깨진다)

// Mock crypto for Node.js environment
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0
          const v = c == 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        }
      )
    },
  }
}

// 콘솔 에러 필터링 (불필요한 테스트 로그 제거)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// MSW 설정 (API 모킹을 위한) — 테스트 파일은 test-utils에서 같은 server를 가져다 쓴다
import { server } from './__tests__/mocks/server'

// 테스트 시작 전 MSW 서버 시작
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  })
  // listen 이후의(MSW가 가로채는) fetch를 jest.fn으로 감싸, 테스트가 mockClear/mockResolvedValue를 쓸 수 있게 한다
  const interceptedFetch = global.fetch
  global.fetch = jest.fn((...args) => interceptedFetch(...args))
})

// 각 테스트 후 핸들러 초기화
afterEach(() => {
  server.resetHandlers()
})

// 모든 테스트 완료 후 MSW 서버 종료
afterAll(() => {
  server.close()
})
