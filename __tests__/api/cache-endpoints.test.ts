/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/cache', () => ({
  clearCacheAndRevalidate: jest.fn(),
  clearCache: jest.fn(),
  getCachedData: jest.fn(() => null),
  setCachedData: jest.fn(),
}))
jest.mock('@/lib/supabase/artworks', () => ({
  fetchArtworksFromSupabase: jest.fn(async () => [
    { id: 'rec1', slug: 'anam-35', title: '남도의 아침 Ⅱ', featured: false },
  ]),
  fetchArtworkBySlugFromSupabase: jest.fn(async () => null),
  fetchArtistFromSupabase: jest.fn(async () => null),
}))

const ENV = {
  ADMIN_SYNC_TOKEN: 'admin-token-for-tests',
  AIRTABLE_WEBHOOK_SECRET: 'webhook-secret-for-tests',
  REVALIDATE_SECRET: 'revalidate-secret-for-tests',
}
const ORIGINAL_ENV = { ...process.env }
const originalFetch = global.fetch

beforeEach(() => {
  Object.assign(process.env, ENV)
  global.fetch = jest.fn() as unknown as typeof fetch
})
afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  global.fetch = originalFetch
  jest.clearAllMocks()
})

function load<T>(path: string): { route: T; revalidate: jest.Mock } {
  let route!: T
  let revalidate!: jest.Mock
  jest.isolateModules(() => {
    revalidate = require('@/lib/cache').clearCacheAndRevalidate
    route = require(path)
  })
  return { route, revalidate }
}

function post(url: string, body: unknown, token?: string) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

type Route = { POST: (req: NextRequest) => Promise<Response> }

// 예전: 두 동기화 경로가 /api/revalidate 를 Bearer 헤더 + {tags, paths} 로 불렀지만
// 그 엔드포인트는 body.secret·body.tag 를 읽어 늘 401 → 동기화 뒤 캐시가 한 번도 갱신되지 않았다
describe('동기화 뒤 캐시 갱신', () => {
  it('admin/sync: 관리자 토큰이 맞으면 artworks 캐시를 직접 갱신한다', async () => {
    const { route, revalidate } = load<Route>('@/app/api/admin/sync/route')
    const res = await route.POST(
      post('http://localhost/api/admin/sync', {}, ENV.ADMIN_SYNC_TOKEN)
    )
    expect(res.status).toBe(200)
    expect(revalidate).toHaveBeenCalledWith('artworks')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('sync/airtable: 웹훅 시크릿이 맞으면 artworks 캐시를 직접 갱신한다', async () => {
    const { route, revalidate } = load<Route>('@/app/api/sync/airtable/route')
    const res = await route.POST(
      post(
        'http://localhost/api/sync/airtable',
        { base: { id: 'app1' } },
        ENV.AIRTABLE_WEBHOOK_SECRET
      )
    )
    expect(res.status).toBe(200)
    expect(revalidate).toHaveBeenCalledWith('artworks')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

// 예전: 레이트리밋만 있고 인증이 없어 누구나 캐시를 비우고 다시 불러오게 할 수 있었다
describe('캐시 비우기 엔드포인트는 REVALIDATE_SECRET 이 필요하다', () => {
  it('POST /api/artworks?action=refresh', async () => {
    const { route } = load<Route>('@/app/api/artworks/route')
    const url = 'http://localhost/api/artworks?action=refresh'
    expect((await route.POST(post(url, {}))).status).toBe(401)
    expect((await route.POST(post(url, {}, 'wrong'))).status).toBe(401)
    expect(
      (await route.POST(post(url, {}, ENV.REVALIDATE_SECRET))).status
    ).toBe(200)
  })

  it('POST /api/artist {action: clearCache}', async () => {
    const { route } = load<Route>('@/app/api/artist/route')
    const url = 'http://localhost/api/artist'
    const body = { action: 'clearCache' }
    expect((await route.POST(post(url, body))).status).toBe(401)
    expect((await route.POST(post(url, body, 'wrong'))).status).toBe(401)
    expect(
      (await route.POST(post(url, body, ENV.REVALIDATE_SECRET))).status
    ).toBe(200)
  })

  it('시크릿이 설정되지 않았으면 맞는 값도 없으므로 거부한다', async () => {
    delete process.env.REVALIDATE_SECRET
    const { route } = load<Route>('@/app/api/artist/route')
    const res = await route.POST(
      post('http://localhost/api/artist', { action: 'clearCache' }, '')
    )
    expect(res.status).toBe(401)
  })
})
