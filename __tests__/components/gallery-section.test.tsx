import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLayoutEffect } from 'react'
import { GallerySection } from '@/components/single-page/GallerySection'
import { useGalleryStore } from '@/lib/stores/gallery-store-safe'
import type { Artwork } from '@/lib/types'

function makeArtwork(
  id: string,
  year: number,
  medium = '화선지에 먹'
): Artwork {
  return {
    id,
    slug: `anam-${id}-${year}`,
    title: `작품 ${id}`,
    year,
    medium,
    dimensions: '70 x 140 cm',
    imageUrl: `/Images/Artworks/${id}.jpg`,
    number: Number(id),
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
    expect(await screen.findByText(/^2점/)).toBeInTheDocument()
  })

  it('스토어 동기화 전 첫 렌더에도 빈 결과를 보여주지 않는다', () => {
    const artworks = [makeArtwork('a', 2024), makeArtwork('b', 2023)]

    expect(renderFirstPaint(artworks)).toMatch(/^2점/)
  })

  it('동기화 전 첫 렌더에도 스토어에 남아 있는 필터를 적용한다', () => {
    const artworks = [makeArtwork('a', 2024), makeArtwork('b', 2023)]
    // 스토어는 페이지 이동 후에도 필터를 유지한다
    useGalleryStore.getState().setSelectedYear(2024)

    expect(renderFirstPaint(artworks)).toMatch(/^1점/)
  })

  it('작품을 잘리지 않은 미리보기 이미지와 실제 비율로 보여 준다', () => {
    render(
      <GallerySection
        artworks={[makeArtwork('35', 2024)]}
        onArtworkSelect={() => {}}
      />
    )
    const img = screen.getByRole('img', { name: /작품 35/ })
    expect(img.getAttribute('src')).toMatch(/35-preview\.jpg$/)
    expect(Number(img.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(img.getAttribute('height'))).toBeGreaterThan(0)
  })

  // jest.setup 이 framer-motion 을 가짜로 바꿔 렌더로는 잡을 수 없어 소스를 본다
  it('스크롤할 때 나타나는 등장 효과(whileInView)를 쓰지 않는다', () => {
    const fs = jest.requireActual('fs') as typeof import('fs')
    const path = jest.requireActual('path') as typeof import('path')
    const src = fs.readFileSync(
      path.join(process.cwd(), 'components/single-page/GallerySection.tsx'),
      'utf8'
    )
    expect(src).not.toMatch(/whileInView|framer-motion/)
  })

  // 흰 한지 위 text-ink-light 는 4.75:1, /70 을 섞으면 2.72:1 로 AA(4.5:1) 미달(Codex 리뷰 #27 과 같은 문제)
  it('검색창 자리 표시 글자에 투명도를 섞지 않는다', () => {
    const fs = jest.requireActual('fs') as typeof import('fs')
    const path = jest.requireActual('path') as typeof import('path')
    const src = fs.readFileSync(
      path.join(process.cwd(), 'components/single-page/GallerySection.tsx'),
      'utf8'
    )
    expect(src).not.toMatch(/placeholder:text-[\w-]+\/\d+/)
  })

  it('연도 단추로 바로 거르고 "전체"로 되돌린다', async () => {
    const user = userEvent.setup()
    render(
      <GallerySection
        artworks={[makeArtwork('1', 2024), makeArtwork('2', 2023)]}
        onArtworkSelect={() => {}}
      />
    )
    await user.click(screen.getByRole('button', { name: '2023' }))
    expect(screen.getByRole('button', { name: '2023' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(await screen.findByText(/^1점/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '전체' }))
    expect(await screen.findByText(/^2점/)).toBeInTheDocument()
  })

  it('재료 단추로 거른다(연도가 하나뿐이면 연도 단추는 숨긴다)', async () => {
    const user = userEvent.setup()
    render(
      <GallerySection
        artworks={[
          makeArtwork('1', 2024, '화선지'),
          makeArtwork('2', 2024, '화선지'),
          makeArtwork('3', 2024, '광목'),
        ]}
        onArtworkSelect={() => {}}
      />
    )
    expect(screen.queryByRole('group', { name: '제작 연도' })).toBeNull()
    await user.click(screen.getByRole('button', { name: /광목/ }))
    expect(await screen.findByText(/^1점 찾음/)).toBeInTheDocument()
  })

  // 모바일에서 61점을 한 번에 내리면 10,000px 가 넘는다. 24점씩 보여 주고 이어서 본다
  it('처음에는 24점만 보여 주고 "더 보기"로 이어서 보여 준다', async () => {
    const user = userEvent.setup()
    const many = Array.from({ length: 30 }, (_, i) =>
      makeArtwork(String(i + 1), 2024)
    )
    render(<GallerySection artworks={many} onArtworkSelect={() => {}} />)
    expect(await screen.findAllByRole('listitem')).toHaveLength(24)
    await user.click(screen.getByRole('button', { name: /더 보기 · 6점 남음/ }))
    expect(screen.getAllByRole('listitem')).toHaveLength(30)
    expect(screen.queryByRole('button', { name: /더 보기/ })).toBeNull()
    // 새로 나온 첫 작품으로 초점을 옮겨 키보드로 이어 볼 수 있다
    expect(screen.getByRole('link', { name: /작품 25/ })).toHaveFocus()
  })
})

