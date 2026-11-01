/**
 * @jest-environment node
 */
import { fetchArtistFromSupabase } from '@/lib/supabase/artworks'

// Supabase 사본의 이름 칸은 Airtable 원문 그대로 "芽南 裵玉永 (b.1955)" 이고 birth_year 는 비어 있다.
// Airtable 로더처럼 이름에서 "(b.1955)" 를 떼고 생년으로 읽어야 /artist 에 이름이 두 번 겹치지 않는다
const row = {
  id: 'artist-1',
  name: '芽南 裵玉永 (b.1955)',
  birth_year: null,
  bio: '서예가',
  exhibitions: ['2026 | 개인전 | 제7회'],
}

jest.mock('@/lib/supabase/server', () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => ({
          maybeSingle: async () => ({ data: row, error: null }),
        }),
      }),
    }),
  }),
}))

describe('fetchArtistFromSupabase', () => {
  it('이름의 "(b.1955)" 를 떼고 생년으로 읽는다', async () => {
    const artist = await fetchArtistFromSupabase()
    expect(artist?.name).toBe('芽南 裵玉永')
    expect(artist?.birthYear).toBe(1955)
    expect(artist?.exhibitions).toEqual(['2026 | 개인전 | 제7회'])
  })
})
