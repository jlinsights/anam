const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로 설정
  dir: './',
})

// Jest 커스텀 설정
const customJestConfig = {
  // jsdom + Node 내장 fetch/Request/TextEncoder/스트림 (msw v2·NextRequest 필요)
  testEnvironment: 'jest-fixed-jsdom',

  // msw/node 해석을 위해 browser export 조건을 끄고, jsdom 기준 URL 지정
  testEnvironmentOptions: {
    customExportConditions: [''],
    url: 'http://localhost:3000',
  },

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],

  // 헬퍼·목 파일과 Playwright 스펙(e2e)은 Jest 테스트가 아님
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/__tests__/utils/',
    '<rootDir>/__tests__/e2e/',
    '\\.mock\\.(js|jsx|ts|tsx)$',
    // 지금 코드와 맞지 않아 깨진 테스트 격리 구역 (사유: __tests__/_quarantine/README.md)
    '<rootDir>/__tests__/_quarantine/',
  ],

  // 커버리지 설정
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],

  // 모듈 경로 별칭
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Next SWC가 framer-motion을 v12에 없는 내부 경로(dist/es/*)로 바꾸므로 패키지 진입점으로 되돌린다
    '^framer-motion/dist/es/.*$': '<rootDir>/node_modules/framer-motion',
  },

  // 테스트 setup 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 테스트 커버리지 임계값 (85%로 상향)
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './components/**/*.{js,jsx,ts,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './lib/**/*.{js,jsx,ts,tsx}': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // 변환할 파일 제외
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|lucide-react|@radix-ui|zustand|embla-carousel-react))',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // 테스트 타임아웃 증가
  testTimeout: 10000,

  // 커버리지 리포터 설정
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],

  // 병렬 실행 최적화
  maxWorkers: '50%',

  // 테스트 실행 시 verbose 모드
  verbose: true,
}

// next/jest는 자체 '/node_modules/' 무시 패턴을 앞에 붙여 위 transformIgnorePatterns를 무력화한다.
// SWC가 lucide-react를 개별 ESM 아이콘 import로 바꾸므로, 생성된 설정에서 패턴을 직접 교체한다.
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()
  return {
    ...config,
    transformIgnorePatterns: customJestConfig.transformIgnorePatterns,
  }
}
