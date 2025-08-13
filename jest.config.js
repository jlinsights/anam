const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로 설정
  dir: './',
})

// Jest 커스텀 설정
const customJestConfig = {
  // 테스트 환경 설정
  testEnvironment: 'jsdom',

  // API 테스트는 node 환경 사용
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
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

  // API 테스트용 환경 매핑
  testEnvironmentOptions: {
    jsdom: {
      url: 'http://localhost:3000',
    },
  },

  // 테스트 타임아웃 증가
  testTimeout: 10000,

  // 커버리지 리포터 설정
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],

  // 병렬 실행 최적화
  maxWorkers: '50%',

  // 테스트 실행 시 verbose 모드
  verbose: true,
}

module.exports = createJestConfig(customJestConfig)
