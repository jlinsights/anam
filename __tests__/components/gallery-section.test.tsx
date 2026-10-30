import { render, screen } from '@testing-library/react'
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
})
