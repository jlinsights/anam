import { generateMetadata } from '@/app/gallery/[slug]/page'
import { getArtworkBySlug } from '@/lib/artworks'

jest.mock('@/lib/artworks', () => ({
  getArtworkBySlug: jest.fn(),
  getArtworks: jest.fn(),
}))
jest.mock('@/lib/artist', () => ({ fetchArtist: jest.fn() }))
jest.mock('@/components/artwork-detail/ArtworkDetailPage', () => ({
  ArtworkDetailPage: () => null,
}))

const mockedGet = getArtworkBySlug as jest.Mock
const meta = (slug: string) =>
  generateMetadata({ params: Promise.resolve({ slug }) })

// 공유 미리보기(Open Graph) 이미지는 실제로 있는 잘리지 않은 full 파일과 그 크기를 쓴다.
// 예전 large(1200 정사각형)는 書境 2026 출품작(62~)에 없어 404 였고, 기존 작품도 잘려 있었다
describe('작품 상세 공유 이미지', () => {
  it('書境 출품작은 full 파일과 실제 크기를 쓴다', async () => {
    mockedGet.mockResolvedValue({
      slug: 'anam-99',
      title: '숲속의 노래',
      year: 2026,
    })
    const og = (await meta('anam-99')).openGraph as {
      images: { url: string; width: number; height: number }[]
    }
    expect(og.images[0]).toMatchObject({
      url: '/Images/Artworks/optimized/99/99-full.jpg',
      width: 1800,
      height: 602,
    })
  })

  it('기존 작품도 full 파일을 쓴다', async () => {
    mockedGet.mockResolvedValue({
      slug: 'anam-27',
      title: '영취산에 봄',
      year: 2024,
    })
    const og = (await meta('anam-27')).openGraph as {
      images: { url: string }[]
    }
    expect(og.images[0].url).toBe('/Images/Artworks/optimized/27/27-full.jpg')
  })

  it('이미지가 없는 작품은 다른 작품 그림을 대신 쓰지 않는다', async () => {
    mockedGet.mockResolvedValue({ slug: 'unknown', title: '무제', year: 2024 })
    const og = (await meta('unknown')).openGraph as { images?: unknown[] }
    expect(og.images ?? []).toHaveLength(0)
  })
})
