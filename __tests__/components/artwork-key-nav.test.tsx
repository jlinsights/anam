import { fireEvent, render } from '@testing-library/react'
import { ArtworkKeyNav } from '@/components/artwork-detail/ArtworkKeyNav'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

beforeEach(() => push.mockClear())

describe('ArtworkKeyNav', () => {
  it('← → 키로 이전·다음 작품으로 간다', () => {
    render(
      <ArtworkKeyNav
        previousHref='/gallery/anam-34'
        nextHref='/gallery/anam-36'
      />
    )
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(push.mock.calls).toEqual([
      ['/gallery/anam-36'],
      ['/gallery/anam-34'],
    ])
  })

  it('입력 칸에 초점이 있거나 보조키를 누르면 가로채지 않는다', () => {
    const { container } = render(
      <>
        <input aria-label='검색' />
        <ArtworkKeyNav previousHref={null} nextHref='/gallery/anam-36' />
      </>
    )
    const input = container.querySelector('input')!
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight', metaKey: true })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(push).not.toHaveBeenCalled()
  })

  it('이웃 작품의 큰 이미지를 미리 받아 둔다', () => {
    render(
      <ArtworkKeyNav
        previousHref={null}
        nextHref='/gallery/anam-36'
        prefetchImages={['/Images/Artworks/optimized/36/36-full.jpg']}
      />
    )
    const link = document.head.querySelector(
      'link[rel="prefetch"][href="/Images/Artworks/optimized/36/36-full.jpg"]'
    )
    expect(link).not.toBeNull()
  })

  it('데이터 절약 모드에서는 미리 받지 않는다', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    })
    render(
      <ArtworkKeyNav
        previousHref={null}
        nextHref='/gallery/anam-37'
        prefetchImages={['/Images/Artworks/optimized/37/37-full.jpg']}
      />
    )
    expect(document.head.querySelector('link[href$="37-full.jpg"]')).toBeNull()
    delete (navigator as unknown as { connection?: unknown }).connection
  })
})
