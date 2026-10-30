import { render, screen } from '@testing-library/react'
import { useLayoutEffect } from 'react'
import { GallerySection } from '@/components/single-page/GallerySection'
import { useGalleryStore } from '@/lib/stores/gallery-store-safe'
import type { Artwork } from '@/lib/types'

function makeArtwork(id: string, year: number): Artwork {
  return {
    id,
    slug: `anam-${id}-${year}`,
    title: `작품 ${id}`,
    year,
    medium: '화선지에 먹',
    dimensions: '70 x 140 cm',
    imageUrl: `/Images/Artworks/${id}.jpg`,
  } as Artwork
}

// 형제의 layout effect는 첫 커밋 직후, 스토어 동기화 useEffect보다 먼저 돈다: 첫 페인트의 결과 문구를 잡는다
function renderFirstPaint(artworks: Artwork[]): string {
  let firstStatus = ''
  function FirstPaintProbe() {
    useLayoutEffect(() => {
      firstStatus = document.querySelector('[role=status]')?.textContent ?? ''
    }, [])
    return null
  }
  render(
    <>
      <GallerySection artworks={artworks} onArtworkSelect={() => {}} />
      <FirstPaintProbe />
    </>
  )
  return firstStatus.trim()
}

beforeEach(() => {
  useGalleryStore.getState().reset()
})

describe('GallerySection', () => {
  it('props로 받은 작품을 그리드에 표시한다', async () => {
    const artworks = [makeArtwork('a', 2024), makeArtwork('b', 2023)]

    render(<GallerySection artworks={artworks} onArtworkSelect={() => {}} />)

    // /gallery 페이지는 스토어를 채우지 않으므로 GallerySection이 props를 스토어로 옮겨야 한다
    expect(await screen.findByText(/^2개 작품/)).toBeInTheDocument()
  })

  it('스토어 동기화 전 첫 렌더에도 빈 결과를 보여주지 않는다', () => {
    const artworks = [makeArtwork('a', 2024), makeArtwork('b', 2023)]

    expect(renderFirstPaint(artworks)).toMatch(/^2개 작품/)
  })

  it('동기화 전 첫 렌더에도 스토어에 남아 있는 필터를 적용한다', () => {
    const artworks = [makeArtwork('a', 2024), makeArtwork('b', 2023)]
    // 스토어는 페이지 이동 후에도 필터를 유지한다
    useGalleryStore.getState().setSelectedYear(2024)

    expect(renderFirstPaint(artworks)).toMatch(/^1개 작품/)
  })
})
