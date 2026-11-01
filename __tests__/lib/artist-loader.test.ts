/**
 * @jest-environment node
 */
import type { Artist } from '@/lib/types'

// /artist(서버)는 홈 전시 이력과 같은 Supabase 사본을 먼저 읽는다.
// 예전엔 Airtable 만 읽어 Supabase 에 추가한 제7회 개인전이 /artist 에만 빠졌다
const fromSupabase = jest.fn<Promise<Artist | null>, []>()
const fromAirtable = jest.fn<Promise<Artist | null>, []>()
jest.mock('@/lib/supabase/artworks', () => ({
  fetchArtistFromSupabase: () => fromSupabase(),
}))
jest.mock('@/lib/airtable', () => ({
  fetchArtistFromAirtable: () => fromAirtable(),
}))

import { fetchArtist } from '@/lib/artist'

const artist = (name: string): Artist =>
  ({ id: name, name, bio: '', exhibitions: [], awards: [], education: [] }) as Artist

beforeEach(() => {
  fromSupabase.mockReset()
  fromAirtable.mockReset()
})

describe('fetchArtist', () => {
  it('Supabase 사본을 먼저 쓴다', async () => {
    fromSupabase.mockResolvedValue(artist('supabase'))
    fromAirtable.mockResolvedValue(artist('airtable'))
    expect((await fetchArtist('anam-artist'))?.name).toBe('supabase')
    expect(fromAirtable).not.toHaveBeenCalled()
  })

  it('Supabase 에 없으면 Airtable 로 넘어간다', async () => {
    fromSupabase.mockResolvedValue(null)
    fromAirtable.mockResolvedValue(artist('airtable'))
    expect((await fetchArtist('anam-artist'))?.name).toBe('airtable')
  })

  it('둘 다 없으면 null', async () => {
    fromSupabase.mockResolvedValue(null)
    fromAirtable.mockResolvedValue(null)
    expect(await fetchArtist('anam-artist')).toBeNull()
  })
})
