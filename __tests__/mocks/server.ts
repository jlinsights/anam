import { setupServer } from 'msw/node'

// 모든 테스트가 공유하는 MSW 서버 (jest.setup.js에서 listen/reset/close)
export const server = setupServer()
