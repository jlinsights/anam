import { render, waitFor } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

// 예전 서비스 워커(public/sw.js)는 이미지 요청이 실패하면 "이미지를 불러올 수 없습니다" 그림을 대신
// 돌려주고, 받은 이미지는 30일 캐시에서 먼저 꺼냈다. Vercel 이미지 최적화가 402 를 내자 작품 칸이 이
// 가짜 그림으로 채워졌다. 이제 서비스 워커를 쓰지 않는다 — 이미 설치된 방문자 브라우저에서도 지워야 한다
describe('서비스 워커 해제', () => {
  const unregister = jest.fn().mockResolvedValue(true)
  const register = jest.fn()

  const cacheDelete = jest.fn().mockResolvedValue(true)

  beforeEach(() => {
    cacheDelete.mockClear()
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: {
        keys: jest.fn().mockResolvedValue(['images-v2.0.0']),
        delete: cacheDelete,
      },
    })
    unregister.mockClear()
    register.mockClear()
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        getRegistrations: jest.fn().mockResolvedValue([{ unregister }]),
        addEventListener: jest.fn(),
      },
    })
  })

  it('새로 등록하지 않고, 이미 설치된 서비스 워커를 해제한다', async () => {
    render(<ServiceWorkerRegistration />)

    await waitFor(() => expect(unregister).toHaveBeenCalled())
    expect(register).not.toHaveBeenCalled()
    await waitFor(() => expect(cacheDelete).toHaveBeenCalledWith('images-v2.0.0'))
  })

  it('public/sw.js 는 캐시를 지우고 스스로 해제하는 워커다 (가짜 이미지를 만들지 않는다)', () => {
    const sw = fs.readFileSync(
      path.join(__dirname, '..', '..', 'public', 'sw.js'),
      'utf8'
    )
    expect(sw).toMatch(/caches\.delete/)
    expect(sw).toMatch(/registration\.unregister\(\)/)
    expect(sw).not.toMatch(/image\/svg\+xml/)
    expect(sw).not.toMatch(/respondWith/)
  })
})

// Codex 리뷰: 해제해도 이미 열린 탭은 옛 워커의 제어를 계속 받는다(가짜 이미지·캐시가 이어짐).
// 옛 워커가 이 탭을 제어하고 있었다면 정리 뒤 한 번만 새로 고친다
describe('옛 워커가 현재 탭을 제어하고 있을 때', () => {
  const reload = jest.fn()

  beforeEach(() => {
    reload.mockClear()
    sessionStorage.clear()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    })
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: { keys: jest.fn().mockResolvedValue([]), delete: jest.fn() },
    })
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        register: jest.fn(),
        getRegistrations: jest
          .fn()
          .mockResolvedValue([{ unregister: jest.fn().mockResolvedValue(true) }]),
        addEventListener: jest.fn(),
      },
    })
  })

  it('정리 뒤 한 번 새로 고친다', async () => {
    render(<ServiceWorkerRegistration />)
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
  })

  it('이미 한 번 새로 고쳤으면 다시 고치지 않는다 (무한 새로 고침 방지)', async () => {
    sessionStorage.setItem('anam-sw-cleanup-reloaded', '1')
    render(<ServiceWorkerRegistration />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(reload).not.toHaveBeenCalled()
  })
})

