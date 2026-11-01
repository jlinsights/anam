/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase/artworks', () => ({
  fetchArtistFromSupabase: jest.fn(),
}))

// 홈의 작가 소개·"전시 이력"은 /api/artist 응답을 실제 기록으로 그대로 보여 준다.
// Supabase 가 비었거나 실패하면 지어낸 작가 정보 대신 "없음"(503, data: null)을 돌려줘야 한다
describe('작가 데이터가 없을 때 지어내지 않는다', () => {
  function loadGet(supabase: () => Promise<unknown>) {
    let GET!: typeof import('@/app/api/artist/route').GET
    jest.isolateModules(() => {
      const mod = require('@/lib/supabase/artworks')
      mod.fetchArtistFromSupabase.mockImplementation(supabase)
      GET = require('@/app/api/artist/route').GET
    })
    return GET
  }

  async function getArtist(supabase: () => Promise<unknown>) {
    const GET = loadGet(supabase)
    const response = await GET(new NextRequest('http://localhost/api/artist'))
    return { status: response.status, body: await response.json() }
  }

  it('Supabase 에 작가가 없으면 503 이고 작가 정보가 없다', async () => {
    const { status, body } = await getArtist(async () => null)
    expect(status).toBe(503)
    expect(body.data).toBeNull()
  })

  it('Supabase 오류여도 503 이고 작가 정보가 없다', async () => {
    const { status, body } = await getArtist(async () => {
      throw new Error('down')
    })
    expect(status).toBe(503)
    expect(body.data).toBeNull()
  })

  it('실패를 캐시하지 않아 복구되면 바로 실제 작가 정보를 준다', async () => {
    let ok = false
    const GET = loadGet(async () => {
      if (!ok) throw new Error('down')
      return { id: 'a1', name: '아남 배옥영', exhibitions: [] }
    })
    expect(
      (await GET(new NextRequest('http://localhost/api/artist'))).status
    ).toBe(503)
    ok = true
    const res = await GET(new NextRequest('http://localhost/api/artist'))
    expect(res.status).toBe(200)
    expect((await res.json()).data.name).toBe('아남 배옥영')
  })
})
