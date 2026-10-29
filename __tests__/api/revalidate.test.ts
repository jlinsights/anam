/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/cache', () => ({
  clearCacheAndRevalidate: jest.fn(),
}))

const ORIGINAL_SECRET = process.env.REVALIDATE_SECRET

// WEBHOOK_SECRET은 모듈 로드 시점에 읽히므로 환경변수를 바꾼 뒤 모듈을 새로 불러온다
function loadRoute(secret: string | undefined) {
  if (secret === undefined) {
    delete process.env.REVALIDATE_SECRET
  } else {
    process.env.REVALIDATE_SECRET = secret
  }
  let route: typeof import('@/app/api/revalidate/route')
  let cache: { clearCacheAndRevalidate: jest.Mock }
  jest.isolateModules(() => {
    route = require('@/app/api/revalidate/route')
    cache = require('@/lib/cache')
  })
  return { POST: route!.POST, revalidate: cache!.clearCacheAndRevalidate }
}

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/revalidate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

afterAll(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.REVALIDATE_SECRET
  } else {
    process.env.REVALIDATE_SECRET = ORIGINAL_SECRET
  }
})

describe('POST /api/revalidate', () => {
  it('시크릿이 설정되지 않으면 요청을 거부한다 (fail closed)', async () => {
    const { POST, revalidate } = loadRoute(undefined)

    const res = await POST(request({ tag: 'artworks' }))

    expect(res.status).toBe(503)
    expect(revalidate).not.toHaveBeenCalled()
  })

  it('시크릿이 틀리면 401을 돌려주고 캐시를 건드리지 않는다', async () => {
    const { POST, revalidate } = loadRoute('correct-secret')

    const res = await POST(
      request({ tag: 'artworks', secret: 'wrong-secret!' })
    )

    expect(res.status).toBe(401)
    expect(revalidate).not.toHaveBeenCalled()
  })

  it('시크릿이 없거나 문자열이 아니면 401을 돌려준다', async () => {
    const { POST, revalidate } = loadRoute('correct-secret')

    expect((await POST(request({ tag: 'artworks' }))).status).toBe(401)
    expect(
      (await POST(request({ tag: 'artworks', secret: 12345 }))).status
    ).toBe(401)
    expect(revalidate).not.toHaveBeenCalled()
  })

  it('문자 수는 같지만 바이트 수가 다른 시크릿도 예외 없이 401을 돌려준다', async () => {
    const { POST, revalidate } = loadRoute('correct-secret')

    // 'correct-secret'과 같은 14자지만 UTF-8로는 28바이트
    const res = await POST(request({ tag: 'artworks', secret: 'é'.repeat(14) }))

    expect(res.status).toBe(401)
    expect(revalidate).not.toHaveBeenCalled()
  })

  it('시크릿이 맞으면 해당 태그를 재검증한다', async () => {
    const { POST, revalidate } = loadRoute('correct-secret')

    const res = await POST(
      request({ tag: 'artworks', secret: 'correct-secret' })
    )

    expect(res.status).toBe(200)
    expect(revalidate).toHaveBeenCalledWith('artworks')
  })
})
