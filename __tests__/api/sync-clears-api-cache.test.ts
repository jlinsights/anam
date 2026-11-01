/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// lib/cache 는 실제 모듈을 쓴다(목 아님). next/cache 의 revalidateTag 만 막는다
jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }))
jest.mock('@/lib/supabase/artworks', () => ({
  fetchArtworksFromSupabase: jest.fn(),
  fetchArtworkBySlugFromSupabase: jest.fn(async () => null),
  fetchArtistFromSupabase: jest.fn(),
}))

const TOKEN = 'admin-token-for-tests'
const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

// 동기화가 "갱신 성공"을 돌려준 뒤에도 /api/artworks·/api/artist 가 자기 모듈 변수에 든
// 이전 데이터를 1분·5분 동안 주던 문제(Codex 리뷰 #21). 두 API 캐시도 lib/cache 에 둬서
// clearCacheAndRevalidate() 가 함께 비우게 한다
describe('동기화하면 같은 서버의 API 캐시도 비워진다', () => {
  function load() {
    process.env.ADMIN_SYNC_TOKEN = TOKEN
    let artworks!: typeof import('@/app/api/artworks/route')
    let artist!: typeof import('@/app/api/artist/route')
    let sync!: typeof import('@/app/api/admin/sync/route')
    let supabase!: {
      fetchArtworksFromSupabase: jest.Mock
      fetchArtistFromSupabase: jest.Mock
    }
    jest.isolateModules(() => {
      supabase = require('@/lib/supabase/artworks')
      artworks = require('@/app/api/artworks/route')
      artist = require('@/app/api/artist/route')
      sync = require('@/app/api/admin/sync/route')
    })
    return { artworks, artist, sync, supabase }
  }

  const runSync = (sync: typeof import('@/app/api/admin/sync/route')) =>
    sync.POST(
      new NextRequest('http://localhost/api/admin/sync', {
        method: 'POST',
        headers: { authorization: `Bearer ${TOKEN}` },
      })
    )

  it('작품: 동기화 직후 새 데이터를 준다', async () => {
    const { artworks, sync, supabase } = load()
    supabase.fetchArtworksFromSupabase.mockResolvedValue([
      { id: '1', slug: 'anam-1', title: '이전 제목' },
    ])
    const get = () =>
      artworks.GET(new NextRequest('http://localhost/api/artworks'))
    expect((await (await get()).json()).data[0].title).toBe('이전 제목')

    supabase.fetchArtworksFromSupabase.mockResolvedValue([
      { id: '1', slug: 'anam-1', title: '고친 제목' },
    ])
    expect((await runSync(sync)).status).toBe(200)
    expect((await (await get()).json()).data[0].title).toBe('고친 제목')
  })

  it('작가: 동기화 직후 새 데이터를 준다', async () => {
    const { artist, sync, supabase } = load()
    supabase.fetchArtistFromSupabase.mockResolvedValue({
      id: 'a',
      name: '아남 배옥영',
      bio: '이전 소개',
    })
    const get = () => artist.GET(new NextRequest('http://localhost/api/artist'))
    expect((await (await get()).json()).data.bio).toBe('이전 소개')

    supabase.fetchArtistFromSupabase.mockResolvedValue({
      id: 'a',
      name: '아남 배옥영',
      bio: '고친 소개',
    })
    expect((await runSync(sync)).status).toBe(200)
    expect((await (await get()).json()).data.bio).toBe('고친 소개')
  })
})
