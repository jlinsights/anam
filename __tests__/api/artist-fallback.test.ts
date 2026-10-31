/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase/artworks', () => ({
  fetchArtistFromSupabase: jest.fn(),
}))

// 홈의 "전시 이력"은 작가 데이터의 exhibitions 를 실제 기록으로 그대로 보여 준다.
// Supabase 가 비었거나 실패해 fallback 으로 넘어갈 때 지어낸 전시가 섞이면 안 된다
describe('작가 fallback 은 전시를 지어내지 않는다', () => {
  async function getArtist(supabase: () => Promise<unknown>) {
    let GET: typeof import('@/app/api/artist/route').GET
    jest.isolateModules(() => {
      const mod = require('@/lib/supabase/artworks')
      mod.fetchArtistFromSupabase.mockImplementation(supabase)
      GET = require('@/app/api/artist/route').GET
    })
    const response = await GET!(new NextRequest('http://localhost/api/artist'))
    return (await response.json()).data
  }

  it('Supabase 에 작가가 없을 때 API fallback 의 전시는 비어 있다', async () => {
    const artist = await getArtist(async () => null)
    expect(artist.exhibitions).toEqual([])
  })

  it('Supabase 오류일 때 API fallback 의 전시는 비어 있다', async () => {
    const artist = await getArtist(async () => {
      throw new Error('down')
    })
    expect(artist.exhibitions).toEqual([])
  })

  it('클라이언트 fallback(fallbackArtistData) 의 전시도 비어 있다', () => {
    const { fallbackArtistData } = require('@/lib/artworks')
    expect(fallbackArtistData.exhibitions).toEqual([])
  })
})
