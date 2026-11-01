import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ArtworkDetailPage } from '@/components/artwork-detail/ArtworkDetailPage'
import { GallerySection } from '@/components/single-page/GallerySection'
import { ContactForm } from '@/components/contact-form'
import { EnhancedArtistSection } from '@/components/single-page/EnhancedArtistSection'
import type { Artist, Artwork } from '@/lib/types'

// jsdom은 화면을 그리지 않으므로 색 대비는 여기서 검사되지 않는다(Lighthouse·Pa11y가 맡는다).
// 여기서는 구조: 이름 없는 링크·버튼, 라벨, 목록·ARIA 관계, 제목 순서를 본다.

function makeArtwork(number: number): Artwork {
  const n = String(number).padStart(2, '0')
  return {
    id: `art-${n}`,
    slug: n,
    title: `작품 ${n}`,
    year: 2024,
    medium: '화선지에 먹',
    dimensions: '35cm x 140cm',
    imageUrl: `/Images/Artworks/optimized/${n}/${n}-large.jpg`,
    available: number % 2 === 0,
  } as Artwork
}

const artworks = [1, 2, 3, 61].map(makeArtwork)

const artist: Artist = {
  id: 'anam',
  name: '아남 배옥영',
  bio: '서예가',
  exhibitions: ['2024 개인전'],
  awards: ['대상'],
}

describe('접근성: 주요 화면 구조', () => {
  it('작품 상세 페이지', async () => {
    const { container } = render(
      <ArtworkDetailPage
        artwork={artworks[1]}
        allArtworks={artworks}
        artist={artist}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('작품 목록은 grid 역할 없이 목록으로 읽힌다', async () => {
    const { container, getByRole } = render(
      <GallerySection artworks={artworks} onArtworkSelect={() => {}} />
    )
    expect(getByRole('list', { name: /작품 목록/ })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('문의 양식', async () => {
    const { container } = render(
      <ContactForm defaultSubject='「작품 01」 작품 문의' />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('작가 소개는 제목 단계를 건너뛰지 않는다', async () => {
    const { container } = render(
      <>
        <h1>작가</h1>
        <EnhancedArtistSection artist={artist} />
      </>
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
