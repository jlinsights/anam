/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// 실제 작품 데이터를 못 받으면 "없음/오류"를 알려야 한다.
// 예전에는 'Harmony'·'Serenity' 같은 영어 제목에 2021년·Ink on paper 를 붙인 61점을
// 코드로 만들어 실제 작품처럼 보여 줬다(라이브 /gallery 에서 확인, 2026-11-01)
jest.mock('@/lib/supabase/artworks', () => ({
  fetchArtworksFromSupabase: jest.fn(),
  fetchArtworkBySlugFromSupabase: jest.fn(),
  fetchArtistFromSupabase: jest.fn(),
}))
jest.mock('@/lib/airtable', () => ({
  fetchArtworksFromAirtable: jest.fn(),
  fetchArtistFromAirtable: jest.fn(),
  fetchFeaturedArtworks: jest.fn(),
  fetchTreasureArtworks: jest.fn(),
}))

const PLACEHOLDER_TITLES = /^(Harmony|Serenity|Tranquility|Balance|Flow)$/

const realArtwork = {
  id: 'rec1',
  slug: 'anam-35',
  title: '남도의 아침 Ⅱ',
  year: 2024,
  medium: '화선지',
  dimensions: '70 x 140 cm',
  imageUrl: '/Images/Artworks/anam-35.jpg',
}

function loadModules(sources: {
  supabase: () => Promise<unknown>
  airtable?: () => Promise<unknown>
}) {
  let artworks!: typeof import('@/lib/artworks')
  let route!: typeof import('@/app/api/artworks/route')
  jest.isolateModules(() => {
    const supabase = require('@/lib/supabase/artworks')
    supabase.fetchArtworksFromSupabase.mockImplementation(sources.supabase)
    supabase.fetchArtworkBySlugFromSupabase.mockResolvedValue(null)
    const airtable = require('@/lib/airtable')
    airtable.fetchArtworksFromAirtable.mockImplementation(
      sources.airtable ?? (async () => [])
    )
    artworks = require('@/lib/artworks')
    route = require('@/app/api/artworks/route')
  })
  return { artworks, route }
}

const down = async () => {
  throw new Error('down')
}

describe('작품 데이터가 없을 때 지어내지 않는다', () => {
  it('getArtworks: Supabase·Airtable 모두 실패하면 빈 배열', async () => {
    const { artworks } = loadModules({ supabase: down, airtable: down })
    await expect(artworks.getArtworks()).resolves.toEqual([])
  })

  it('getArtworkBySlug: 지어낸 번호 slug(/gallery/01)는 찾지 못한다', async () => {
    const { artworks } = loadModules({ supabase: down, airtable: down })
    await expect(artworks.getArtworkBySlug('01')).resolves.toBeNull()
  })

  it('lib/artworks 는 지어낸 작품·작가 데이터를 내보내지 않는다', () => {
    const { artworks } = loadModules({ supabase: down })
    expect(artworks).not.toHaveProperty('fallbackArtworksData')
    expect(artworks).not.toHaveProperty('fallbackArtistData')
  })

  it('GET /api/artworks: Supabase 실패 시 503, 지어낸 작품 없음', async () => {
    const { route } = loadModules({ supabase: down })
    const res = await route.GET(
      new NextRequest('http://localhost/api/artworks')
    )
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.success).toBe(false)
    const titles = (body.data ?? []).map((a: { title: string }) => a.title)
    expect(titles.some((t: string) => PLACEHOLDER_TITLES.test(t))).toBe(false)
  })

  it('GET /api/artworks: 실패를 캐시하지 않아 복구되면 바로 실제 작품을 준다', async () => {
    let ok = false
    const { route } = loadModules({
      supabase: async () => {
        if (!ok) throw new Error('down')
        return [realArtwork]
      },
    })
    const first = await route.GET(
      new NextRequest('http://localhost/api/artworks')
    )
    expect(first.status).toBe(503)

    ok = true
    const second = await route.GET(
      new NextRequest('http://localhost/api/artworks')
    )
    expect(second.status).toBe(200)
    expect((await second.json()).data[0].title).toBe('남도의 아침 Ⅱ')
  })
})
