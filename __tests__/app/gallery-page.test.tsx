import { render, screen } from '@testing-library/react'
import GalleryPage from '@/app/gallery/page'
import { useGalleryStore } from '@/lib/stores/gallery-store-safe'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// /gallery 는 클라이언트 페이지다. 예전에는 브라우저에서 getArtworks() 를 불렀고, 브라우저에는
// Supabase·Airtable 키가 없어 늘 지어낸 작품 61점('Harmony' 2021 Ink on paper …)이 나왔다
// (라이브에서 확인, 2026-11-01). 서버 API 의 실제 작품을 보여 주고, 실패하면 오류를 보여야 한다
const originalFetch = global.fetch

beforeEach(() => {
  useGalleryStore.getState().reset()
})
afterEach(() => {
  global.fetch = originalFetch
})

function mockApi(status: number, data: unknown) {
  global.fetch = jest.fn(
    async () =>
      new Response(JSON.stringify({ success: status === 200, data }), {
        status,
        headers: { 'content-type': 'application/json' },
      })
  ) as unknown as typeof fetch
}

describe('/gallery', () => {
  it('서버 API(/api/artworks)의 실제 작품을 보여 준다', async () => {
    mockApi(200, [
      {
        id: 'rec1',
        slug: 'anam-35',
        title: '남도의 아침 Ⅱ',
        year: 2024,
        medium: '화선지',
        dimensions: '70 x 140 cm',
        imageUrl: '/Images/Artworks/anam-35.jpg',
      },
    ])

    render(<GalleryPage />)

    expect(await screen.findByText('남도의 아침 Ⅱ')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/artworks',
      expect.anything()
    )
    expect(screen.queryByText(/^Harmony$/)).not.toBeInTheDocument()
  })

  it('API 가 실패하면 지어낸 작품 대신 오류를 보여 준다', async () => {
    mockApi(503, null)

    render(<GalleryPage />)

    expect(
      await screen.findByText('갤러리 로딩 중 오류가 발생했습니다')
    ).toBeInTheDocument()
    expect(screen.queryByText(/^Harmony$/)).not.toBeInTheDocument()
  })
})
